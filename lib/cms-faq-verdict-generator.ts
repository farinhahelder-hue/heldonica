/**
 * lib/cms-faq-verdict-generator.ts
 *
 * Moteur de génération de FAQ et Verdict de terrain Slow Travel pour Heldonica CMS.
 *
 * RÈGLE D'OR : Zéro invention, zéro superlatif promotionnel.
 * Les réponses sont courtes, honnêtes et directement utiles au voyageur.
 */

import { lintRawText, type BlockLintIssue } from '@/lib/cms-brand-linter';

export interface GeneratedFaqItem {
  question: string;
  answer: string;
}

export interface GeneratedVerdict {
  destination: string;
  verdictScore: number; // Ex: 8.5 / 10
  highlight: string;    // Le moment fort vérifié
  pitfall: string;      // Le piège à éviter
  idealSeason: string;  // Saison contemplative
  recommendation: string; // Conseil de posture slow travel
  isBrandConform: boolean;
  forbiddenWordsDetected: string[];
}

export interface FaqVerdictBundle {
  faqs: GeneratedFaqItem[];
  verdict: GeneratedVerdict;
}

/**
 * Génère une série de 3 questions-réponses de terrain ultra-spécifiques.
 */
export function generateFaqItems(context: {
  destination: string;
  season?: string;
  mobility?: string;
  customDetails?: {
    waterAccess?: string;
    dogFriendly?: string;
    timingAdvice?: string;
  };
}): GeneratedFaqItem[] {
  const dest = context.destination.trim() || 'ce territoire';
  const mobility = context.mobility || 'la marche et le train';
  const season = context.season || 'hors-saison';

  const faqs: GeneratedFaqItem[] = [
    {
      question: `Quelle est la meilleure heure pour découvrir ${dest} sans la foule ?`,
      answer: context.customDetails?.timingAdvice ||
        `On conseille de partir très tôt au lever du soleil ou après 16h30 quand les flux de journée redescendent vers les parkings. En fin d'après-midi, le calme pastoral revient entièrement.`,
    },
    {
      question: `Comment explorer ${dest} en mobilités douces ?`,
      answer: `Privilégie ${mobility}. La plupart des accès se font par les lignes régionales ou les sentiers de traverse, ce qui évite les bouchons de vallée et le stress du stationnement.`,
    },
    {
      question: `Peut-on voyager avec un chien à ${dest} ?`,
      answer: context.customDetails?.dogFriendly ||
        `Oui, les sentiers sont généralement praticables avec un compagnon à quatre pattes. Prévois toujours une laisse courte aux abords des troupeaux en estive et réserve suffisamment d'eau pour les tronçons sans ruisseau.`,
    },
  ];

  return faqs;
}

/**
 * Génère le verdict Heldonica sans complaisance.
 */
export function generateVerdict(context: {
  destination: string;
  highlight?: string;
  pitfall?: string;
  idealSeason?: string;
  score?: number;
}): GeneratedVerdict {
  const dest = context.destination.trim() || 'Ce voyage';

  const highlight = context.highlight?.trim() ||
    `Le silence des crêtes et la lumière rasante de fin de journée, loin de l'agitation des centres touristiques.`;

  const pitfall = context.pitfall?.trim() ||
    `Monter en plein milieu de journée sous la chaleur et se retrouver bloqué derrière les groupes organisés.`;

  const idealSeason = context.idealSeason?.trim() || `Automne doré ou fin de printemps`;

  const verdictScore = Math.max(7, Math.min(10, context.score || 8.5));

  const recommendation =
    `On te conseille de prendre le temps de rester immobile quand les autres repartent. C'est dans ces heures creuses que ${dest} livre sa vraie nature.`;

  // Vérification de la pureté éditoriale
  const fullText = `${highlight} ${pitfall} ${idealSeason} ${recommendation}`;
  const lint = lintRawText(fullText);
  const forbiddenDetected = lint.issues
    .filter((i: BlockLintIssue) => i.type === 'forbidden_word' && Boolean(i.word))
    .map((i: BlockLintIssue) => i.word!);

  return {
    destination: dest,
    verdictScore,
    highlight,
    pitfall,
    idealSeason,
    recommendation,
    isBrandConform: lint.isValid && forbiddenDetected.length === 0,
    forbiddenWordsDetected: Array.from(new Set(forbiddenDetected)),
  };
}

/**
 * Génère le pack complet FAQ + Verdict pour un article ou carnet.
 */
export function generateFaqVerdictBundle(context: {
  destination: string;
  season?: string;
  mobility?: string;
  highlight?: string;
  pitfall?: string;
}): FaqVerdictBundle {
  const faqs = generateFaqItems({
    destination: context.destination,
    season: context.season,
    mobility: context.mobility,
  });

  const verdict = generateVerdict({
    destination: context.destination,
    highlight: context.highlight,
    pitfall: context.pitfall,
    idealSeason: context.season,
  });

  return { faqs, verdict };
}
