/**
 * lib/cms-brand-linter.ts
 *
 * Linter temps réel pour l'éditeur modulaire de blocs du CMS Heldonica.
 * Source de vérité : lib/brand-voice.ts
 * Respect strict de la règle n°1 : "On n'invente rien."
 * Mode non-bloquant pour les brouillons (Option A).
 */

import { FORBIDDEN_WORDS, BRAND_WORDS, validateGardeFous } from '@/lib/brand-voice';
import type { CmsBlock } from '@/types/cms-blocks';

export interface BlockLintIssue {
  type: 'forbidden_word' | 'pronoun' | 'warning';
  message: string;
  word?: string;
  suggestion?: string;
}

export interface BlockLintResult {
  blockId: string;
  issues: BlockLintIssue[];
  forbiddenWords: string[];
  isValid: boolean;
}

export interface CanvasLintSummary {
  score: number;
  passed: boolean;
  isExcellent: boolean;
  totalForbidden: number;
  uniqueForbidden: string[];
  blockResults: Record<string, BlockLintResult>;
  hasPronounIssues: boolean;
  suggestions: { word: string; suggestion: string }[];
}

/** Suggestions de remplacement pour les tics et mots bannis */
export const BRAND_REPLACEMENTS: Record<string, string> = {
  'bon plan': 'pépite dénichée',
  'bons plans': 'pépites dénichées',
  'incontournable': 'étape marquante',
  'lieu incontournable': 'lieu qui nous a marqués',
  'tips': 'conseil de terrain',
  'astuce': 'détail pratique',
  'astuces': 'détails pratiques',
  'magnifique': 'décris la lumière ou le relief réel',
  'splendide': 'décris la matière ou la sensation',
  'incroyable': 'décris ce qui t\'a surpris',
  'inoubliable': 'qui reste en tête',
  'paradis': 'refuge préservé',
  'paradisiaque': 'sauvage et préservé',
  'voyage organisé': 'carnet de route à notre rythme',
  'circuit': 'itinéraire lent',
  'spot': 'recoin / adresse',
  'optimiser': 'savourer / prendre le temps',
  'les voyageurs': 'tu',
  'les touristes': 'les passants',
};

/** Extrait le texte éditorial d'un bloc quelconque */
export function extractTextFromBlock(block: CmsBlock): string {
  switch (block.type) {
    case 'heading':
      return [(block as any).text || (block as any).content, block.subtitle].filter(Boolean).join(' ');
    case 'text':
      return block.content || '';
    case 'button':
      return block.label || '';
    case 'image':
      return block.caption || '';
    case 'gallery':
      return (block.images || []).map((img) => img.caption || '').join(' ');
    case 'video':
      return block.caption || '';
    case 'list':
      return (block.items || []).join(' ');
    case 'vault_spot':
      return [block.title, block.location, block.livedExperience].filter(Boolean).join(' ');
    case 'photo_evidence':
      return [block.location, block.anecdote].filter(Boolean).join(' ');
    default:
      return '';
  }
}

/** Analyse un bloc individuel contre les règles de voix */
export function lintBlock(block: CmsBlock): BlockLintResult {
  const text = extractTextFromBlock(block);
  const lower = text.toLowerCase();
  const issues: BlockLintIssue[] = [];
  const forbiddenFound: string[] = [];

  if (!text.trim()) {
    return {
      blockId: block.id,
      issues: [],
      forbiddenWords: [],
      isValid: true,
    };
  }

  // 1. Détection des mots bannis
  for (const forbidden of FORBIDDEN_WORDS) {
    const fLower = forbidden.toLowerCase();
    // Évite les faux positifs sur sous-chaînes courtes
    const escaped = fLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zà-ÿ0-9])${escaped}([^a-zà-ÿ0-9]|$)`, 'i');
    if (regex.test(lower)) {
      forbiddenFound.push(forbidden);
      const suggestion = BRAND_REPLACEMENTS[forbidden] || 'reformuler sans superlatif';
      issues.push({
        type: 'forbidden_word',
        word: forbidden,
        message: `Mot banni détecté : "${forbidden}"`,
        suggestion,
      });
    }
  }

  // 2. Détection des pronoms prohibés en B2C
  const hasJe = /\b(je|j'|moi|mon|ma|mes)\b/i.test(lower);
  const hasSubjectNous = /\b(nous\s+(avons|allons|sommes|étions|partons|faisons|découvrons))\b/i.test(lower);
  const hasTravelers = /\b(les\s+voyageurs|les\s+touristes)\b/i.test(lower);

  if (hasJe) {
    issues.push({
      type: 'pronoun',
      message: 'Pronom "je" détecté — Heldonica s\'exprime toujours avec "on" (le duo)',
      suggestion: 'Utiliser "on"',
    });
  }
  if (hasSubjectNous) {
    issues.push({
      type: 'pronoun',
      message: 'Sujet "nous" détecté — privilégier "on" pour préserver le ton complice et direct',
      suggestion: 'Remplacer par "on"',
    });
  }
  if (hasTravelers) {
    issues.push({
      type: 'pronoun',
      message: '"Les voyageurs / touristes" détecté — tutoyer directement le lecteur avec "tu"',
      suggestion: 'Utiliser "tu" / "toi"',
    });
  }

  return {
    blockId: block.id,
    issues,
    forbiddenWords: forbiddenFound,
    isValid: issues.length === 0,
  };
}

/** Analyse l'ensemble des blocs d'un canvas pour produire un rapport global */
export function lintCanvasBlocks(blocks: CmsBlock[]): CanvasLintSummary {
  const blockResults: Record<string, BlockLintResult> = {};
  const allTexts: string[] = [];
  const uniqueForbiddenSet = new Set<string>();
  let hasPronounIssues = false;

  for (const b of blocks) {
    const res = lintBlock(b);
    blockResults[b.id] = res;
    res.forbiddenWords.forEach((w) => uniqueForbiddenSet.add(w));
    if (res.issues.some((i) => i.type === 'pronoun')) {
      hasPronounIssues = true;
    }
    const t = extractTextFromBlock(b);
    if (t) allTexts.push(t);
  }

  const combinedText = allTexts.join('\n\n');
  const gardeFousRes = combinedText.length > 0
    ? validateGardeFous(combinedText, 'b2c')
    : { score: 100, passed: true, isExcellent: true };

  const uniqueForbidden = Array.from(uniqueForbiddenSet);
  const suggestions = uniqueForbidden.map((w) => ({
    word: w,
    suggestion: BRAND_REPLACEMENTS[w] || 'reformuler sans superlatif',
  }));

  return {
    score: gardeFousRes.score,
    passed: gardeFousRes.passed,
    isExcellent: gardeFousRes.isExcellent,
    totalForbidden: uniqueForbidden.length,
    uniqueForbidden,
    blockResults,
    hasPronounIssues,
    suggestions,
  };
}

/** Analyse un texte brut contre les règles éditoriales sans nécessiter un CmsBlock */
export function lintRawText(text: string) {
  const dummyBlock: CmsBlock = {
    id: 'raw-text',
    type: 'text',
    content: text,
  };
  const blockRes = lintBlock(dummyBlock);
  const gardeFous = validateGardeFous(text, 'b2c');
  return {
    score: gardeFous.score,
    passed: gardeFous.passed,
    isExcellent: gardeFous.isExcellent,
    issues: blockRes.issues,
    forbiddenWords: blockRes.forbiddenWords,
    isValid: blockRes.isValid,
  };
}
