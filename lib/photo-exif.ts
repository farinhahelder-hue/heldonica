/**
 * lib/photo-exif.ts
 *
 * Extraction EXIF réelle des photos importées (date de prise de vue, coordonnées
 * GPS) et détection des images de banque (« stock ») à partir de signaux
 * concrets et vérifiables — jamais d'invention.
 *
 * Règle AGENTS.md : on n'invente rien. Une date ou un GPS n'est renseigné que
 * s'il est réellement présent dans le fichier. `detectStockPhoto` ne s'appuie
 * que sur des indices observables (hébergeur, identifiant générique connu,
 * nom de fichier), et non sur une supposition.
 */

import exifr from 'exifr';
import { GENERIC_PHOTO_IDS } from '@/lib/generic-photos';

export interface PhotoExifResult {
  /** Date de prise de vue ISO 8601, si présente dans l'EXIF ou le nom de fichier. */
  date?: string;
  /** Vrai si l'image ressemble à une image de banque (indices concrets). */
  isStockCandidate?: boolean;
  /** Justification lisible des indices relevés. */
  stockReasons?: string[];
  /** Coordonnées GPS décimales, si présentes. */
  gps?: { latitude?: number; longitude?: number };
}

export interface StockDetection {
  isStockCandidate: boolean;
  reasons: string[];
}

/** Hébergeurs de banques d'images reconnus. */
const STOCK_HOSTS = [
  'unsplash.com',
  'images.unsplash.com',
  'pexels.com',
  'pixabay.com',
  'shutterstock.com',
  'gettyimages.',
  'istockphoto.com',
  'adobe.com/stock',
  'stock.adobe.com',
  'dreamstime.com',
  'depositphotos.com',
  'freepik.com',
  'alamy.com',
];

/** Fragments de nom de fichier typiques d'un export de banque d'images. */
const STOCK_NAME_HINTS = [
  'shutterstock_',
  'stock-photo',
  'stockphoto',
  'istock-',
  'gettyimages-',
  'pexels-',
  'unsplash-',
];

/**
 * Extrait la date de prise de vue encodée dans certains noms de fichiers
 * d'appareil (ex. PXL_20260527_182137166.jpg, IMG_20250712_154207.jpg).
 * Retourne null si aucune date exploitable — on ne devine pas.
 */
function dateFromFilename(name: string): string | null {
  const m = name.match(/(20\d{2})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
  return isNaN(date.valueOf()) ? null : date.toISOString();
}

/**
 * Analyse une image et retourne ses métadonnées réelles.
 * Ne lève jamais : en cas d'échec de lecture, retourne un objet vide.
 */
export async function extractPhotoExif(
  buffer: Buffer,
  filename: string
): Promise<PhotoExifResult> {
  const result: PhotoExifResult = {};

  try {
    const parsed = await exifr.parse(buffer, { gps: true, tiff: true, exif: true });

    if (parsed) {
      const taken: Date | undefined =
        parsed.DateTimeOriginal || parsed.CreateDate || parsed.ModifyDate;
      if (taken instanceof Date && !isNaN(taken.valueOf())) {
        result.date = taken.toISOString();
      }

      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        result.gps = { latitude: parsed.latitude, longitude: parsed.longitude };
      }
    }
  } catch {
    // Fichier non lisible par exifr (vidéo, format inconnu) : on continue.
  }

  // Repli documenté : la date peut être encodée dans le nom du fichier appareil.
  if (!result.date) {
    const fromName = dateFromFilename(filename);
    if (fromName) result.date = fromName;
  }

  const stock = detectStockPhoto(filename);
  result.isStockCandidate = stock.isStockCandidate;
  result.stockReasons = stock.reasons;

  return result;
}

/**
 * Détecte une image de banque à partir d'une URL ou d'un nom de fichier.
 * Seuls des indices concrets déclenchent le verdict ; sinon `false`.
 */
export function detectStockPhoto(urlOrName: string): StockDetection {
  const value = (urlOrName || '').toLowerCase();
  const reasons: string[] = [];

  if (!value) return { isStockCandidate: false, reasons };

  for (const host of STOCK_HOSTS) {
    if (value.includes(host)) {
      reasons.push(`Hébergeur de banque d'images détecté : ${host}`);
    }
  }

  for (const hint of STOCK_NAME_HINTS) {
    if (value.includes(hint)) {
      reasons.push(`Nom de fichier typique d'une banque d'images : ${hint}`);
    }
  }

  // Identifiants Unsplash déjà recensés comme génériques (jamais propres au sujet).
  for (const id of GENERIC_PHOTO_IDS) {
    if (value.includes(id)) {
      reasons.push(`Identifiant Unsplash générique recensé : ${id}`);
      break;
    }
  }

  return { isStockCandidate: reasons.length > 0, reasons };
}
