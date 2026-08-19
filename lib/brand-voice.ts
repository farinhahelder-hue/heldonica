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
  'paradisiaque',
  'coup de cœur',
  'must-have',
  'must see',
  'must-see',
  'les voyageurs',
  'les touristes',
  'solution miracle',
  'solution magique',
  'magnifique',
  'splendide',
  'incroyable',
  'spot',
  'optimiser',
  'solutions innovantes',
  'expertise reconnue',
  'meilleur partenaire',
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

/** Les 7 Garde-fous obligatoires avec pondération officielle */
export const GARDE_FOUS_CHECKLIST = [
  { id: 'pronouns', label: 'Pronoms (on/tu B2C, vous B2B)', weight: 20, desc: '100% conforme : on (duo), tu (voyageur), vous (hôtelier)' },
  { id: 'forbidden', label: 'Lexique (0 mot interdit)', weight: 20, desc: 'Zéro mot banni : pas de bon plan, incontournable, tips, magnifique, spot' },
  { id: 'eeat', label: 'E-E-A-T (visites réelles, saison, date MAJ)', weight: 15, desc: 'Au moins 1 mention concrète d’expérience terrain vérifiée' },
  { id: 'sensory', label: 'Détails sensoriels (odeur, texture, son, goût)', weight: 15, desc: 'Au moins 1 détail sensoriel vif impossible à inventer' },
  { id: 'honesty', label: 'Honnêteté (« Ce qu’on a moins aimé »)', weight: 10, desc: 'Présence indispensable de nuance et transparence' },
  { id: 'geo', label: 'Infos GEO extractibles', weight: 10, desc: 'Au moins 3 repères concrets : adresse, prix, durée, sentier' },
  { id: 'cta', label: 'CTA doux (non agressif)', weight: 10, desc: 'Invitation sobre : on en parle en DM, lien en bio, formulaire' },
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

/** Valide un texte par rapport aux 7 garde-fous avec scoring pondéré */
export function validateGardeFous(text: string, audience: 'b2c' | 'b2b' = 'b2c'): {
  passed: boolean;
  score: number;
  isExcellent: boolean;
  checks: Record<string, { ok: boolean; weight: number; message: string }>;
  forbiddenFound: string[];
} {
  const lower = text.toLowerCase();

  // 1. Mots bannis (Poids : 20%)
  const forbiddenFound = FORBIDDEN_WORDS.filter(w => lower.includes(w.toLowerCase()));
  const forbiddenOk = forbiddenFound.length === 0;

  // Détection des pronoms
  const hasJe = /\bje\b|\bj'/.test(lower);
  const hasSubjectNous = /\bnous\s+[a-zÀ-ÿ]+ons\b|\bnous\s+ne\b|\bnous\s+y\b|\bnous\s+en\b/.test(lower);
  const hasOn = /\bon\b/.test(lower);
  const hasTu = /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/.test(lower);
  const hasVous = /\bvous\b|\bvotre\b|\bvos\b/.test(lower);
  const hasTravelers = /\bles voyageurs\b|\bles touristes\b/.test(lower);

  // Détection CTA agressif
  const aggressiveCta = ['clique vite', 'offre limitée', 'achète maintenant', 'dépêchez-vous', 'réservez maintenant', 'reservez maintenant', 'urgent', 'offre exclusive'].some(w => lower.includes(w));
  const ctaOk = !aggressiveCta;

  if (audience === 'b2b') {
    // 💼 B2B (5 Garde-fous pondérés à 20% chacun)
    const pronounsOk = hasVous && hasOn && !hasJe && !hasSubjectNous;
    const numberMatches = text.match(/(\d+[\d\s.,]*\s*(%|€|k€|chambres|nuitées|jours|h|revpar|adr)|[0-9]{2,})/gi) || [];
    const numbersOk = numberMatches.length >= 3;
    const pasOk = (lower.includes('problème') || lower.includes('commissions') || lower.includes('dépendance') || lower.includes('perte') || lower.includes('stagne') || lower.includes('direct') || lower.includes('booking')) &&
                  (lower.includes('aide') || lower.includes('accompagn') || lower.includes('stratégie') || lower.includes('ancrage') || lower.includes('séjour') || lower.includes('solution'));

    const checks = {
      pronouns: { ok: pronounsOk, weight: 20, message: pronounsOk ? 'Pronoms B2B conformes (« vous » + « on »)' : 'Utiliser le vouvoiement (« vous ») et « on », bannir « je » et « nous » sujet' },
      forbidden: { ok: forbiddenOk, weight: 20, message: forbiddenOk ? '0 mot interdit' : `Mots interdits détectés : ${forbiddenFound.join(', ')}` },
      numbers: { ok: numbersOk, weight: 20, message: numbersOk ? 'Chiffres concrets présents (≥3 repères : %, €, RevPAR)' : 'Ajouter au moins 3 chiffres concrets (RevPAR, %, €, jours)' },
      pas: { ok: pasOk, weight: 20, message: pasOk ? 'Structure P-A-S identifiée' : 'Structurer en Problème ➔ Agitation ➔ Solution' },
      cta: { ok: ctaOk, weight: 20, message: ctaOk ? 'CTA doux et sobre' : 'Adoucir l’appel (« on ouvre 3 audits », « contactez-nous en DM »)' },
    };

    let totalScore = 0;
    for (const c of Object.values(checks)) {
      if (c.ok) totalScore += c.weight;
    }

    return {
      passed: totalScore >= 85,
      score: totalScore,
      isExcellent: totalScore >= 95,
      checks,
      forbiddenFound,
    };
  }

  // 🌿 B2C (7 Garde-fous pondérés)
  const pronounsOk = hasOn && !hasJe && !hasSubjectNous && !hasTravelers && (hasTu || !hasVous);

  // E-E-A-T (Poids : 15%)
  const eeatKeywords = ['on a testé', 'on a vécu', 'on a visité', 'on a passé', 'notre voyage', 'en 202', 'hors saison', 'en mai', 'en juin', 'en septembre', 'en octobre', 'sur place', 'sur le terrain', 'années de route'];
  const eeatOk = text.length > 40 && eeatKeywords.some(w => lower.includes(w));

  // Détails sensoriels (Poids : 15%)
  const sensoryKeywords = ['odeur', 'senti', 'goût', 'goûté', 'frais', 'lumière', 'vent', 'pierre', 'bois', 'silence', 'bruit', 'eau', 'froid', 'chaud', 'texture', 'saveur', 'turquoise', 'parfum', 'café', 'brume', 'clapotis', 'rochers'];
  const sensoryOk = sensoryKeywords.some(w => lower.includes(w));

  // Honnêteté / Nuance (Poids : 10%)
  const honestyKeywords = ['moins aimé', 'piège', 'attention', 'attente', 'glissant', 'bruyant', 'évite', 'difficile', 'cher', 'limite', 'bémol', 'par contre', 'mais', 'inconvénient'];
  const honestyOk = honestyKeywords.some(w => lower.includes(w));

  // Données GEO extractibles (Poids : 10%)
  const geoMatches = text.match(/([A-ZÀ-ÿ][a-zà-ÿ]+|\d+\s*(€|km|min|h|\%))/g) || [];
  const geoOk = geoMatches.length >= 3;

  const checks = {
    pronouns: { ok: pronounsOk, weight: 20, message: pronounsOk ? 'Pronoms 100% conformes (« on » + « tu »)' : 'Corriger les pronoms : bannir "je", "nous", "les voyageurs", utiliser "on" et "tu"' },
    forbidden: { ok: forbiddenOk, weight: 20, message: forbiddenOk ? '0 mot interdit' : `Mots interdits détectés : ${forbiddenFound.join(', ')}` },
    eeat: { ok: eeatOk, weight: 15, message: eeatOk ? 'E-E-A-T validé (visites réelles, saison, dates)' : 'Ajouter au moins 1 mention de visite réelle, saison ou date de mise à jour' },
    sensory: { ok: sensoryOk, weight: 15, message: sensoryOk ? 'Détail sensoriel présent' : 'Ajouter au moins 1 détail sensoriel (odeur, texture, son, goût)' },
    honesty: { ok: honestyOk, weight: 10, message: honestyOk ? 'Honnêteté / nuance présente' : 'Ajouter la section ou mention « Ce qu’on a moins aimé »' },
    geo: { ok: geoOk, weight: 10, message: geoOk ? 'Infos GEO extractibles (≥3 repères)' : 'Fournir au moins 3 repères concrets (adresses, prix, durées, itinéraires)' },
    cta: { ok: ctaOk, weight: 10, message: ctaOk ? 'CTA doux et sobre' : 'Remplacer l’appel agressif par un CTA doux (« on en parle en DM », « lien en bio »)' },
  };

  let totalScore = 0;
  for (const c of Object.values(checks)) {
    if (c.ok) totalScore += c.weight;
  }

  const score = totalScore;
  const passed = score >= 85;
  const isExcellent = score >= 95;

  return { passed, score, isExcellent, checks, forbiddenFound };
}

export function checkBrandVoice(text: string) {
  const v = validateGardeFous(text, 'b2c');
  return {
    forbidden: v.forbiddenFound,
    score: v.score,
    passed: v.passed,
    isExcellent: v.isExcellent,
    usesFirstPersonPlural: v.checks.pronouns.ok,
    hasSensoryImage: v.checks.sensory.ok,
  };
}

export function buildVoiceCorrectPrompt(text: string, audience: 'b2c' | 'b2b' = 'b2c'): string {
  return `Tu es le rédacteur en chef d'Heldonica. Corrige et sublime ce contenu selon les 7 garde-fous officiels (Seuil minimum requis : 85%, visé : 95%+) :

1. PRONOMS : Utilise strictement "on" pour le duo et "${audience === 'b2c' ? 'tu' : 'vous'}". Interdiction totale de "je", "nous", "les voyageurs".
2. LEXIQUE : 0 mot interdit (aucun "bon plan", "incontournable", "tips", "magnifique", "splendide", "incroyable", "spot", "optimiser").
3. E-E-A-T : Intègre au moins 1 mention de vécu terrain (visites réelles, saison, dates 2025-2026).
4. SENSORIEL : Ajoute au moins 1 détail sensoriel concret (odeur, texture, son, goût).
5. HONNÊTETÉ : Inclure la nuance "Ce qu'on a moins aimé" (en B2C).
6. INFOS GEO : Conserve ou ajoute ≥3 repères extractibles (adresses, prix en €, durées).
7. CTA DOUX : Termine par une invitation sobre non agressive ("On en parle en DM", "Formulaire sur le site").

Texte source à corriger :
---
${text}
---

Retourne uniquement le texte corrigé, prêt à publication.`;
}
