#!/usr/bin/env node
/**
 * check-cms-zones — détecte les zones CMS que plus rien n'affiche.
 *
 * Pendant, le CMS a laissé croire qu'on pilotait des contenus qui n'étaient
 * jamais rendus : zones rattachées à une page supprimée, clé stockée sous un
 * nom que le code ne lit pas (`hero_subtitle` côté base, `hero_text` côté
 * code), ou composant qui n'a jamais été câblé. Rien ne le signalait : une zone
 * non lue produit exactement le même écran qu'une zone lue dont la valeur est
 * identique au fallback.
 *
 * Ce script est le pendant de check-cms-drift.mjs, qui fait le même travail
 * pour les tables. Il croise les zones actives en base avec ce que le code lit
 * réellement, par les trois chemins existants :
 *
 *   1. <Editable(?:Zone|Icon) page="x" zone="y">        (littéral ou template)
 *   2. getCmsOrSetting('zone_key', ...)        (indexé par zone_key nu)
 *   3. getZoneLinks('prefix', ...)             (paires prefix_<n>_label/_url)
 *
 * Limite assumée : `zone={s.zone}` — une variable simple — n'est pas résoluble
 * statiquement. Les pages concernées sont signalées « indéterminé » plutôt que
 * comptées orphelines, pour ne pas produire de faux positif. C'est exactement
 * ce qui m'a fait annoncer à tort `contact.service_1` comme orpheline.
 *
 * Usage :
 *   node scripts/check-cms-zones.mjs
 *
 * Sortie : exit 1 si une zone orpheline apparaît sur une page NON listée dans
 * KNOWN_ORPHAN_PAGES. Les pages déjà inventoriées ne cassent pas le run.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['app', 'components', 'lib', 'hooks'];
const EXTS = new Set(['.ts', '.tsx']);

/** Nombre d'entrées explorées pour un menu indexé (cf. getZoneLinks). */
const MAX_LINK_ITEMS = 12;

/**
 * Pages dont les zones orphelines sont connues et acceptées à ce jour.
 * Elles seront traitées par les sous-lots suivants du chantier « zones
 * orphelines ». Retirer une page d'ici dès qu'elle est câblée — le script
 * signalera alors toute régression.
 */
/**
 * Pages tolérées en l'état, malgré des zones orphelines.
 *
 * Vide : l'inventaire de départ — 151 zones actives qu'aucun composant ne
 * lisait — est résorbé. Toute orpheline détectée est donc désormais une
 * régression, et fait échouer la vérification.
 *
 * N'ajouter une page ici qu'avec la raison, et en sachant que cela rouvre
 * l'angle mort que ce script existe pour fermer.
 */
const KNOWN_ORPHAN_PAGES = new Set([]);

function readEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try { raw = readFileSync(f, 'utf8'); break; } catch {}
  }
  const get = (k) => {
    if (process.env[k]) return process.env[k];
    const m = raw.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };
  const url = get('NEXT_PUBLIC_SUPABASE_URL');
  const key = get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL et une clé Supabase sont requis.');
    // Aucune requête n'a encore été lancée : sortir ici est sans risque.
    process.exit(2);
  }
  return { url, key };
}

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p))) out.push(p);
  }
  return out;
}

