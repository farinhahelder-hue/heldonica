/**
 * check-design-tics — garde-fou anti-récidive contre les tics visuels « IA / SaaS »
 * sur les pages publiques.
 *
 * Pourquoi ce script existe
 * -------------------------
 * La direction artistique « carnet de route imprimé » (papier coton #F7F3EC /
 * #EFE9DF / #FAF7F2, encre #241D1A / #2A1D18, filets lin #DED5C6 / #E2D9C8,
 * coins droits `rounded-sm`, icônes au trait fin `strokeWidth={1.25}`) remplace
 * les tics génériques produits par défaut par les LLM :
 *
 *   1. Cartes SaaS combinant `bg-white` (ou `bg-stone-50`) avec `rounded-2xl` /
 *      `rounded-3xl` ou des ombres portées (`shadow-*`) sur la même balise JSX.
 *   2. Emojis décoratifs dans le JSX ou les données des pages publiques
 *      (✨, ⭐, ✦, 💡, 📍, 🗺️, 🏛️, 🌿, 🍷, 🚗, 🎉, 🚀…), là où la charte utilise
 *      des icônes au trait fin (`lucide-react` / `CmsIcon`).
 *
 * Périmètre : pages publiques et gabarits de destination/services.
 * L'administration (`app/dashboard`, `app/panel-manager`, `app/admin`,
 * `components/admin`, `components/cms`, `components/inline-edit`) est hors
 * périmètre.
 *
 * Usage :
 *   node scripts/check-design-tics.mjs
 *
 * Sortie : exit 1 dès qu'un tic visuel est détecté.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const PUBLIC_DESIGN_TARGETS = [
  'app/page.tsx',
  'app/a-propos',
  'app/travel-planning',
  'app/travel-planning-form',
  'app/expert-hotelier',
  'app/destinations',
  'app/organisateur',
  'app/guides',
  'app/quiz',
  'app/merci',
  'app/blog',
  'app/contact',
  'app/start',
  'app/retour-experience',
  'app/slow-travel',
  'app/temoignages',
  'app/politique-affiliation',
  'app/mentions-legales',
  'app/politique-confidentialite',
  // Page de maintenance : rendue en production quand le mode maintenance est
  // actif. Hors périmètre initial, elle portait « Merci de ta patience 🌿 ».
  'app/maintenance',
  'app/nos-services',
  'components/HomeClient.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/DestinationCard.tsx',
  'components/DestinationPillar.tsx',
  'components/SubDestinationTemplate.tsx',
  'components/ComingSoonDestination.tsx',
  'components/SlowTravelQuiz.tsx',
  'components/TravelPlanningForm.tsx',
  'components/BlogClientPage.tsx',
  'components/Blog.tsx',
  'components/BlogFilters.tsx',
  'components/NewsletterForm.tsx',
  'components/NewsletterPopup.tsx',
  'components/Newsletter.tsx',
  'components/NewsletterBrevo.tsx',
  'components/Services.tsx',
  'components/Pillars.tsx',
  'components/LeadMagnetBlock.tsx',
  'components/SeasonalTable.tsx',
  'components/CtaTravelPlanning.tsx',
  'components/DestinationVerdict.tsx',
  'components/DestinationComparison.tsx',
  'components/TestedByHeldonica.tsx',
  'components/EeaatScore.tsx',
  'components/FaqSection.tsx',
  'components/GuideDownloadForm.tsx',
  'components/GuideDownloadModal.tsx',
  'components/GuideDownloadButton.tsx',
  'components/RelatedArticles.tsx',
  'components/ShareButtons.tsx',
  'components/QuickAnswersBlock.tsx',
  'components/HeldonicaFAQ.tsx',
  'components/HeldonicaProof.tsx',
  'components/HeldonicaVerdict.tsx',
  'components/HotelierForm.tsx',
  'components/ContactForm.tsx',
  'components/itinerary/DayAccommodationBox.tsx',
  'components/itinerary/DaySummaryTable.tsx',
  // Rendu sur les articles de blog et les itineraires Roumanie : il portait des
  // emojis de categorie (📍 🗺️ 🍽️…) hors du perimetre initial.
  'components/ArticleMap.tsx',
  // Donnees publiques alimentant la page d'accueil et les piliers
  'lib/home-data.ts',
  'lib/pillar-data.ts',
];

// Plages Unicode des emojis décoratifs et dingbats (hors flèches typographiques ← → ↑ ↓ et étoile pleine ★).
const DECORATIVE_EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{231A}-\u{231B}\u{23E9}-\u{23FF}\u{2600}-\u{2604}\u{2606}-\u{26FF}\u{2700}-\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}]/gu;

/**
 * Routes API. Elles n'ont pas de JSX, donc les règles « carte SaaS » n'y ont
 * pas de sens — mais leurs emojis, si : ils finissent dans un email client
 * (`/api/travel-planning`), une légende Instagram publiée
 * (`/api/cms/mobile-publish`) ou un article (`/api/update-content`). Hors du
 * périmètre initial du garde-fou, onze routes en portaient encore le 22/10.
 */
export const API_EMOJI_TARGETS = ['app/api'];

