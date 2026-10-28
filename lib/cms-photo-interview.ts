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
 *
 * Le lieu et la date sont des faits fournis (EXIF, formulaire) : ils servent de
 * contexte. Les indices visuels, eux, ne peuvent venir que d'une analyse réelle
 * de l'image (cf. /api/cms/ai-vision) — sans elle, la liste reste vide, car
 * affirmer quoi que ce soit sur une photo qu'on n'a pas regardée est une invention.
 */
export function generatePhotoInterviewQuestions(input: {
  imageUrl: string;
  location?: string;
  date?: string;
  /** Ce que l'analyse visuelle a réellement observé. Absent = rien n'est affirmé. */
  visualClues?: string[];
}): PhotoInterviewQuestions {
  const loc = input.location?.trim() || '';
  const date = input.date?.trim() || '';
  const hasDate = Boolean(date);

  const visualClues: string[] = [];
  if (loc) visualClues.push(`Localisation repérée : ${loc}`);
  if (hasDate) visualClues.push(`Date horodatée : ${date}`);
  if (input.visualClues?.length) {
    visualClues.push(...input.visualClues.map((c) => c.trim()).filter(Boolean));
  }

  const ou = loc ? `À ${loc}` : 'Ici';

  return {
    imageUrl: input.imageUrl,
    location: loc || undefined,
    date: date || undefined,
    visualClues,
    questions: {
      sensory: `${ou}${hasDate ? ` (${date})` : ''}, quel son ou quelle odeur dominait à cet instant précis (brise marine, cloches d'alpage, café noir, bois mouillé) ?`,
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

  // 1. Synthèse de l'anecdote pour PhotoEvidenceBlock (max 200 caractères).
  // Rien n'est ajouté : sans réponse du duo, l'anecdote reste vide. Une phrase
  // de repli (« Halte vécue à … ») raconterait un vécu que personne n'a eu.
  let anecdote = '';
  if (rawSensory && rawConcrete) {
    anecdote = `${rawSensory.replace(/\.$/, '')}. ${rawConcrete}`;
  } else if (rawSensory) {
    anecdote = rawSensory;
  } else if (rawConcrete) {
    anecdote = rawConcrete;
  }

  // Tronquer à la limite de la carte, sans couper un mot en deux.
  if (anecdote.length > 200) {
    const coupe = anecdote.slice(0, 197);
    const dernierEspace = coupe.lastIndexOf(' ');
    anecdote = `${(dernierEspace > 120 ? coupe.slice(0, dernierEspace) : coupe).trim()}…`;
  }

  // 2. Paragraphe immersif : uniquement les réponses du duo, dans leur ordre.
  // Aucune phrase de liaison inventée (« on s'est posés un moment ») : elle
  // attribuerait au duo une action que ses réponses ne contiennent pas.
  const phrases: string[] = [];
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

  // 5. Blocs suggérés prêts pour BlockCanvas. La date n'est posée que si elle est
  // connue (EXIF ou saisie) : `new Date()` daterait du jour de la rédaction une
  // photo prise deux ans plus tôt — un faux qui a la forme d'une preuve.
  const suggestedBlocks: PhotoInterviewSynthesis['suggestedBlocks'] = [
    {
      type: 'photo_evidence',
      data: {
        imageUrl: meta?.imageUrl || '',
        location: loc,
        date: meta?.date || '',
        anecdote,
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
