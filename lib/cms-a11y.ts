/**
 * lib/cms-a11y.ts
 *
 * Audit d'accessibilité sémantique (A11y) pour l'éditeur modulaire du CMS Heldonica.
 * Conforme aux normes WCAG 2.1 AA :
 *  - Images & Galeries : présence obligatoire d'un texte alternatif (alt) descriptif
 *  - Structure des titres : hiérarchie logique sans saut abrupt de niveau (ex: H1 -> H3)
 *  - Boutons d'action : label explicite et lien valide
 *  - Vidéos : présence d'une légende ou titre accessible
 */

import type { CmsBlock } from '@/types/cms-blocks';

export interface A11yIssue {
  blockId: string;
  type: 'missing_alt' | 'heading_hierarchy' | 'empty_button' | 'missing_caption' | 'invalid_url';
  severity: 'error' | 'warning';
  message: string;
  suggestion: string;
}

export interface A11yReport {
  score: number; // 0 à 100
  isValid: boolean; // true si 0 erreur bloquante
  issues: A11yIssue[];
  errorsCount: number;
  warningsCount: number;
}

/**
 * Audite l'accessibilité de l'ensemble des blocs d'un document.
 */
export function auditCanvasA11y(blocks: CmsBlock[]): A11yReport {
  const issues: A11yIssue[] = [];
  let previousHeadingLevel: number | null = null;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const currentLevel = block.level;
        // Vérification du saut de niveau (ex: H1 direct vers H3 ou H4)
        if (previousHeadingLevel !== null && currentLevel > previousHeadingLevel + 1) {
          issues.push({
            blockId: block.id,
            type: 'heading_hierarchy',
            severity: 'warning',
            message: `Saut de niveau de titre : passage de H${previousHeadingLevel} à H${currentLevel}`,
            suggestion: `Utilisez un titre H${previousHeadingLevel + 1} pour préserver la structure sémantique pour les lecteurs d'écran.`,
          });
        }
        previousHeadingLevel = currentLevel;
        break;
      }

      case 'image': {
        const alt = (block.alt || '').trim();
        if (!alt) {
          issues.push({
            blockId: block.id,
            type: 'missing_alt',
            severity: 'error',
            message: 'Image sans texte alternatif (alt text manquant)',
            suggestion: 'Décrivez précisément ce que montre la photo pour les personnes malvoyantes.',
          });
        } else if (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('photo de')) {
          issues.push({
            blockId: block.id,
            type: 'missing_alt',
            severity: 'warning',
            message: 'Texte alternatif redondant ("photo de...", "image")',
            suggestion: 'Décrivez directement la scène sans préfixer par "photo de".',
          });
        }
        break;
      }

      case 'gallery': {
        (block.images || []).forEach((img, idx) => {
          const alt = (img.alt || '').trim();
          if (!alt) {
            issues.push({
              blockId: block.id,
              type: 'missing_alt',
              severity: 'error',
              message: `Photo n°${idx + 1} de la galerie sans texte alternatif`,
              suggestion: 'Ajoutez une courte description du sujet photographié.',
            });
          }
        });
        break;
      }

      case 'button': {
        const label = (block.label || '').trim();
        const url = (block.url || '').trim();
        if (!label) {
          issues.push({
            blockId: block.id,
            type: 'empty_button',
            severity: 'error',
            message: 'Bouton d\'action sans texte (intitulé vide)',
            suggestion: 'Ajoutez un libellé clair indiquant la destination du clic.',
          });
        }
        if (!url || url === '#') {
          issues.push({
            blockId: block.id,
            type: 'invalid_url',
            severity: 'warning',
            message: 'Bouton sans lien de destination défini',
            suggestion: 'Renseignez l\'URL de destination.',
          });
        }
        break;
      }

      case 'video': {
        const caption = (block.caption || '').trim();
        if (!caption) {
          issues.push({
            blockId: block.id,
            type: 'missing_caption',
            severity: 'warning',
            message: 'Vidéo sans légende descriptive',
            suggestion: 'Ajoutez une brève légende expliquant le contenu de la vidéo.',
          });
        }
        break;
      }

      case 'photo_evidence': {
        if (!block.location?.trim()) {
          issues.push({
            blockId: block.id,
            type: 'missing_alt',
            severity: 'warning',
            message: 'Preuve photo sans indication de lieu précis',
            suggestion: 'Indiquez la commune ou le sentier exact.',
          });
        }
        break;
      }
    }
  }

  const errorsCount = issues.filter((i) => i.severity === 'error').length;
  const warningsCount = issues.filter((i) => i.severity === 'warning').length;

  // Calcul du score A11y : base 100, -15 par erreur, -5 par avertissement
  let score = 100 - errorsCount * 15 - warningsCount * 5;
  if (score < 0) score = 0;

  return {
    score,
    isValid: errorsCount === 0,
    issues,
    errorsCount,
    warningsCount,
  };
}