/** Ce que le code sait lire, tous chemins confondus. */
function collectReaders() {
  const exact = new Set();          // "page__zone_key"
  const patterns = new Map();       // page -> [RegExp]
  const globalKeys = new Set();     // clés lues par zone_key nu
  const unresolved = new Map();     // page -> Set<fichier>

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');

      // 0. Page du fichier quand elle est portée par une constante.
      //    Les pages de destination écrivent `const PAGE = 'destinations-alentejo'`
      //    puis `<Editable(?:Zone|Icon) page={PAGE} …>`. Sans résoudre cette constante,
      //    le fichier semble ne lire aucune zone et TOUTES les zones de la page
      //    ressortent orphelines — 926 faux positifs sur 46 pages au 01/08.
      //    À défaut de constante, on déduit la page des <Editable(?:Zone|Icon)> du
      //    fichier — mais seulement s'ils désignent tous la même. Trois pages
      //    (contact, home, mentions-legales) déclarent leurs clés dans un
      //    tableau (`{ zone: 'service_1', … }`) puis les rendent via la
      //    variable : la passe 0 quater sait les lire, mais elle était inhibée
      //    faute de `const PAGE`. Leurs 19 zones restaient « indéterminées »,
      //    c'est-à-dire de statut inconnu — ni confirmées, ni infirmées.
      //
      //    Exiger la constante n'avait pas de sens : ce qui compte est la page
      //    que le fichier adresse, pas la façon dont il l'écrit. On déduit donc,
      //    et on s'abstient dès qu'il y a ambiguïté.
      const pageConst = src.match(/const\s+PAGE\s*=\s*['"]([a-z0-9-]+)['"]/);
      let filePage = pageConst ? pageConst[1] : null;
      if (!filePage) {
        const literals = new Set(
          [...src.matchAll(/<Editable(?:Zone|Icon)\s+page="([^"]+)"/g)].map((m) => m[1])
        );
        if (literals.size === 1) filePage = [...literals][0];
      }

      // 0 bis. Helper local de zone : `const Z = (zone: string, type, fallback)`
      //    appelé en `Z('hero_title', …)`. Même rôle que <Editable(?:Zone|Icon)>, mais
      //    invisible pour la regex JSX. On accepte `zone` comme `zoneKey`.
      if (filePage) {
        const helpers = new Set();
        for (const m of src.matchAll(
          /(?:const|function)\s+(\w+)\s*=?\s*\(\s*zone\s*:/g
        )) helpers.add(m[1]);
        for (const name of helpers) {
          // a. clé littérale : Z('hero_title', …)
          for (const m of src.matchAll(new RegExp(`\\b${name}\\(\\s*['"]([a-z0-9_]+)['"]`, 'g'))) {
            exact.add(`${filePage}__${m[1]}`);
          }
          // b. clé construite : Z(opt.zone + '_emoji'), Z('profile_' + r + '_title'),
          //    Z(`profile_${r}_title`). La partie variable n'est pas résoluble,
          //    mais les fragments littéraux le sont : on en fait un motif
          //    ancré, ^profile_.+_title$ par exemple.
          //
          //    Sans cette passe, les 47 zones de travel-planning-form et les 60
          //    du quiz passaient pour orphelines alors que les pages les
          //    affichent.
          const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          for (const m of src.matchAll(new RegExp(`\\b${name}\\(\\s*([^,]+),`, 'g'))) {
            const arg = m[1].trim();
            if (/^['"][a-z0-9_]+['"]$/.test(arg)) continue;  // littéral pur : déjà traité
            const frags = [
              ...[...arg.matchAll(/['"]([a-z0-9_]+)['"]/g)].map((x) => x[1]),
              ...[...arg.matchAll(/`([^`]+)`/g)].flatMap((x) =>
                x[1].split(/\$\{[^}]+\}/).filter(Boolean)
              ),
            ];
            if (!frags.length) continue;
            const head = arg.match(/^\s*['"`]/) ? '^' : '^.+';
            const tail = /['"`]\s*$/.test(arg) ? '$' : '.+$';
            if (!patterns.has(filePage)) patterns.set(filePage, []);
            patterns.get(filePage).push(new RegExp(head + frags.map(esc).join('.+') + tail));
          }
        }

        // 0 quater. Clé déclarée dans un objet, puis rendue via la variable :
        //     const FAQ = [{ q: { zone: "faq_1_q", fb: "…" }, … }]
        //     … {Z(item.q.zone, 'text', item.q.fb)}
        //   L'appel n'est pas résoluble, mais la déclaration l'est.
        for (const m of src.matchAll(/\bzone:\s*['"]([a-z0-9_]+)['"]/g)) {
          exact.add(`${filePage}__${m[1]}`);
        }
      }

      // 0 quinquies. useZoneTexts(PAGE | 'page', { cle: 'repli', … }) — textes
      //   qu'un <EditableZone> ne peut pas envelopper (placeholder, états d'un
      //   bouton, écran de confirmation), inscrits dans la barre latérale.
      //   Les clés sont les propriétés de l'objet.
      for (const m of src.matchAll(/useZoneTexts\(\s*(?:['"]([a-z0-9-]+)['"]|PAGE)\s*,\s*\{([^]*?)\}\s*\)/g)) {
        const page = m[1] || filePage;
        if (!page) continue;
        for (const k of m[2].matchAll(/^\s*([a-z0-9_]+)\s*:/gm)) exact.add(`${page}__${k[1]}`);
      }

      // 0 ter. buildPageMetadata('page', …) consomme trois zones SEO par page.
      //    Le premier argument peut être la constante PAGE du fichier.
      if (filePage && /buildPageMetadata\(\s*PAGE\b/.test(src)) {
        for (const k of ['seo_title', 'seo_description', 'seo_og_image']) {
          exact.add(`${filePage}__${k}`);
        }
      }
      //    Introduit le 01/08 pour piloter title/description depuis le CMS.
      for (const m of src.matchAll(/buildPageMetadata\(\s*['"]([a-z0-9-]+)['"]/g)) {
        for (const k of ['seo_title', 'seo_description', 'seo_og_image']) {
          exact.add(`${m[1]}__${k}`);
        }
      }

      // 1. <Editable(?:Zone|Icon) page="x" zone=...>
      for (const m of src.matchAll(
        /<Editable(?:Zone|Icon)\s+page="([^"]+)"\s+zone=(?:"([^"]+)"|\{`([^`]+)`\}|\{([^}]+)\})/g
      )) {
        const [, page, literal, template, expression] = m;
        if (literal) {
          exact.add(`${page}__${literal}`);
        } else if (template) {
          // "`${x.zone}_title`" -> /^.+_title$/
          const lit = template.replace(/\$\{[^}]+\}/g, ' ');
          const parts = lit.split(' ').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          if (!patterns.has(page)) patterns.set(page, []);
          patterns.get(page).push(new RegExp('^' + parts.join('.+') + '$'));
        } else if (expression) {
          // `zone={s.zone}` : non résoluble statiquement.
          if (!unresolved.has(page)) unresolved.set(page, new Set());
          unresolved.get(page).add(file);
        }
      }

      // 2. getCmsOrSetting('zone_key', ...) — l'appel s'écrit souvent sur
      //    plusieurs lignes, la clé n'est donc pas sur la même ligne que le nom.
      for (const m of src.matchAll(/getCmsOrSetting\(\s*['"]([^'"]+)['"]/g)) {
        globalKeys.add(m[1]);
      }

      // 2 bis. Enveloppes locales. Plusieurs composants définissent leur propre
      //   accesseur — `function cz(zoneKey, fallback)`, `const val = (zoneKey,
      //   fallback) => …` — qui lit la map de zones directement. Sans cette
      //   passe, leurs clés passaient pour orphelines : c'est ce qui m'a fait
      //   compter à tort 18 orphelines sur la page 'global'.
      //   Convention retenue : premier paramètre nommé `zoneKey`.
      const accessors = new Set();
      for (const m of src.matchAll(
        /(?:function\s+(\w+)\s*\(\s*zoneKey|const\s+(\w+)\s*=\s*\(?\s*zoneKey)/g
      )) {
        accessors.add(m[1] || m[2]);
      }
      for (const name of accessors) {
        const re = new RegExp(`\\b${name}\\(\\s*['"]([^'"]+)['"]`, 'g');
        for (const m of src.matchAll(re)) globalKeys.add(m[1]);
      }

      // 3. getZoneLinks('prefix', ...) -> prefix_<n>_label / prefix_<n>_url
      for (const m of src.matchAll(/getZoneLinks\(\s*['"]([^'"]+)['"]/g)) {
        for (let i = 1; i <= MAX_LINK_ITEMS; i++) {
          globalKeys.add(`${m[1]}_${i}_label`);
          globalKeys.add(`${m[1]}_${i}_url`);
        }
      }
    }
  }

  // 4. Composants partagés paramétrés par la page.
  //
  //    SubDestinationTemplate lit `<Editable(?:Zone|Icon) page={page} zone="intro_text">`
  //    et reçoit `page="destinations-colombie-bogota"` de chaque page qui
  //    l'utilise. Les zones sont donc bien rendues, mais la regex ne peut pas
  //    les rattacher : `page` est une variable dans le composant, et les clés
  //    sont absentes du fichier de la page.
  //
  //    Sans cette passe, TOUTES les zones des pages construites sur un template
  //    partagé ressortent orphelines — 651 faux positifs au 01/08, alors que la
  //    production les affiche correctement.
  //
  //    On relie donc : composant -> clés qu'il lit, puis page -> composant.
  const templateZones = new Map();   // NomComposant -> { keys:Set, patterns:[] }
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');
      const name = file.split(/[\\/]/).pop().replace(/\.tsx?$/, '');
      const keys = new Set();
      const pats = [];
      // `page={page}` — variable simple — ou `page={`destinations-${slug}`}`,
      // un gabarit dont le point d'appel fournit la variable (slug="grece").
      let pageTpl = null, pageVar = null;
      for (const m of src.matchAll(
        /<Editable(?:Zone|Icon)[^>]*?page=\{(?:([a-zA-Z_$][\w$]*)|`([^`]+)`)\}[^>]*?zone=(?:"([^"]+)"|\{`([^`]+)`\})/gs
      )) {
        if (m[2]) {
          const v = m[2].match(/\$\{\s*([a-zA-Z_$][\w$]*)\s*\}/);
          if (v) { pageTpl = m[2]; pageVar = v[1]; }
        }
        if (m[3]) keys.add(m[3]);
        else if (m[4]) {
          const lit = m[4].replace(/\$\{[^}]+\}/g, ' ');
          const parts = lit.split(' ').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          pats.push(new RegExp('^' + parts.join('.+') + '$'));
        }
      }
      // Accesseur local indexant la carte des zones :
      //   const val = (key: string, fallback: string) => zones[`${page}__${key}`]
      // DaySummaryTable lit ainsi day_N_activity et day_N_accommodation. Cinq
      // corrections successives avaient chacune ciblé un nom de paramètre
      // (`zoneKey`, `zone`, `key`) ; on détecte désormais le comportement — une
      // fonction dont le corps indexe `zones[` — plutôt que la convention.
      const zoneAccessors = new Set();
      for (const m of src.matchAll(/(?:const|function)\s+(\w+)\s*=?\s*\(\s*(\w+)\s*:\s*string/g)) {
        const after = src.slice(m.index, m.index + 200);
        if (/zones\s*\[/.test(after)) zoneAccessors.add(m[1]);
      }
      for (const acc of zoneAccessors) {
        for (const m of src.matchAll(new RegExp(`\\b${acc}\\(\\s*([^,]+),`, 'g'))) {
          const arg = m[1].trim();
          const pure = arg.match(/^['"]([a-z0-9_]+)['"]$/);
          if (pure) { keys.add(pure[1]); continue; }
          const frags = [
            ...[...arg.matchAll(/['"]([a-z0-9_]+)['"]/g)].map((x) => x[1]),
            ...[...arg.matchAll(/`([^`]+)`/g)].flatMap((x) =>
              x[1].split(/\$\{[^}]+\}/).filter(Boolean)
            ),
          ];
          if (!frags.length) continue;
          const head = arg.match(/^\s*['"`]/) ? '^' : '^.+';
          const tail = /['"`]\s*$/.test(arg) ? '$' : '.+$';
          pats.push(new RegExp(head + frags.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+') + tail));
        }
      }

      if (keys.size || pats.length) templateZones.set(name, { keys, pats, pageTpl, pageVar });
    }
  }

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');
      for (const [comp, { keys, pats, pageTpl, pageVar }] of templateZones) {
        // Le composant nomme sa page par un gabarit : on la reconstruit depuis
        // la prop du point d'appel — <ComingSoonDestination slug="grece" …>
        // avec page={`destinations-${slug}`} donne destinations-grece.
        if (pageTpl && pageVar) {
          const re = new RegExp(`<${comp}\\b[^>]*?\\b${pageVar}="([^"]+)"`, 'gs');
          for (const m of src.matchAll(re)) {
            const page = pageTpl.replace(/\$\{[^}]+\}/, m[1]);
            for (const k of keys) exact.add(`${page}__${k}`);
            if (pats.length) {
              if (!patterns.has(page)) patterns.set(page, []);
              patterns.get(page).push(...pats);
            }
          }
        }
        // <SubDestinationTemplate … page="destinations-colombie-bogota" …>
        const re = new RegExp(`<${comp}\\b[^>]*?page=(?:"([^"]+)"|\\{PAGE\\})`, 'gs');
        for (const m of src.matchAll(re)) {
          let page = m[1];
          if (!page) {
            const c = src.match(/const\s+PAGE\s*=\s*['"]([a-z0-9-]+)['"]/);
            page = c ? c[1] : null;
          }
          if (!page) continue;
          for (const k of keys) exact.add(`${page}__${k}`);
          if (pats.length) {
            if (!patterns.has(page)) patterns.set(page, []);
            patterns.get(page).push(...pats);
          }
        }
      }
    }
  }

  return { exact, patterns, globalKeys, unresolved };
}

/**
 * Déclaration publique des zones `global` (lib/public-global-zones.json).
 *
 * Le 25/10/2026, la liste blanche `CONSUMED_ZONE_KEYS` a été retirée de
 * `getGlobalZones()` : elle obligeait à modifier le code pour chaque zone créée
 * depuis le CMS, ce qui interdisait au propriétaire d'ajouter une entrée de menu
 * sans développeur. Mais elle portait une précaution réelle — ne pas sérialiser
 * dans le HTML public une valeur qu'aucun composant n'affiche (les résidus
 * « Monica Schneider » d'un ancien projet, restés lisibles par Googlebot).
 *
 * Le remplacement n'est donc pas « plus de filtre » mais « un filtre déclaré » :
 * `getGlobalZones()` n'écarte désormais que ce qui n'est ni déclaré public, ni
 * préfixé `_prive_`. La déclaration vit dans un JSON, seule forme lisible à la
 * fois par le module TypeScript et par ce script.
 *
 * Ce contrôle-ci est le garde-fou : il exige qu'une zone `global` active soit
 * **explicitement** publique, et fait échouer la vérification sinon. Sans lui, une
 * zone ajoutée depuis l'admin resterait silencieusement absente du HTML — le
 * symptôme exact que ce script existe pour rendre bruyant.
 */
function readDeclaration() {
  let raw;
  try {
    raw = readFileSync('lib/public-global-zones.json', 'utf8');
  } catch {
    return null;
  }
  try {
    const d = JSON.parse(raw);
    if (!d.privatePrefix || !Array.isArray(d.publicPrefixes) || !Array.isArray(d.publicKeys)) return null;
    return d;
  } catch {
    return null;
  }
}

const PREFIXE_RESERVE = '_prive_';

/** Zone au préfixe réservé : hors du rendu par convention, donc jamais orpheline. */
function estDeclareePrivee(zoneKey) {
  return zoneKey.startsWith(PREFIXE_RESERVE);
}

/** Une zone est-elle déclarée publiable ? (mêmes règles que lib/public-global-zones.ts) */
function estDeclareePublique(decl, zoneKey) {
  if (zoneKey.startsWith(decl.privatePrefix)) return true; // réservée : jamais rendue, mais assumée
  if (decl.publicKeys.includes(zoneKey)) return true;
  return decl.publicPrefixes.some((p) => zoneKey.startsWith(p));
}

const { url, key } = readEnv();
const readers = collectReaders();

/**
 * PostgREST plafonne une réponse à 1000 lignes par défaut, sans le signaler
 * autrement que par l'en-tête Content-Range. Sans pagination, le script
 * n'analysait que les 1000 premières zones sur 1813 : 813 échappaient au
 * contrôle, et le nombre d'orphelines annoncé était un plancher, pas un total.
 * On pagine donc explicitement.
 */
async function fetchZonesBatch(url, key, from, pageSize, essai = 1) {
  try {
    const headers = {
      apikey: key,
      Range: `${from}-${from + pageSize - 1}`,
    };
    if (key.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${key}`;
    }
    const res = await fetch(
      `${url}/rest/v1/cms_editable_zones?select=page,zone_key,value&is_active=eq.true&order=page,zone_key`,
      { headers }
    );
    if (!res.ok) {
      if (res.status >= 500 && essai < 3) {
        await new Promise((r) => setTimeout(r, 400 * essai));
        return fetchZonesBatch(url, key, from, pageSize, essai + 1);
      }
      return { ok: false, status: res.status };
    }
    const batch = await res.json();
    return { ok: true, batch };
  } catch (e) {
    if (essai < 3) {
      await new Promise((r) => setTimeout(r, 400 * essai));
      return fetchZonesBatch(url, key, from, pageSize, essai + 1);
    }
    return { ok: false, error: e };
  }
}

const PAGE_SIZE = 1000;
const rows = [];
let ok = true;
for (let from = 0; ; from += PAGE_SIZE) {
  const result = await fetchZonesBatch(url, key, from, PAGE_SIZE);
  if (!result.ok) {
    console.error(
      `✗ Lecture de cms_editable_zones impossible (${result.status ? `HTTP ${result.status}` : result.error?.message || 'erreur réseau'}).`
    );
    // À partir d'ici on ne sort plus avec process.exit() : le client fetch garde
    // un handle ouvert et Node l'interrompt par une assertion libuv sous Windows.
    // On positionne le code de sortie et on laisse le processus se terminer seul.
    process.exitCode = 2;
    ok = false;
    break;
  }
  rows.push(...result.batch);
  if (result.batch.length < PAGE_SIZE) break;
}
if (!ok) rows.length = 0;

/**
 * Zones compagnes d'une image : `<zone>_fit`, `<zone>_ratio`, `<zone>_position`.
 *
 * `EditableZone` (type `image`) lit ces trois clés en plus de la sienne, pour
 * régler le cadrage depuis le CMS. Le motif `<zone>_<n>_label` des menus ne les
 * couvre pas : sans cette reconnaissance, toute zone de cadrage renseignée
 * passerait pour orpheline et ferait échouer le contrôle.
 */
const IMAGE_COMPANION = /^(.+)_(?:fit|ratio|position)$/;

function isRead(page, zoneKey) {
  // Zone au prefixe reserve : volontairement hors du rendu (brouillon, residu,
  // archive). Ce n'est pas une orpheline — l'exclusion est assumee — mais elle
  // reste soumise au controle des zones publiables plus bas.
  if (page === 'global' && estDeclareePrivee(zoneKey)) return true;
  if (readers.exact.has(`${page}__${zoneKey}`)) return true;
  if (readers.globalKeys.has(zoneKey)) return true;
  if ((readers.patterns.get(page) || []).some((rx) => rx.test(zoneKey))) return true;

  const companion = zoneKey.match(IMAGE_COMPANION);
  if (companion && isRead(page, companion[1])) return true;

  return false;
}

const decl = readDeclaration();

const orphans = [];
const indeterminate = [];
for (const r of rows) {
  if (isRead(r.page, r.zone_key)) continue;
  if (readers.unresolved.has(r.page)) indeterminate.push(r);
  else orphans.push(r);
}

console.log(
  ok
    ? `Zones actives en base : ${rows.length}`
    : '? Zones actives en base : INCONNU — la lecture a échoué, aucune conclusion.'
);
console.log(`Clés lues par le code : ${readers.exact.size} exactes, ${readers.globalKeys.size} globales, ${[...readers.patterns.values()].flat().length} motifs\n`);

// ─── Zones `global` actives non déclarées publiques ─────────────────────────
// `getGlobalZones()` ne sert que les zones déclarées dans
// lib/public-global-zones.json (préfixe de famille, clé exacte) — les autres sont
// écartées du HTML sans bruit. Une zone ajoutée depuis l'admin et non déclarée
// serait donc éditable, renseignée, et invisible : le symptôme est indiscernable
// d'un contenu volontairement laissé au fallback. On exige une déclaration
// explicite plutôt que de la publier en silence.
//
// Le préfixe réservé `_prive_` est le moyen d'assumer l'exclusion : une zone qui
// le porte est volontairement hors du rendu (brouillon, résidu, archive).
if (ok && decl === null) {
  console.log('✗ lib/public-global-zones.json absent ou illisible — contrôle des zones publiables impossible.\n');
  process.exitCode = 1;
} else if (ok) {
  const globalActives = rows.filter((r) => r.page === 'global');
  const nonDeclarees = globalActives
    .filter((r) => !estDeclareePublique(decl, r.zone_key))
    .map((r) => r.zone_key)
    .sort();

  if (nonDeclarees.length) {
    console.log(`✗ ${nonDeclarees.length} zone(s) global active(s) NON déclarée(s) publique(s) :`);
    for (const k of nonDeclarees) console.log(`    ${k}`);
    console.log('\nCes zones ne sont PAS rendues (getGlobalZones les écarte) et personne ne le signale.');
    console.log('Corriger, au choix :');
    console.log('  - les déclarer dans lib/public-global-zones.json (préfixe de famille ou clé exacte) ;');
    console.log(`  - les renommer avec le préfixe réservé \`${decl.privatePrefix}\` si elles doivent rester hors du rendu.`);
    process.exitCode = 1;
  } else {
    console.log(`✓ Zones global : ${globalActives.length} active(s), toutes déclarées publiques ou réservées.`);
  }
}

if (indeterminate.length) {
  const pages = [...new Set(indeterminate.map((r) => r.page))];
  console.log(`? ${indeterminate.length} zone(s) indéterminée(s) — la page utilise zone={variable}, non résoluble :`);
  for (const p of pages) {
    console.log(`    ${p} (${indeterminate.filter((r) => r.page === p).length})`);
    for (const f of readers.unresolved.get(p)) console.log(`        ${f}`);
  }
  console.log('');
}

if (orphans.length === 0) {
  // Sans lecture, `rows` a ete vide (ligne « if (!ok) rows.length = 0 ») et il
  // n'y a donc aucun orphelin a trouver. Afficher « ✓ Aucune zone orpheline » ferait
  // passer un controle qui n'a rien pu lire pour un controle reussi : c'est le
  // faux vert que ce projet traque partout. On dit l'incertitude.
  if (!ok) {
    console.log('? Zones orphelines : INCONNU — la lecture a échoué, rien n\'a été vérifié.');
  } else {
    console.log('✓ Aucune zone orpheline. Tout ce qui est actif est rendu quelque part.');
  }
} else {
  const byPage = new Map();
  for (const r of orphans) {
    if (!byPage.has(r.page)) byPage.set(r.page, []);
    byPage.get(r.page).push(r.zone_key);
  }

  const knownPages = [...byPage.keys()].filter((p) => KNOWN_ORPHAN_PAGES.has(p)).sort();
  const newPages = [...byPage.keys()].filter((p) => !KNOWN_ORPHAN_PAGES.has(p)).sort();

  if (knownPages.length) {
    const total = knownPages.reduce((n, p) => n + byPage.get(p).length, 0);
    console.log(`⚠ ${total} zone(s) orpheline(s) sur ${knownPages.length} page(s) déjà inventoriée(s) :`);
    for (const p of knownPages) console.log(`    ${p} (${byPage.get(p).length})`);
  }

  if (newPages.length) {
    console.log('\n✗ ORPHELINES NOUVELLES — éditables au CMS, rendues nulle part :');
    for (const p of newPages) {
      console.log(`    ${p}`);
      for (const k of byPage.get(p)) console.log(`        ${k}`);
    }
    console.log('\nSoit la zone doit être câblée dans le composant, soit désactivée en base.');
    process.exitCode = 1;
  } else {
    console.log('\n✓ Aucune orpheline nouvelle.');
  }
}

  // ─── Zones actives mais VIDES ──────────────────────────────────────────────
  //
  // Une zone active dont la valeur est une chaîne vide est un piège : le
  // composant calcule `zones[zoneKey] ?? fallback`, et `''` n'est pas `null` —
  // le fallback ne joue donc PAS. Le bloc s'affiche titré mais sans corps
  // (« Notre conseil » suivi du vide). Seule une valeur `NULL` laisse le
  // fallback reprendre la main.
  //
  // Constat du 2026-10-23 : 37 zones actives à valeur vide, dont 23 `local_tip`
  // (un bloc « Notre conseil » vide sur 23 pages) et 3 `day_N_accommodation`,
  // toutes produites par les générateurs de zones (generate-subdest-cms.mjs,
  // generate-itineraries-cms.mjs), corrigés depuis.
  if (ok) {
    const vides = rows.filter((r) => r.value !== null && String(r.value).trim() === '');

    if (vides.length === 0) {
      console.log('\n✓ Aucune zone active à valeur vide.');
    } else {
      const parPage = new Map();
      for (const r of vides) {
        if (!parPage.has(r.page)) parPage.set(r.page, []);
        parPage.get(r.page).push(r.zone_key);
      }
      console.log(`\n✗ ${vides.length} zone(s) active(s) à VALEUR VIDE sur ${parPage.size} page(s) :`);
      for (const [p, keys] of [...parPage.entries()].sort()) {
        console.log(`    ${p} (${keys.length}) : ${keys.join(', ')}`);
      }
      console.log('\nLe fallback du composant ne joue pas sur une chaîne vide (`?? `).');
      console.log('Pour retirer une zone, la passer en `is_active = false` — pas en valeur vide.');
      process.exitCode = 1;
    }
  }
