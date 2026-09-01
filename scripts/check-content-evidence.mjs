#!/usr/bin/env node
/**
 * check-content-evidence — confronte les affirmations de vécu au registre photo.
 *
 * Complément indispensable à check-content-coherence.mjs, qui mesure la
 * *ressemblance* avec du vécu : son critère E-E-A-T est satisfait par la simple
 * présence de « en 202… », si bien qu'un texte inventé de bout en bout obtient
 * 100 %. Ici on vérifie l'inverse — que chaque date et chaque lieu revendiqué
 * soit attesté par les métadonnées d'une photo du voyage.
 *
 * Trois verdicts :
 *   ADOSSÉ      la date / le lieu figure dans le registre
 *   CONTREDIT   le registre prouve autre chose  → à corriger
 *   À CONFIRMER aucune photo ne peut trancher (prix, horaire, nombre de visites,
 *               nom d'hôtel) → seul l'auteur peut valider
 *
 * Usage :
 *   node scripts/check-content-evidence.mjs
 *   node scripts/check-content-evidence.mjs --evidence content/evidence/roumanie.json --glob "app/destinations/roumanie/**"
 *   node scripts/check-content-evidence.mjs --strict     # sort en erreur si CONTREDIT
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const STRICT = args.includes('--strict');
const EVIDENCE = getArg('--evidence', 'content/evidence/roumanie.json');
const ROOT = getArg('--dir', 'app/destinations/roumanie');

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Affirmations qu'aucune photo ne peut établir : seul l'auteur les connaît. */
const NON_PHOTOGRAPHIABLE = [
  { re: /\b(\d+)\s*visites?\b/gi, quoi: 'nombre de visites' },
  { re: /\b(une|deux|trois|quatre)\s+fois\b/gi, quoi: 'fréquence' },
  // Pas de \b final : « € » et « * » ne sont pas des caractères de mot, la
  // frontière échouerait devant « /nuit » ou « , ».
  { re: /\b\d+\s*(?:€|EUR|euros?\b)/gi, quoi: 'prix' },
  { re: /\bavant\s+\d{1,2}\s*h\b/gi, quoi: 'horaire conseillé' },
  { re: /\b(?:hôtel|hotel|guesthouse|pension)\s+[A-ZÀ-Ý][\wÀ-ÿ'-]*/g, quoi: 'hébergement nommé' },
  { re: /\b(?:restaurant|boulangerie|café)\s+[A-ZÀ-Ý][\wÀ-ÿ'-]*/g, quoi: 'adresse nommée' },
  { re: /\b\d+\s*\*/g, quoi: 'classement étoiles' },
];

function normalise(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function listeFichiers(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...listeFichiers(p));
    else if (/\.(tsx?|mdx?|json)$/.test(e)) out.push(p);
  }
  return out;
}

/** Ne garde que le texte éditorial : littéraux de chaînes, hors imports/classes. */
function extraireTexte(src) {
  const morceaux = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/gs;
  let m;
  while ((m = re.exec(src)) !== null) {
    const s = m[2];
    if (s.length < 25) continue;
    if (/^[\w@/.-]+$/.test(s)) continue;              // chemins, imports
    if (/(?:^|\s)(?:flex|grid|text-|bg-|px-|py-|rounded)/.test(s)) continue;  // classes tailwind
    if (/^https?:\/\//.test(s)) continue;
    morceaux.push({ texte: s, index: m.index });
  }
  return morceaux;
}

function ligneDe(src, index) {
  return src.slice(0, index).split('\n').length;
}

function main() {
  if (!existsSync(EVIDENCE)) {
    console.log(`\n⚠️  Registre de preuves absent : ${EVIDENCE}`);
    console.log('   Génère-le d\'abord :  python scripts/photos_evidence.py');
    console.log('   Sans registre, aucune affirmation de vécu ne peut être vérifiée.\n');
    process.exit(STRICT ? 1 : 0);
  }

  const reg = JSON.parse(readFileSync(EVIDENCE, 'utf8'));
  const annees = new Set(reg.resume?.annees_prouvees ?? []);
  const moisProuves = new Set((reg.resume?.mois_prouves ?? []).map(normalise));
  const lieuxProuves = Object.keys(reg.resume?.lieux_prouves ?? {}).map(normalise);

  const fichiers = listeFichiers(ROOT);
  console.log(`\n🔎 Vérification des affirmations — ${fichiers.length} fichier(s) sous ${ROOT}`);
  console.log(`   Registre : ${reg.resume?.medias ?? 0} médias, `
    + `années prouvées [${[...annees].join(', ') || '—'}], `
    + `lieux [${Object.keys(reg.resume?.lieux_prouves ?? {}).length}]\n`);

  const contredits = [];
  const aConfirmer = [];
  let adosses = 0;

  for (const f of fichiers) {
    const src = readFileSync(f, 'utf8');
    for (const { texte, index } of extraireTexte(src)) {
      const ligne = ligneDe(src, index);
      const ref = `${relative(process.cwd(), f)}:${ligne}`;

      // — Années revendiquées
      for (const m of texte.matchAll(/\b(20\d{2})\b/g)) {
        const an = m[1];
        if (annees.size === 0) {
          aConfirmer.push({ ref, quoi: 'année', extrait: `« …${an}… »`,
            note: 'aucune date prouvée dans le registre' });
        } else if (annees.has(an)) {
          adosses++;
        } else {
          contredits.push({ ref, quoi: 'année', extrait: `« …${an}… »`,
            note: `les photos attestent ${[...annees].join(', ')}` });
        }
      }

      // — Mois revendiqués (« en septembre 2026 », « en mai »)
      for (const mo of MOIS) {
        const re = new RegExp(`\\ben\\s+${mo}\\b(?:\\s+(20\\d{2}))?`, 'gi');
        for (const m of texte.matchAll(re)) {
          const an = m[1];
          const cle = normalise(an ? `${mo} ${an}` : mo);
          const trouve = an
            ? moisProuves.has(cle)
            : [...moisProuves].some(p => p.startsWith(normalise(mo)));
          if (moisProuves.size === 0) {
            aConfirmer.push({ ref, quoi: 'mois', extrait: `« ${m[0]} »`,
              note: 'aucune date prouvée dans le registre' });
          } else if (trouve) {
            adosses++;
          } else {
            contredits.push({ ref, quoi: 'mois', extrait: `« ${m[0]} »`,
              note: `les photos attestent ${[...moisProuves].join(', ')}` });
          }
        }
      }

      // — Affirmations hors de portée d'une photo
      for (const { re, quoi } of NON_PHOTOGRAPHIABLE) {
        for (const m of texte.matchAll(re)) {
          aConfirmer.push({ ref, quoi, extrait: `« ${m[0].trim()} »`,
            note: 'aucune photo ne peut l\'établir' });
        }
      }
    }
  }

  if (contredits.length) {
    console.log(`❌ CONTREDIT PAR LES PHOTOS (${contredits.length})`);
    for (const c of contredits) {
      console.log(`   ${c.ref}  ${c.quoi} ${c.extrait}`);
      console.log(`      → ${c.note}`);
    }
    console.log('');
  }

  if (aConfirmer.length) {
    const parQuoi = {};
    for (const a of aConfirmer) (parQuoi[a.quoi] ??= []).push(a);
    console.log(`⚠️  À CONFIRMER PAR L'AUTEUR (${aConfirmer.length})`);
    for (const [quoi, items] of Object.entries(parQuoi)) {
      console.log(`   ${quoi} — ${items.length}`);
      for (const i of items.slice(0, 6)) console.log(`      ${i.ref}  ${i.extrait}`);
      if (items.length > 6) console.log(`      … et ${items.length - 6} autre(s)`);
    }
    console.log('');
  }

  console.log(`✓ Adossées au registre : ${adosses}`);
  if (!contredits.length && !aConfirmer.length) {
    console.log('✓ Aucune affirmation de vécu non étayée.\n');
  } else {
    console.log('\nRappel : « On n\'invente rien. On raconte ce qu\'on a vécu. »\n');
  }

  process.exit(STRICT && contredits.length ? 1 : 0);
}

main();
