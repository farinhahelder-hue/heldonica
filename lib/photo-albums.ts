/**
 * lib/photo-albums.ts
 *
 * Validation des métadonnées d'une photo de terrain avant enregistrement
 * (route `app/api/cms/photos/upload`). Règle n°1 d'AGENTS.md : « on n'invente
 * rien ». Un champ vécu n'est accepté que s'il est réellement fourni et
 * cohérent ; la validation refuse plutôt que de compléter d'office.
 *
 * Le registre des albums vérifiés vit dans `lib/cms-photo-albums.ts` ;
 * ce module ne contient que la validation, pour éviter un import circulaire.
 */

export interface AlbumPhotoGps {
  latitude: number;
  longitude: number;
}

export interface AlbumPhotoInput {
  imageUrl?: string;
  location?: string;
  date?: string;
  anecdote?: string;
  albumId?: string;
  gps?: AlbumPhotoGps;
}

export interface AlbumPhotoValidated {
  imageUrl: string;
  location: string;
  date: string;
  anecdote: string;
  albumId: string;
  gps?: AlbumPhotoGps;
}

export interface AlbumPhotoValidationResult {
  ok: boolean;
  issues?: string[];
  data: AlbumPhotoValidated;
}

/** Longueur maximale d'une anecdote (cf. PhotoEvidenceBlock et interviews CMS). */
export const MAX_ANECDOTE_LENGTH = 200;

const DEFAULT_ALBUM_ID = 'divers';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d.valueOf()) && d.toISOString().startsWith(value);
}

function isValidGps(gps: AlbumPhotoGps | undefined): boolean {
  if (!gps) return true;
  const { latitude, longitude } = gps;
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Valide une photo d'album. Retourne `{ ok: true, data }` si tout est conforme,
 * sinon `{ ok: false, issues, data }` avec la liste précise des manquements.
 * `data` contient la version normalisée (champs trimmés, albumId par défaut).
 */
export function validateAlbumPhotoMeta(input: AlbumPhotoInput): AlbumPhotoValidationResult {
  const issues: string[] = [];

  const imageUrl = (input.imageUrl || '').trim();
  const location = (input.location || '').trim();
  const date = (input.date || '').trim();
  const anecdote = (input.anecdote || '').trim();
  const albumId = (input.albumId || '').trim() || DEFAULT_ALBUM_ID;

  if (!imageUrl) {
    issues.push("L'URL de la photo est obligatoire.");
  } else if (!/^https:\/\//i.test(imageUrl)) {
    issues.push("L'URL de la photo doit être en HTTPS.");
  }

  if (!location) {
    issues.push('Le lieu de prise de vue est obligatoire.');
  }

  if (!date) {
    issues.push('La date de prise de vue est obligatoire.');
  } else if (!isValidDate(date)) {
    issues.push('La date doit être au format ISO 8601 (AAAA-MM-JJ) et valide.');
  }

  if (!anecdote) {
    issues.push("L'anecdote vécue est obligatoire.");
  } else if (anecdote.length > MAX_ANECDOTE_LENGTH) {
    issues.push(`L'anecdote ne doit pas dépasser ${MAX_ANECDOTE_LENGTH} caractères.`);
  }

  const gps = input.gps;
  if (gps && !isValidGps(gps)) {
    issues.push('Les coordonnées GPS sont hors limites.');
  }

  const data: AlbumPhotoValidated = { imageUrl, location, date, anecdote, albumId };
  if (gps && isValidGps(gps)) {
    data.gps = { latitude: gps.latitude, longitude: gps.longitude };
  }

  return issues.length === 0 ? { ok: true, data } : { ok: false, issues, data };
}
