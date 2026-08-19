/**
 * lib/brand-voice.ts
 * Heldonica — Référence voix éditoriale & Garde-fous IA centralisés
 * Source de vérité pour les prompts IA, blog, CRM, CMS, Instagram et LinkedIn.
 */

/** Mots et expressions strictement bannis dans tout contenu Heldonica */
export const FORBIDDEN_WORDS = [
  'bons plans',
  'bon plan',
  'organisation de séjour',
  'compagnie',
  'voyage organisé',
  'circuit',
  'package',
  'destinations populaires',
  'tips',
  'astuces',
  'conseil voyage',
  'lieu incontournable',
  'incontournable',
  'aventure inoubliable',
  'inoubliable',
  'paradis',
  'coup de cœur',
  'must-have',
  'must see',
  'les voyageurs',
  'les touristes',
  'solution miracle',
  'solution magique',
] as const;

/** Mots et expressions Heldonica à privilégier (B2C) */
export const BRAND_WORDS = [
  'pépites dénichées',
  'joyaux cachés',
  'hors des sentiers battus',
  'on a testé, on a vécu',
  'slow travel',
  'à notre rythme',
  'rencontre authentique',
  'coulisses',
  'carnet de route',
  'ce qu’on a moins aimé',
] as const;

/** Accroches types du manifeste éditorial */
export const HELDONICA_ACCROCHES = [
  "On a décidé de partir en moins de deux heures",
  "C’est pas dans les guides — c’est sur place qu’on l’a trouvé",
  "On aurait pu rester assis devant notre écran, mais...",
  "Ce qu’on a vécu ce jour-là — aucune appli nous aurait soufflé ça",
  "Franchement, on pensait pas que ça nous marquerait autant",
  "On s’est regardés et on s’est dit : et si on en profitait ?",
] as const;

/** Lexique B2B pour le conseil hôtelier et LinkedIn */
export const B2B_WORDS = [
  'RevPAR',
  'ADR',
  'mix de distribution',
  'marge directe',
  'désintermédiation',
  'expérience client',
  'E-E-A-T hôtelier',
  'storytelling de terroir',
  'séjour expérientiel',
] as const;

/** Les 7 Garde-fous obligatoires */
export const GARDE_FOUS_CHECKLIST = [
  { id: 'eeat', label: 'E-E-A-T complet (faits réels, adresses, prix réels vérifiables)' },
  { id: 'sensory', label: 'Détail sensoriel (au moins 1 image sensorielle : odeur, son, texture, lumière)' },
  { id: 'honesty', label: 'Honnêteté & Nuance (mention de contrainte ou « Ce qu’on a moins aimé »)' },
  { id: 'geo', label: 'Données GEO précises (noms exacts de villages, sentiers, routes)' },
  { id: 'pronouns', label: 'Pronoms stricts (« on » pour le duo, « tu » en B2C, « vous » en B2B)' },
  { id: 'forbidden', label: 'Zéro mot banni (aucun « bon plan », « incontournable », « tips », etc.)' },
  { id: 'cta', label: 'CTA doux (sobre, sans agressivité commerciale)' },
] as const;

/** System prompt maître Heldonica */
export const HELDONICA_SYSTEM_PROMPT = `Tu es l'assistant et rédacteur officiel d'Heldonica, média et concepteur de voyages slow travel en duo.

## 🌟 RÈGLE D'OR ABSOLUE
"On n'invente rien. On raconte ce qu'on a vécu."

## 👥 PRONOMS STRICTS ET OBLIGATOIRES
- **Pour parler du duo (émetteur) :** Utilise TOUJOURS "on" ("on a testé", "on est partis", "on a trouvé"). JAMAIS "je", JAMAIS "nous".
- **Pour t'adresser aux lecteurs (B2C) :** Utilise TOUJOURS le tutoiement "tu". JAMAIS "vous", JAMAIS "les voyageurs", JAMAIS "les touristes".
- **Pour t'adresser aux professionnels/hôteliers (B2B) :** Utilise TOUJOURS le vouvoiement "vous".

## 🛡️ LES 7 GARDE-FOUS DE PUBLICATION
1. **E-E-A-T concret :** Chaque affirmation repose sur un fait ou une expérience vécue.
2. **Détail sensoriel :** Inclure ce qu'on a vu, entendu, goûté, senti ou touché.
3. **Honnêteté totale :** Mentionner les limites, la météo capricieuse, ou "Ce qu'on a moins aimé".
4. **Précision GEO :** Nommer précisément les lieux, routes et artisans.
5. **Respect des pronoms :** "on" (duo) + "tu" (B2C) / "vous" (B2B).
6. **Zéro mot banni :** Interdiction totale de : bons plans, incontournable, tips, astuces, voyage organisé, inoubliable, paradis.
7. **CTA doux :** Invitation discrète et élégante.`;

/** Prompt spécialisé B2C (Articles de blog, Instagram, Guides) */
export const HELDONICA_B2C_PROMPT = `${HELDONICA_SYSTEM_PROMPT}

## 🌿 STRUCTURE ARTICLE B2C (5 POINTS OBLIGATOIRES)
1. **Accroche vécue** : Anecdote de départ sans introduction théorique.
2. **Histoire humaine & contexte** : Pourquoi on est là, qui on a croisé.
3. **Détail sensoriel testé sur le terrain** : Une image vive par section.
4. **Infos pratiques GEO-friendly** : Adresses, prix réels, accès.
5. **Verdict Heldonica & nuances** : "Ce qu'on a moins aimé" + conclusion honnête.`;

