#!/usr/bin/env node
/**
 * Garde-fou : tout gestionnaire d'API qui manie la clé service doit vérifier
 * qui l'appelle.
 *
 * La clé service contourne les règles de sécurité de la base : une route qui
 * l'utilise sans contrôle donne à n'importe qui les droits d'un administrateur.
 * Deux trous de cette forme ont été trouvés à la main le 3 septembre 2026 :
 *
 *   - /api/instagram/scheduled — les quatre verbes ouverts. On pouvait ajouter
 *     une publication et la passer en « scheduled » : le cron l'aurait publiée
 *     sur le compte Instagram réel.
 *   - /api/jules — POST ouvert alors que GET était gardé. On pouvait faire
 *     écrire du code dans le dépôt par l'agent Jules, avec un prompt libre.
 *
 * Les deux étaient invisibles à la lecture : le fichier mentionnait bien une
 * vérification, mais pas dans le bon gestionnaire. Et les deux étaient latents,
 * masqués par une table absente ou une variable non renseignée — donc
 * inoffensifs jusqu'au jour où la configuration change.
 *
 * Ce script échoue si un gestionnaire nouveau apparaît sans garde.
 *
 * Ce qu'il ne fait pas : juger la qualité du contrôle. Il vérifie qu'il y en a
 * un, pas qu'il est bon.
 */

import fs from 'node:fs'
import path from 'node:path'

const RACINE = 'app/api'

// Un appel a l'une de ces formes vaut vérification.
const AUTH = /requireCmsAuth|requireBridgeAuth|requireBearerOnly|getCmsAuthStatus|isAuthorized|CRON_SECRET|x-cms-auth|signatureValide|verifyWebhook|WEBHOOK_SECRET|APP_SECRET|AI_AGENT_API_KEY|verifyAiAuth|requireN8nSecret|checkAuth|isAdmin/

/**
 * Comment une route obtient la clé service.
 *
 * Ce motif ne connaissait que les deux noms de variable d'environnement. Or
 * `createServiceClient()` (lib/supabase.ts) les lit à la place de l'appelant :
 * une route qui passe par cet intermédiaire ne contient aucune des deux
 * chaînes, et le fichier entier était donc écarté plus bas sans être examiné.
 *
 * C'est précisément ce qui a laissé ce script au vert pendant que deux routes
 * restaient ouvertes à tout Internet, trouvées le 27/10/2026 :
 *
 *   - /api/n8n/articles — le GET vérifiait son secret, le PATCH ne vérifiait
 *     rien : un appel anonyme dépubliait n'importe quel article, ou publiait
 *     n'importe quel brouillon.
 *   - /api/webhook/trigger — POST ouvert : lecture de n'importe quel article
 *     par son id, brouillons compris, et déclenchement des webhooks sortants.
 *
 * L'audit du 27/07/2026 avait déjà nommé la seconde. Trois mois plus tard elle
 * était encore là, parce qu'aucun garde-fou ne la voyait.
 */
const SERVICE = /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY|createServiceClient/

/**
 * Clés de tiers facturées à l'usage.
 *
 * Ce script ne surveillait que la clé service. Trois routes de génération —
 * /api/blog/generate, /api/blog/rewrite, /api/carousel/generate — appelaient
 * l'API Groq sans aucune vérification : un POST anonyme suffisait à consommer
 * le quota du compte. Elles ne touchaient pas la base, donc rien ne les voyait.
 *
 * Une route ouverte qui dépense de l'argent mérite le même garde-fou qu'une
 * route ouverte qui écrit en base.
 */
const PAYANTES = /GROQ_API_KEY|OPENAI_API_KEY|PERPLEXITY_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|UNSPLASH_ACCESS_KEY|BREVO_API_KEY|REPLICATE|ELEVENLABS/

/**
 * Une limite de débit tient lieu de garde sur un formulaire public : elle
 * n'empêche pas l'appel, elle en borne le coût.
 */
