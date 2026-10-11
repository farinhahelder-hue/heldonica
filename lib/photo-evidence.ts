/**
 * lib/photo-evidence.ts
 *
 * Validation d'une preuve photo vécue (bloc `photo_evidence`) au regard de la
 * règle n°1 d'AGENTS.md : une preuve n'est valide que si le lieu, la date et
 * l'anecdote sont réellement renseignés. On ne complète jamais un champ manquant.
 *
 * Retourne la liste des erreurs (tableau vide = conforme), conformément à
 * l'usage du test `__tests__/lib/cms-photo-albums.test.ts`.
 */

export interface PhotoEvidenceInput {
  imageUrl?: string;
  location?: string;
  date?: string;
  anecdote?: string;
  albumLink?: string;
}

/** Longueur maximale d'une anecdote (cf. PhotoEvidenceBlock et interviews CMS). */
export const MAX_ANECDOTE_LENGTH = 200;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d.valueOf()) && d.toISOString().startsWith(value);
}

/**
 * Valide une preuve photo. Retourne un tableau d'erreurs lisibles ;
 * un tableau vide signifie que la preuve est conforme.
 */
export function validatePhotoEvidence(input: PhotoEvidenceInput): string[] {
  const errors: string[] = [];

  const imageUrl = (input.imageUrl || '').trim();
  const location = (input.location || '').trim();
  const date = (input.date || '').trim();
  const anecdote = (input.anecdote || '').trim();

  if (!imageUrl) {
    errors.push("L'URL de la photo est obligatoire.");
  } else if (!/^https:\/\//i.test(imageUrl)) {
    errors.push("L'URL de la photo doit être en HTTPS.");
  }

  if (!location) {
    errors.push('Le lieu de prise de vue est obligatoire.');
  }

  if (!date) {
    errors.push('La date de prise de vue est obligatoire.');
  } else if (!isValidDate(date)) {
    errors.push('La date doit être au format ISO 8601 (AAAA-MM-JJ) et valide.');
  }

  if (!anecdote) {
    errors.push("L'anecdote vécue est obligatoire.");
  } else if (anecdote.length > MAX_ANECDOTE_LENGTH) {
    errors.push(`L'anecdote ne doit pas dépasser ${MAX_ANECDOTE_LENGTH} caractères.`);
  }

  if (input.albumLink && !/^https:\/\//i.test(input.albumLink.trim())) {
    errors.push("Le lien d'album doit être en HTTPS.");
  }

  return errors;
}
