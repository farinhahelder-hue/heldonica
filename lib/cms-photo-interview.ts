/**
 * lib/cms-photo-interview.ts
 *
 * Moteur d'Interview Éclair de Photos & Synthèse Récit Vécue pour Heldonica CMS.
 *
 * RÈGLE D'OR N°1 : "On n'invente rien. On raconte ce qu'on a vécu."
 * L'IA n'invente aucun ressenti ni aucun prix : elle pose les questions manquantes
 * au duo fondateur, puis tisse leurs réponses selon la charte de voix Heldonica
 * (pronom "on", verbes actifs, 0 mot banni).
 */

import { FORBIDDEN_WORDS } from '@/lib/brand-voice';
import { lintRawText, type BlockLintIssue } from '@/lib/cms-brand-linter';

export interface PhotoInterviewQuestions {
  imageUrl: string;
  location?: string;
  date?: string;
  visualClues: string[];
  questions: {
    sensory: string;      // Son, odeur, atmosphère, météo ressentie
    concrete: string;     // Prix au comptoir, état de la route/sentier, rencontre
    counterpoint: string; // Ce qu'on a moins aimé, déception honnête, fatigue
  };
}

export interface PhotoInterviewAnswers {
  sensory: string;
  concrete: string;
  counterpoint?: string;
}

export interface PhotoInterviewSynthesis {
  anecdote: string;         // Anecdote concise max 200 caractères pour PhotoEvidenceBlock
  richParagraph: string;    // Récit immersif de 2-4 phrases pour TextBlock
  counterpointNote: string; // "Ce qu'on a moins aimé" pour la transparence
  brandScore: number;       // Score 0-100
  isBrandConform: boolean;
  forbiddenWordsDetected: string[];
  suggestedBlocks: {
    type: 'photo_evidence' | 'text';
    data: any;
  }[];
}

/**
 * Génère 3 questions d'interview ciblées à partir d'une photo et de son contexte.
 */
export function generatePhotoInterviewQuestions(input: {
  imageUrl: string;
  location?: string;
  date?: string;
}): PhotoInterviewQuestions {
  const loc = input.location?.trim() || 'ce lieu';
  const hasDate = Boolean(input.date?.trim());

  // Indices visuels contextuels déduits ou par défaut
  const visualClues: string[] = [];
  if (input.location) visualClues.push(`Localisation repérée : ${input.location}`);
  if (input.date) visualClues.push(`Date horodatée : ${input.date}`);
  visualClues.push('Lumière naturelle & cadrage de terrain');

  return {
    imageUrl: input.imageUrl,
    location: input.location,
    date: input.date,
    visualClues,
    questions: {
      sensory: `À ${loc}${hasDate ? ` (${input.date})` : ''}, quel son ou quelle odeur dominait à cet instant précis (brise marine, cloches d'alpage, café noir, bois mouillé) ?`,
      concrete: `Quel détail pratique avez-vous constaté sur place (prix du café/billet en €, état du sentier, foule ou solitude) ?`,
      counterpoint: `Qu'avez-vous moins aimé ou trouvé rude à cet endroit (chaleur de la vallée, vent froid, attente, accès raide) ?`,
    },
  };
}

/**
 * Nettoie une chaîne de toute trace de superlatifs interdits ou de tics IA.
 */
function purifyUserInput(text: string): string {
  let clean = text.trim();
  for (const forbidden of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${forbidden}\\b`, 'gi');
    clean = clean.replace(regex, '');
  }
  // Nettoyer les espaces résiduels
  return clean.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Tisse les réponses brutes du fondateur en récit Heldonica certifié.
 */
export function synthesizePhotoInterview(
  answers: PhotoInterviewAnswers,
  meta?: { location?: string; date?: string; imageUrl?: string }
): PhotoInterviewSynthesis {
  const rawSensory = (answers.sensory || '').trim();
  const rawConcrete = (answers.concrete || '').trim();
  const rawCounterpoint = (answers.counterpoint || '').trim();

  const loc = meta?.location ? meta.location.trim() : '';

  // 1. Synthèse de l'anecdote pour PhotoEvidenceBlock (max 200 caractères)
  let anecdote = '';
  if (rawSensory && rawConcrete) {
    anecdote = `${rawSensory.replace(/\.$/, '')}. ${rawConcrete}`;
  } else if (rawSensory) {
    anecdote = rawSensory;
  } else if (rawConcrete) {
    anecdote = rawConcrete;
  } else {
    anecdote = loc ? `Halte vécue à ${loc}.` : 'Halte vécue sur le terrain.';
  }

  // Tronquer proprement à 200 caractères max
  if (anecdote.length > 195) {
    anecdote = anecdote.slice(0, 192).trim() + '...';
  }

  // 2. Synthèse du paragraphe immersif pour TextBlock
  const phrases: string[] = [];
  if (loc) {
    phrases.push(`À ${loc}, on s'est posés un moment pour absorber le lieu.`);
  } else {
    phrases.push(`On a pris le temps d'observer sans rien presser.`);
  }

  if (rawSensory) {
    phrases.push(rawSensory.endsWith('.') ? rawSensory : `${rawSensory}.`);
  }

  if (rawConcrete) {
    phrases.push(rawConcrete.endsWith('.') ? rawConcrete : `${rawConcrete}.`);
  }

  const richParagraph = phrases.join(' ');

  // 3. Synthèse de la note honnête ("Ce qu'on a moins aimé")
  const counterpointNote = rawCounterpoint
    ? `Ce qu'on a moins aimé : ${rawCounterpoint}`
    : '';

  // 4. Contrôle de la voix de marque via le linter canonique
  const fullTextToLint = `${anecdote} ${richParagraph} ${counterpointNote}`;
  const lint = lintRawText(fullTextToLint);

  const forbiddenDetected = lint.issues
    .filter((i: BlockLintIssue) => i.type === 'forbidden_word' && Boolean(i.word))
    .map((i: BlockLintIssue) => i.word!);

  const brandScore = lint.score;
  const isBrandConform = lint.passed && forbiddenDetected.length === 0;

  // 5. Blocs suggérés prêts pour BlockCanvas
  const suggestedBlocks: PhotoInterviewSynthesis['suggestedBlocks'] = [
    {
      type: 'photo_evidence',
      data: {
        imageUrl: meta?.imageUrl || '',
        location: loc || 'Lieu vérifié',
        date: meta?.date || new Date().toISOString().split('T')[0],
        anecdote: anecdote,
      },
    },
    {
      type: 'text',
      data: {
        content: counterpointNote
          ? `<p>${richParagraph}</p><p><em>${counterpointNote}</em></p>`
          : `<p>${richParagraph}</p>`,
      },
    },
  ];

  return {
    anecdote,
    richParagraph,
    counterpointNote,
    brandScore,
    isBrandConform,
    forbiddenWordsDetected: Array.from(new Set(forbiddenDetected)),
    suggestedBlocks,
  };
}
