/**
 * Heldonica CMS — Métriques de lecture éthiques & Analyse Slow Travel.
 * Règle AGENTS.md : Typage strict pur TypeScript, aucune invention de données.
 */

import type { CmsBlock } from '@/types/cms-blocks';
import { FORBIDDEN_WORDS } from '@/lib/brand-voice';

export const SLOW_READING_WPM = 190; // Mots par minute pour une lecture attentive et contemplative
export const SECONDS_PER_IMAGE = 10; // Pause contemplative par photo de terrain

export interface SlowScoreBreakdown {
  textLength: number;       // max 20
  visualEvidence: number;   // max 20
  structure: number;        // max 20
  slowTaxonomy: number;     // max 20
  bannedWordsPurity: number;// max 20
}

export interface ReadingMetricsResult {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  headingCount: number;
  imageCount: number;
  photoEvidenceCount: number;
  vaultSpotCount: number;
  readingTimeMinutes: number;
  readingTimeFormatted: string;
  readingPace: 'rapide' | 'calme' | 'immersion_longue';
  slowScore: number; // 0 à 100
  slowScoreBreakdown: SlowScoreBreakdown;
  recommendations: string[];
  detectedForbiddenWords: string[];
}

export interface ReadingMetricsInput {
  title?: string;
  excerpt?: string;
  content?: string;
  blocks?: CmsBlock[];
  season?: string;
  mobility?: string;
  budget_level?: string;
  carbon_footprint?: string;
}

/**
 * Nettoie le HTML ou les commentaires de blocs pour n'en garder que le texte brut.
 */
export function extractPlainText(rawTextOrHtml: string): string {
  if (!rawTextOrHtml) return '';
  return rawTextOrHtml
    // Supprime les blocs de sérialisation Heldonica
    .replace(/<!--\s*heldonica:blocks[\s\S]*?-->/g, '')
    // Supprime les commentaires HTML
    .replace(/<!--[\s\S]*?-->/g, '')
    // Supprime les balises scripts / styles
    .replace(/<(?:script|style)[\s\S]*?<\/(?:script|style)>/gi, '')
    // Supprime les balises HTML
    .replace(/<[^>]+>/g, ' ')
    // Normalise les espaces et retours à la ligne
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compte les mots d'un texte de façon robuste (support des apostrophes françaises).
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  // Découpe par espaces, sauts de ligne, en préservant les mots français courants
  const cleaned = text
    .trim()
    .replace(/[«»""''’]/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ');
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0 && !/^[-_]+$/.test(w));
  return words.length;
}

/**
 * Calcule l'ensemble des métriques de lecture et le score slow travel d'un article.
 */