/** Prompt spécialisé B2B (Conseil Hôtelier, LinkedIn) */
export const HELDONICA_B2B_PROMPT = `${HELDONICA_SYSTEM_PROMPT}

## 💼 STRUCTURE B2B P-A-S (PROBLÈME - AGITATION - SOLUTION)
1. **Problème :** Constat chiffré sur l'hôtellerie indépendante (OTAs, marges, basse saison).
2. **Agitation :** Coût réel de l'inaction (érosion du RevPAR, perte de maîtrise de la relation client).
3. **Solution :** Stratégie slow travel éco-luxe, storytelling de terroir, conversion directe.`;

/** Valide un texte par rapport aux 7 garde-fous */
export function validateGardeFous(text: string, audience: 'b2c' | 'b2b' = 'b2c'): {
  passed: boolean;
  score: number;
  checks: Record<string, { ok: boolean; message: string }>;
  forbiddenFound: string[];
} {
  const lower = text.toLowerCase();

  // 1. Mots bannis
  const forbiddenFound = FORBIDDEN_WORDS.filter(w => lower.includes(w.toLowerCase()));
  const forbiddenOk = forbiddenFound.length === 0;

  // 2. Pronoms
  const hasJe = /\bje\b|\bj'/.test(lower);
  const hasNous = /\bnous\b/.test(lower);
  const hasOn = /\bon\b/.test(lower);
  const hasTu = /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/.test(lower);
  const hasVous = /\bvous\b|\bvotre\b|\bvos\b/.test(lower);

  let pronounsOk = hasOn && !hasJe && !hasNous;
  if (audience === 'b2c') {
    pronounsOk = pronounsOk && (hasTu || !hasVous);
  } else {
    pronounsOk = pronounsOk && hasVous;
  }

  // 3. Sensoriel
  const sensoryKeywords = ['odeur', 'senti', 'goût', 'goûté', 'frais', 'lumière', 'vent', 'pierre', 'bois', 'silence', 'bruit', 'eau', 'froid', 'chaud', 'texture', 'saveur'];
  const sensoryOk = sensoryKeywords.some(w => lower.includes(w));

  // 4. Honnêteté / Nuance
  const honestyKeywords = ['moins aimé', 'piège', 'attention', 'attente', 'glissant', 'bruyant', 'évite', 'difficile', 'cher', 'limite', 'bémol', 'par contre', 'mais'];
  const honestyOk = honestyKeywords.some(w => lower.includes(w));

  // 5. GEO
  const geoOk = /[A-ZÀ-ÿ][a-zà-ÿ]+|\d+\s*(€|km|min|h)/.test(text);

  // 6. E-E-A-T
  const eeatOk = text.length > 80 && (lower.includes('on a') || lower.includes('testé') || lower.includes('vécu') || lower.includes('sur place'));

  // 7. CTA doux
  const aggressiveCta = ['clique vite', 'offre limitée', 'achète maintenant', 'dépêchez-vous'].some(w => lower.includes(w));
  const ctaOk = !aggressiveCta;

  const checks = {
    forbidden: { ok: forbiddenOk, message: forbiddenOk ? 'Aucun mot banni' : `Mots bannis détectés : ${forbiddenFound.join(', ')}` },
    pronouns: { ok: pronounsOk, message: pronounsOk ? 'Pronoms respectés' : 'Vérifier l’usage de "on" (duo) et "tu" (B2C) / "vous" (B2B), bannir "je"/"nous"' },
    sensory: { ok: sensoryOk, message: sensoryOk ? 'Détail sensoriel présent' : 'Ajouter au moins une évocation sensorielle (matière, son, odeur)' },
    honesty: { ok: honestyOk, message: honestyOk ? 'Nuance / honnêteté présente' : 'Ajouter une nuance transparente ("Ce qu’on a moins aimé")' },
    geo: { ok: geoOk, message: geoOk ? 'Repères GEO ou chiffres présents' : 'Préciser des noms de lieux, prix réels ou distances' },
    eeat: { ok: eeatOk, message: eeatOk ? 'Ancrage E-E-A-T vérifié' : 'Renforcer l’ancrage terrain vécu' },
    cta: { ok: ctaOk, message: ctaOk ? 'CTA doux et sobre' : 'Adoucir l’appel à l’action' },
  };

  const okCount = Object.values(checks).filter(c => c.ok).length;
  const score = Math.round((okCount / 7) * 100);
  const passed = okCount === 7;

  return { passed, score, checks, forbiddenFound };
}

export function checkBrandVoice(text: string) {
  const v = validateGardeFous(text, 'b2c');
  return {
    forbidden: v.forbiddenFound,
    score: v.score,
    usesFirstPersonPlural: v.checks.pronouns.ok,
    hasSensoryImage: v.checks.sensory.ok,
  };
}

export function buildVoiceCorrectPrompt(text: string, audience: 'b2c' | 'b2b' = 'b2c'): string {
  return `Corrige et sublime ce texte selon le Guide de Voix Heldonica officiel :

1. Respecte la règle d'or : "On n'invente rien. On raconte ce qu'on a vécu."
2. Pronoms obligatoires : "on" (le duo), "${audience === 'b2c' ? 'tu' : 'vous'}" (le lecteur/client). Interdis "je", "nous", "les voyageurs".
3. Élimine tout mot banni (bons plans, incontournable, tips, astuces, inoubliable, paradis).
4. Ajoute un détail sensoriel vif (matière, son, odeur, lumière) si manquant.
5. Intègre une nuance honnête si approprié.

Texte source :
---
${text}
---

Retourne uniquement le texte corrigé, sans commentaire.`;
}
