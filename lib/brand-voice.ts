/**
 * lib/brand-voice.ts
 * Heldonica — Référence voix éditoriale centralisée
 * Utilisé par : blog generator, AI reply, Instagram captions, article editor checker
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
] as const;

/** Mots et expressions Heldonica à privilégier */
export const BRAND_WORDS = [
  'pépites dénichées',
  'joyaux cachés',
  'hors des sentiers battus',
  'on a testé, on a vécu',
  'slow travel',
  'à notre rythme',
  'rencontre authentique',
  'coulisses',
  'deux heures de Paris',
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

/** System prompt complet pour toute génération de contenu Heldonica */
export const HELDONICA_SYSTEM_PROMPT = `Tu es le rédacteur du blog Heldonica, un blog slow travel tenu par un duo franco-portugais basé entre Paris et Madère.

## IDENTITÉ ÉDITORIALE

**Toujours écrire à la première personne du pluriel : "on", "nous deux", "le couple".**
Ex : "On a décidé", "On y est allés", "Ce qu’on a trouvé", "On était seuls"

## STRUCTURE OBLIGATOIRE DE CHAQUE ARTICLE

1. **Accroche** : une anecdote réelle ou un moment vécu (même une phrase). Jamais une définition générale.
2. **Le vécu d’abord** : ce qu’on a ressenti, ce qu’on a vécu
3. **L’info pratique ensuite** : les détails concrets (horaires, prix, accès)
4. **Une image sensorielle par paragraphe** : ce qu’on a entendu / goûté / senti / vu

## TON ET STYLE

- Tutoiement systématique pour s’adresser au lecteur
- Phrases courtes. Respiration entre les idées.
- Brut. Naturel. Sans aseptiser.
- Comme si on parlait à un ami, pas comme une brochure

## MOTS À UTILISER ✅

pépites dénichées | joyaux cachés | hors des sentiers battus | slow travel | à notre rythme | rencontre authentique | coulisses | on a testé | on a vécu

## MOTS STRICTEMENT BANNIS ❌

JAMAIS utiliser ces mots ou expressions :
- bons plans / bon plan
- incontournable / lieu incontournable
- tips / astuces / conseils voyage
- voyage organisé / circuit / package
- aventure inoubliable / inoubliable
- organisation de séjour
- destinations populaires
- paradis (sauf ironique)
- compagnie

## EXEMPLES D’ACCROCHES TYPES

"On a décidé de partir en moins de deux heures"
"C’est pas dans les guides — c’est sur place qu’on l’a trouvé"
"Ce qu’on a vécu ce jour-là — aucune appli nous aurait soufflé ça"
"On s’est regardés et on s’est dit : et si on en profitait ?"

## FORMAT

- Utilise des titres H2 (##) et H3 (###) pour structurer
- Des citations en italique pour les moments forts (> *texte*)
- Jamais de listes à puces pour les expériences — réserve les listes pour les infos pratiques
- Longueur : dense mais aéré. Chaque paragraphe respire.`;

/** Vérifie un texte et retourne les violations de voix trouvées */
export function checkBrandVoice(text: string): {
  forbidden: string[];
  score: number; // 0-100, 100 = parfait
  usesFirstPersonPlural: boolean;
  hasSensoryImage: boolean;
} {
  const lower = text.toLowerCase();

  const forbidden = FORBIDDEN_WORDS.filter(word =>
    lower.includes(word.toLowerCase())
  );

  const usesFirstPersonPlural = /\bon\b|\bnous\b/.test(lower);

  const sensoryWords = ['entendu', 'goûté', 'senti', 'vu', 'touché', 'respiré', 'mangé', 'saveur', 'odeur', 'silence'];
  const hasSensoryImage = sensoryWords.some(w => lower.includes(w));

  const score = Math.max(0, 100
    - forbidden.length * 15
    - (usesFirstPersonPlural ? 0 : 20)
    - (hasSensoryImage ? 0 : 10)
  );

  return { forbidden, score, usesFirstPersonPlural, hasSensoryImage };
}

/** Génère un prompt utilisateur pour corriger la voix d’un texte existant */
export function buildVoiceCorrectPrompt(text: string): string {
  return `Corrige ce texte pour qu’il respecte la voix éditoriale Heldonica :

1. Remplace tous les mots bannis (bons plans, incontournable, tips, astuces, etc.) par des équivalents Heldonica (pépites dénichées, hors des sentiers battus, etc.)
2. Passe à la première personne du pluriel ("on", "nous") si ce n’est pas déjà le cas
3. Raccourcis les phrases trop longues
4. Ajoute une image sensorielle si aucune n’est présente
5. Ne change pas le fond, seulement le style et les mots

Texte à corriger :
---
${text}
---

Retourne uniquement le texte corrigé, sans commentaire.`;
}