export function computeReadingMetrics(input: ReadingMetricsInput): ReadingMetricsResult {
  const blocks = input.blocks ?? [];
  let fullText = '';
  let headingCount = 0;
  let paragraphCount = 0;
  let imageCount = 0;
  let photoEvidenceCount = 0;
  let vaultSpotCount = 0;

  if (blocks.length > 0) {
    for (const block of blocks) {
      switch (block.type) {
        case 'heading':
          headingCount++;
          fullText += ` ${block.text} ${block.subtitle ?? ''}`;
          break;
        case 'text':
          paragraphCount += block.content.split(/\n\s*\n/).filter(Boolean).length;
          fullText += ` ${extractPlainText(block.content)}`;
          break;
        case 'image':
          imageCount++;
          if (block.caption) fullText += ` ${block.caption}`;
          break;
        case 'gallery':
          imageCount += block.images.length;
          for (const img of block.images) {
            if (img.caption) fullText += ` ${img.caption}`;
          }
          break;
        case 'vault_spot':
          vaultSpotCount++;
          fullText += ` ${block.title} ${block.location} ${block.livedExperience}`;
          break;
        case 'photo_evidence':
          photoEvidenceCount++;
          fullText += ` ${block.location} ${block.anecdote}`;
          break;
        case 'list':
          paragraphCount += 1;
          fullText += ` ${block.items.join(' ')}`;
          break;
        case 'button':
          fullText += ` ${block.label}`;
          break;
        case 'video':
          if (block.caption) fullText += ` ${block.caption}`;
          break;
      }
    }
  } else if (input.content) {
    fullText = extractPlainText(input.content);
    // Estimation des titres et paragraphes dans le HTML/texte brut
    const hMatches = input.content.match(/<h[1-6][^>]*>/gi) ?? input.content.match(/^#{1,6}\s+/gm);
    headingCount = hMatches ? hMatches.length : 0;

    const pMatches = input.content.match(/<p[^>]*>/gi);
    paragraphCount = pMatches ? pMatches.length : fullText.split(/\n\s*\n/).filter(Boolean).length;

    const imgMatches = input.content.match(/<img[^>]*>/gi) ?? input.content.match(/!\[.*?\]\(.*?\)/g);
    imageCount = imgMatches ? imgMatches.length : 0;
  }

  // Ajout du titre et de l'extrait
  if (input.title) fullText = `${input.title} ${fullText}`;
  if (input.excerpt) fullText = `${input.excerpt} ${fullText}`;

  const cleanText = fullText.trim();
  const wordCount = countWords(cleanText);
  const characterCount = cleanText.length;

  // Calcul du temps de lecture
  const totalVisualItems = imageCount + photoEvidenceCount + vaultSpotCount;
  const textMinutes = wordCount / SLOW_READING_WPM;
  const visualMinutes = (totalVisualItems * SECONDS_PER_IMAGE) / 60;
  const totalMinutes = textMinutes + visualMinutes;
  const readingTimeMinutes = Math.max(1, Math.ceil(totalMinutes));

  let readingTimeFormatted: string;
  if (totalMinutes < 1) {
    readingTimeFormatted = '< 1 min de lecture';
  } else if (readingTimeMinutes === 1) {
    readingTimeFormatted = '1 min de lecture';
  } else if (readingTimeMinutes <= 7) {
    readingTimeFormatted = `${readingTimeMinutes} min de lecture calme`;
  } else {
    readingTimeFormatted = `${readingTimeMinutes} min d'immersion`;
  }

  let readingPace: 'rapide' | 'calme' | 'immersion_longue';
  if (readingTimeMinutes < 3) {
    readingPace = 'rapide';
  } else if (readingTimeMinutes <= 8) {
    readingPace = 'calme';
  } else {
    readingPace = 'immersion_longue';
  }

  // Détection des mots bannis
  const lowerText = cleanText.toLowerCase();
  const detectedForbiddenWords: string[] = [];
  for (const word of FORBIDDEN_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      detectedForbiddenWords.push(word);
    }
  }

  // Calcul du score Slow Travel (0 à 100)
  const breakdown: SlowScoreBreakdown = {
    textLength: 0,
    visualEvidence: 0,
    structure: 0,
    slowTaxonomy: 0,
    bannedWordsPurity: 0,
  };
  const recommendations: string[] = [];

  // 1. Longueur de texte (20 pts)
  if (wordCount >= 400) {
    breakdown.textLength = 20;
  } else if (wordCount >= 180) {
    breakdown.textLength = 12;
    recommendations.push('Développez le récit (viser au moins 400 mots pour une véritable immersion slow travel).');
  } else {
    breakdown.textLength = 5;
    recommendations.push('Récit très court : enrichissez les impressions sensorielles et les anecdotes.');
  }

  // 2. Preuves visuelles & terrain (20 pts)
  if (photoEvidenceCount > 0 || vaultSpotCount > 0) {
    breakdown.visualEvidence = 20;
  } else if (imageCount > 0) {
    breakdown.visualEvidence = 12;
    recommendations.push('Ajoutez un bloc « Preuve photo » ou « Pépite du Coffre » pour ancrer le vécu authentique.');
  } else {
    breakdown.visualEvidence = 0;
    recommendations.push('Aucune photo de terrain : ancrez le voyage avec au moins une photo vécue et datée.');
  }

  // 3. Structure & Rythme (20 pts)
  if (headingCount >= 2 && paragraphCount >= 3) {
    breakdown.structure = 20;
  } else if (headingCount >= 1) {
    breakdown.structure = 12;
    recommendations.push('Aérez avec plusieurs sections (au moins 2 intertitres h2 pour guider la lecture).');
  } else {
    breakdown.structure = 5;
    recommendations.push('Structurez le texte avec des intertitres pour faciliter une lecture contemplative.');
  }

  // 4. Taxonomie Slow Travel (20 pts)
  const hasSeason = Boolean(input.season && input.season.trim());
  const hasMobility = Boolean(input.mobility && input.mobility.trim());
  const hasBudget = Boolean(input.budget_level && input.budget_level.trim());
  const taxonomyFilled = [hasSeason, hasMobility, hasBudget].filter(Boolean).length;

  if (taxonomyFilled === 3) {
    breakdown.slowTaxonomy = 20;
  } else if (taxonomyFilled > 0) {
    breakdown.slowTaxonomy = taxonomyFilled * 6; // 6 ou 12 pts
    recommendations.push('Complétez la taxonomie slow (saison douce, mobilité décarbonée, budget constaté).');
  } else {
    breakdown.slowTaxonomy = 0;
    recommendations.push('Renseignez les métadonnées slow travel (saison, mobilité, budget).');
  }

  // 5. Pureté de la voix de marque (20 pts)
  if (detectedForbiddenWords.length === 0) {
    breakdown.bannedWordsPurity = 20;
  } else if (detectedForbiddenWords.length === 1) {
    breakdown.bannedWordsPurity = 10;
    recommendations.push(`Retirez l'expression bannie détectée : « ${detectedForbiddenWords[0]} ».`);
  } else {
    breakdown.bannedWordsPurity = 0;
    recommendations.push(`Retirez les ${detectedForbiddenWords.length} termes bannis détectés (${detectedForbiddenWords.slice(0, 3).join(', ')}...).`);
  }

  const slowScore =
    breakdown.textLength +
    breakdown.visualEvidence +
    breakdown.structure +
    breakdown.slowTaxonomy +
    breakdown.bannedWordsPurity;

  return {
    wordCount,
    characterCount,
    paragraphCount,
    headingCount,
    imageCount,
    photoEvidenceCount,
    vaultSpotCount,
    readingTimeMinutes,
    readingTimeFormatted,
    readingPace,
    slowScore,
    slowScoreBreakdown: breakdown,
    recommendations,
    detectedForbiddenWords,
  };
}