const DEBIT = /checkRateLimit|rateLimit\s*\(/

const VERBE_EXPORTE = /export\s+(?:async\s+)?function\s+(GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)\s*\(/g
const FONCTION_LOCALE = /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g

/**
 * Exceptions assumées, avec leur raison. Cette liste doit rester courte : une
 * entrée de plus est une surface publique de plus.
 */
const EXCEPTIONS = new Map([
  ['app/api/route.ts POST', 'Formulaire public de demande de voyage.'],
  ['app/api/cms/newsletter/route.ts POST', 'Inscription publique a la newsletter.'],
  ['app/api/newsletter/route.ts POST', 'Inscription publique a la newsletter.'],
  ['app/api/travel-planning/route.ts POST', 'Formulaire public.'],
  ['app/api/webhooks/instagram/route.ts GET', "Poignee de main de verification exigee par Meta, sans corps a signer."],
  ['app/api/guides/download/route.ts POST', "Aimant a prospects : un visiteur echange son courriel contre un guide. Ecriture publique assumee, bornee par checkRateLimit."],
  // Les quatre entrees suivantes datent de l'elargissement de SERVICE a
  // createServiceClient (27/10/2026). Leurs fichiers etaient ecartes sans etre
  // examines : ce ne sont donc pas des exceptions nouvellement accordees, mais
  // un jugement qui n'avait jamais ete porte. Chacune a ete relue a cette date.
  ['app/api/ai/media/route.ts GET', "Lecture publique du media des articles : la requete filtre published = true."],
  ['app/api/ai/media/route.ts POST', "Analyse d'une URL par expressions regulieres seules : ni acces a la base, ni appel sortant."],
  ['app/api/brevo/subscribe/route.ts POST', 'Inscription publique a la newsletter, bornee par checkRateLimit.'],
  ['app/api/testimonials/submit/route.ts POST', "Depot public d'un temoignage, insere avec is_active = false (moderation manuelle) et borne par checkRateLimit."],
])

/**
 * Retire les commentaires avant toute recherche de garde.
 *
 * AUTH est un test textuel : sans ce filtre, une simple mention en commentaire
 * valait garde. Dans app/api/n8n/articles/route.ts, le commentaire
 * « Requires header: x-n8n-secret: <N8N_WEBHOOK_SECRET> » suffisait a faire
 * passer le fichier pour garde — alors que le PATCH, juste en dessous, ne
 * verifiait rien. Une promesse en commentaire n'est pas un controle.
 */
function sansCommentaires(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

/** Les lectures sous /api/cms alimentent le site public : le middleware les ouvre. */
function lectureCmsPublique(fichier, verbe) {
  return fichier.startsWith('app/api/cms') && (verbe === 'GET' || verbe === 'HEAD' || verbe === 'OPTIONS')
}

/** Le middleware garde /api/agents quelle que soit la méthode. */
function gardeParMiddleware(fichier) {
  return fichier.startsWith('app/api/agents')
}

function fichiersRoute(dossier) {
  const out = []
  for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
    const p = path.join(dossier, e.name)
    if (e.isDirectory()) out.push(...fichiersRoute(p))
    else if (e.name === 'route.ts' || e.name === 'route.tsx') out.push(p)
  }
  return out
}

/** Corps de chaque gestionnaire exporté, borné par le suivant. */
function gestionnaires(source) {
  const bornes = []
  let m
  VERBE_EXPORTE.lastIndex = 0
  while ((m = VERBE_EXPORTE.exec(source)) !== null) bornes.push({ verbe: m[1], debut: m.index })

  return bornes.map((b, i) => ({
    verbe: b.verbe,
    corps: source.slice(b.debut, i + 1 < bornes.length ? bornes[i + 1].debut : source.length),
  }))
}

/**
 * Fonctions du fichier qui vérifient elles-mêmes. Un gestionnaire qui délègue à
 * l'une d'elles est gardé — publish-scheduled fait exactement cela.
 */
function fonctionsQuiVerifient(source) {
  const noms = new Set()
  // Debut du premier gestionnaire exporte : la fenetre d'une fonction locale
  // ne doit jamais le franchir.
  //
  // Sans cette borne, la fenetre de 2500 caracteres d'un helper declare en
  // tete de fichier avalait le premier gestionnaire. Dans
  // app/api/n8n/articles/route.ts, `getSupabase` etait ainsi pris pour une
  // fonction qui verifie — parce que le controle du GET tombait dans sa
  // fenetre — et le PATCH, qui appelle `getSupabase()`, heritait d'une garde
  // qu'il n'avait pas. Le PATCH est reste ouvert a tout Internet.
  //
  // C'est exactement la forme de l'incident du 3 septembre 2026 rappele en
  // tete de ce fichier (/api/jules : POST ouvert alors que GET etait garde),
  // que ce script etait cense rendre impossible.
  const premierGestionnaire = gestionnaires(source)[0]
  const plafond = premierGestionnaire
    ? source.indexOf(premierGestionnaire.corps)
    : source.length

  let m
  FONCTION_LOCALE.lastIndex = 0
  while ((m = FONCTION_LOCALE.exec(source)) !== null) {
    const nom = m[1] || m[2]
    if (!nom || /^(GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)$/.test(nom)) continue
    // Fenetre genereuse, mais arretee net au premier gestionnaire exporte,
    // et debarrassee des commentaires.
    const fin = Math.min(m.index + 2500, Math.max(m.index, plafond))
    if (AUTH.test(sansCommentaires(source.slice(m.index, fin)))) noms.add(nom)
  }
  return noms
}

const nus = []
const exceptionsVues = new Set()

for (const chemin of fichiersRoute(RACINE)) {
  const fichier = chemin.split(path.sep).join('/')
  const source = fs.readFileSync(chemin, 'utf8')
  const depense = PAYANTES.test(source)
  if (!SERVICE.test(source) && !depense) continue

  const delegues = fonctionsQuiVerifient(source)

  for (const { verbe, corps: corpsBrut } of gestionnaires(source)) {
    const cle = `${fichier} ${verbe}`
    // Les commentaires ne gardent rien : on cherche la verification dans le
    // code seul. Le bloc de documentation d'un gestionnaire precede souvent le
    // suivant, et sa mention d'un secret passait pour la garde de celui-ci.
    const corps = sansCommentaires(corpsBrut)

    if (EXCEPTIONS.has(cle)) { exceptionsVues.add(cle); continue }
    if (lectureCmsPublique(fichier, verbe)) continue
    if (gardeParMiddleware(fichier)) continue
    if (AUTH.test(corps)) continue
    // Un formulaire public qui ne fait que dépenser est acceptable s'il borne
    // son débit ; une route qui touche la base, non.
    if (depense && !SERVICE.test(source) && DEBIT.test(corps)) continue
    if ([...delegues].some(n => new RegExp(`\\b${n}\\s*\\(`).test(corps))) continue

    // Un verbe qui se contente d'en appeler un autre hérite de sa garde :
    // settings PUT ne fait que rendre PATCH(req).
    const verbesGardes = gestionnaires(source)
      .filter(g => AUTH.test(g.corps))
      .map(g => g.verbe)
    if (verbesGardes.some(v => new RegExp(`\\b${v}\\s*\\(`).test(corps))) continue

    nus.push(cle)
  }
}

const orphelines = [...EXCEPTIONS.keys()].filter(c => !exceptionsVues.has(c))

if (nus.length === 0) {
  console.log('✓ Tout gestionnaire maniant la clé service vérifie son appelant.')
} else {
  console.error(`✗ ${nus.length} gestionnaire(s) sans vérification, avec la clé service :\n`)
  for (const c of nus) console.error('    ' + c)
  console.error(
    '\n  Ajoute requireCmsAuth au début du gestionnaire. Si la route doit rester\n' +
    '  publique, borne son débit avec checkRateLimit, ou inscris-la dans\n' +
    '  EXCEPTIONS avec sa raison — et pèse-la : la clé service ignore les règles\n' +
    '  de sécurité de la base, et une clé de tiers se paie à chaque appel.'
  )
}

if (orphelines.length > 0) {
  console.warn(
    `\n⚠ ${orphelines.length} exception(s) ne correspondent plus à rien — ` +
    'route supprimée ou renommée. À retirer de la liste :'
  )
  for (const c of orphelines) console.warn('    ' + c)
}

process.exit(nus.length === 0 ? 0 : 1)