// Carte SaaS : className combinant un fond clinique (`bg-white` ou `bg-stone-50`)
// avec un rayon de carte SaaS (`rounded-2xl` / `rounded-3xl`) ou une ombre portée (`shadow-*`).
const SAAS_BG_RE = /\bbg-(?:white|stone-50)\b/;
const SAAS_RADIUS_OR_SHADOW_RE = /\b(?:rounded-(?:2xl|3xl)|shadow-(?:sm|md|lg|xl|2xl))\b/;
const SAAS_PILL_SHADOW_RE = /\brounded-full\b[^"'\n]*\bshadow-(?:md|lg|xl|2xl)\b|\bshadow-(?:md|lg|xl|2xl)\b[^"'\n]*\brounded-full\b/;

function collectFiles(target, acc = []) {
  let st;
  try {
    st = statSync(target);
  } catch {
    return acc;
  }
  if (st.isFile()) {
    if (target.endsWith('.tsx') || target.endsWith('.ts')) acc.push(target);
    return acc;
  }
  for (const name of readdirSync(target)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    collectFiles(join(target, name), acc);
  }
  return acc;
}

/**
 * Analyse le code source d'un fichier public et retourne la liste des tics détectés.
 * Exporté pour les tests unitaires afin de prouver la détection sur cas fautifs.
 *
 * `options.emojiOnly` restreint au seul contrôle des emojis : c'est le mode
 * utilisé pour `app/api`, où les règles « carte SaaS » n'ont pas de sens.
 */
export function scanSourceForDesignTics(source, filePath = 'inline.tsx', options = {}) {
  const { emojiOnly = false } = options;
  const violations = [];
  // Retirer les commentaires bloc et ligne avant l'analyse
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    '\n'.repeat((m.match(/\n/g) || []).length)
  );
  const lines = withoutBlockComments.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNo = i + 1;
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('import ')) continue;

    // 1. Emojis décoratifs
    const emojiMatches = [...rawLine.matchAll(DECORATIVE_EMOJI_RE)].map((m) => m[0]);
    if (emojiMatches.length > 0) {
      const unique = [...new Set(emojiMatches)].join(' ');
      violations.push({
        file: filePath,
        line: lineNo,
        kind: 'emoji',
        detail: `emoji décoratif interdit (${unique})`,
        snippet: trimmed.slice(0, 120),
      });
    }

    if (emojiOnly) continue;

    // 2. Props flag_emoji en dur (code ISO "CO", nom d'icone "Landmark", ou tout fallback non vide)
    const flagPropMatch = rawLine.match(/\bflag_emoji\s*=\s*["']([^"']+)["']/);
    if (flagPropMatch) {
      violations.push({
        file: filePath,
        line: lineNo,
        kind: 'flag-prop',
        detail: `prop flag_emoji="${flagPropMatch[1]}" interdite (les destinations ne doivent pas porter de drapeau en dur ni de code ISO)`,
        snippet: trimmed.slice(0, 120),
      });
    }

    // 2. Cartes SaaS (bg-white / bg-stone-50 + rounded-2xl/3xl ou shadow-*)
    if (SAAS_BG_RE.test(rawLine) && SAAS_RADIUS_OR_SHADOW_RE.test(rawLine)) {
      violations.push({
        file: filePath,
        line: lineNo,
        kind: 'saas-card',
        detail: 'carte SaaS (bg-white/bg-stone-50 combiné à rounded-2xl/3xl ou shadow-*)',
        snippet: trimmed.slice(0, 120),
      });
    } else if (/\brounded-(?:2xl|3xl)\b/.test(rawLine)) {
      violations.push({
        file: filePath,
        line: lineNo,
        kind: 'saas-radius',
        detail: 'rayon SaaS (rounded-2xl / rounded-3xl au lieu de rounded-sm)',
        snippet: trimmed.slice(0, 120),
      });
    } else if (SAAS_PILL_SHADOW_RE.test(rawLine)) {
      violations.push({
        file: filePath,
        line: lineNo,
        kind: 'saas-pill',
        detail: 'bouton pilule à ombre lourde (rounded-full + shadow-*)',
        snippet: trimmed.slice(0, 120),
      });
    }
  }

  return violations;
}

export function runDesignTicsCheck(targets = PUBLIC_DESIGN_TARGETS) {
  const files = [];
  for (const t of targets) collectFiles(t, files);
  const allViolations = [];
  for (const file of files) {
    const rel = file.replace(/\\/g, '/');
    const src = readFileSync(file, 'utf8');
    allViolations.push(...scanSourceForDesignTics(src, rel));
  }
  return { filesScanned: files.length, violations: allViolations };
}

/** Même collecte que `runDesignTicsCheck`, mais seuls les emojis sont refusés. */
export function runApiEmojiCheck(targets = API_EMOJI_TARGETS) {
  const files = [];
  for (const t of targets) collectFiles(t, files);
  const allViolations = [];
  for (const file of files) {
    const rel = file.replace(/\\/g, '/');
    const src = readFileSync(file, 'utf8');
    allViolations.push(...scanSourceForDesignTics(src, rel, { emojiOnly: true }));
  }
  return { filesScanned: files.length, violations: allViolations };
}

function main() {
  const { filesScanned, violations } = runDesignTicsCheck();
  const api = runApiEmojiCheck();
  const total = violations.length + api.violations.length;

  if (total > 0) {
    console.error(`\n✗ check-design-tics : ${total} tic(s) visuel(s) sur ${filesScanned + api.filesScanned} fichiers :\n`);
    for (const v of [...violations, ...api.violations].slice(0, 60)) {
      console.error(`  - ${v.file}:${v.line} [${v.kind}] ${v.detail}`);
      console.error(`      ${v.snippet}`);
    }
    if (total > 60) {
      console.error(`  ... et ${total - 60} autre(s).`);
    }
    process.exit(1);
  }
  console.log(`✓ check-design-tics : ${filesScanned} fichiers publics + ${api.filesScanned} routes API vérifiés, 0 tic visuel IA/SaaS.`);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith('check-design-tics.mjs')) {
  main();
}
