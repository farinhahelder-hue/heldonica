/**
 * Heldonica CMS — Comparateur Visuel de Révisions de Blocs (Visual Block Diff)
 *
 * Compare deux versions d'un arbre de blocs modulaires (version courante vs révision archivée).
 * Identifie les ajouts, suppressions, modifications et blocs inchangés.
 *
 * Règle AGENTS.md n°1 : On n'invente rien. Typage TypeScript strict, zéro dépendance tierce.
 */

import type { CmsBlock } from '@/types/cms-blocks';

export type BlockDiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface BlockDiffEntry {
  id: string;
  type: string;
  diffType: BlockDiffType;
  title: string;
  summary: string;
  details?: {
    before?: string;
    after?: string;
  };
}

export interface BlockDiffSummary {
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
  totalEntries: number;
  entries: BlockDiffEntry[];
}

/**
 * Extrait un résumé lisible du contenu d'un bloc.
 */
export function getBlockSummary(block: CmsBlock): { title: string; summary: string } {
  switch (block.type) {
    case 'heading':
      return {
        title: `Titre H${block.level}`,
        summary: block.text || 'Titre vide',
      };
    case 'text':
      return {
        title: 'Paragraphe',
        summary: block.content ? block.content.slice(0, 100) + (block.content.length > 100 ? '…' : '') : 'Texte vide',
      };
    case 'image':
      return {
        title: 'Image',
        summary: block.alt || block.caption || block.url || 'Image sans description',
      };
    case 'gallery':
      return {
        title: 'Galerie Photos',
        summary: `${block.images?.length || 0} cliché(s) (${block.displayMode})`,
      };
    case 'photo_evidence':
      return {
        title: 'Preuve de terrain 📍',
        summary: `${block.location || 'Lieu'} — ${block.date || 'Date'} : « ${block.anecdote?.slice(0, 60) || ''}… »`,
      };
    case 'vault_spot':
      return {
        title: 'Pépite du Coffre ✨',
        summary: `${block.title} (${block.location || 'Lieu'})`,
      };
    case 'button':
      return {
        title: 'Bouton d’action',
        summary: `${block.label} ➔ ${block.url}`,
      };
    case 'list':
      return {
        title: `Liste (${block.style})`,
        summary: `${block.items?.length || 0} point(s)`,
      };
    case 'video':
      return {
        title: 'Vidéo',
        summary: block.url || 'Vidéo',
      };
    default:
      return {
        title: 'Bloc',
        summary: (block as any).id || '',
      };
  }
}

/**
 * Détermine si deux blocs ont un contenu identique.
 */
function areBlocksEqual(a: CmsBlock, b: CmsBlock): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case 'heading': {
      const bH = b as typeof a;
      return a.level === bH.level && a.text === bH.text && a.subtitle === bH.subtitle;
    }
    case 'text': {
      const bT = b as typeof a;
      return a.content === bT.content;
    }
    case 'image': {
      const bI = b as typeof a;
      return a.url === bI.url && a.alt === bI.alt && a.caption === bI.caption && a.layout === bI.layout;
    }
    case 'gallery': {
      const bG = b as typeof a;
      return (
        a.displayMode === bG.displayMode &&
        JSON.stringify(a.images || []) === JSON.stringify(bG.images || [])
      );
    }
    case 'photo_evidence': {
      const bP = b as typeof a;
      return (
        a.imageUrl === bP.imageUrl &&
        a.location === bP.location &&
        a.date === bP.date &&
        a.anecdote === bP.anecdote
      );
    }
    case 'vault_spot': {
      const bV = b as typeof a;
      return a.spotId === bV.spotId && a.title === bV.title && a.livedExperience === bV.livedExperience;
    }
    case 'button': {
      const bB = b as typeof a;
      return a.label === bB.label && a.url === bB.url;
    }
    case 'list': {
      const bL = b as typeof a;
      return a.style === bL.style && JSON.stringify(a.items || []) === JSON.stringify(bL.items || []);
    }
    case 'video': {
      const bVid = b as typeof a;
      return a.url === bVid.url && a.aspectRatio === bVid.aspectRatio;
    }
    default:
      return JSON.stringify(a) === JSON.stringify(b);
  }
}

/**
 * Compare l'état actuel des blocs avec une version archivée.
 *
 * Perspective de la révision cible :
 * - `added` : Bloc présent dans la révision mais absent de la version actuelle (sera réinséré lors du rollback).
 * - `removed` : Bloc présent dans la version actuelle mais absent de la révision (disparaîtra lors du rollback).
 * - `modified` : Bloc présent des deux côtés mais dont le contenu diffère.
 * - `unchanged` : Bloc strictement identique des deux côtés.
 */
export function computeBlockDiff(currentBlocks: CmsBlock[], revisionBlocks: CmsBlock[]): BlockDiffSummary {
  const currentMap = new Map<string, CmsBlock>();
  currentBlocks.forEach((b) => currentMap.set(b.id, b));

  const revisionMap = new Map<string, CmsBlock>();
  revisionBlocks.forEach((b) => revisionMap.set(b.id, b));

  const entries: BlockDiffEntry[] = [];
  const processedCurrentIds = new Set<string>();

  // 1. Parcourir les blocs de la révision
  revisionBlocks.forEach((revBlock, index) => {
    // Tentative d'association par id
    let curBlock = currentMap.get(revBlock.id);

    // Fallback : association positionnelle si même type et non déjà associé
    if (!curBlock && index < currentBlocks.length) {
      const candidate = currentBlocks[index];
      if (candidate.type === revBlock.id && !revisionMap.has(candidate.id)) {
        curBlock = candidate;
      }
    }

    if (!curBlock) {
      // Présent dans la révision, absent actuellement
      const { title, summary } = getBlockSummary(revBlock);
      entries.push({
        id: revBlock.id,
        type: revBlock.type,
        diffType: 'added',
        title,
        summary: `Sera restauré : ${summary}`,
        details: { after: summary },
      });
    } else {
      processedCurrentIds.add(curBlock.id);
      if (areBlocksEqual(curBlock, revBlock)) {
        const { title, summary } = getBlockSummary(revBlock);
        entries.push({
          id: revBlock.id,
          type: revBlock.type,
          diffType: 'unchanged',
          title,
          summary,
        });
      } else {
        const curInfo = getBlockSummary(curBlock);
        const revInfo = getBlockSummary(revBlock);
        entries.push({
          id: revBlock.id,
          type: revBlock.type,
          diffType: 'modified',
          title: revInfo.title,
          summary: `Modifié : ${revInfo.summary}`,
          details: {
            before: curInfo.summary,
            after: revInfo.summary,
          },
        });
      }
    }
  });

  // 2. Repérer les blocs actuels absents de la révision (seront supprimés par le rollback)
  currentBlocks.forEach((curBlock) => {
    if (!processedCurrentIds.has(curBlock.id) && !revisionMap.has(curBlock.id)) {
      const { title, summary } = getBlockSummary(curBlock);
      entries.push({
        id: curBlock.id,
        type: curBlock.type,
        diffType: 'removed',
        title,
        summary: `Sera retiré : ${summary}`,
        details: { before: summary },
      });
    }
  });

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  entries.forEach((e) => {
    if (e.diffType === 'added') addedCount++;
    else if (e.diffType === 'removed') removedCount++;
    else if (e.diffType === 'modified') modifiedCount++;
    else if (e.diffType === 'unchanged') unchangedCount++;
  });

  return {
    addedCount,
    removedCount,
    modifiedCount,
    unchangedCount,
    totalEntries: entries.length,
    entries,
  };
}
