/**
 * Heldonica CMS — Indexation Contextuelle Albums Photo ↔ Coffre des Savoirs.
 *
 * Implémentation de la tâche Inc-15 (attribuée initialement à Freebuff).
 * Règle AGENTS.md n°1 : On n'invente rien.
 * Établit des correspondances sémantiques et géographiques entre les albums de terrain
 * certifiés et les fiches du Coffre des Savoirs RAG.
 */

import { VERIFIED_PHOTO_ALBUMS, type PhotoEvidenceAlbum, type PhotoEvidenceItem } from '@/lib/cms-photo-albums';
import { VAULT_SPOTS, type VaultSpotRecord } from '@/lib/cms-vault-spots';

export interface MatchedVaultFiche {
  id: string;
  title: string;
  category: string;
  location: string;
  excerpt: string;
  score: number; // 0.00 à 1.00
  matchingKeywords: string[];
}

export interface AlbumContextSuggestion {
  albumId: string;
  albumTitle: string;
  destination: string;
  photosCount: number;
  suggestedFiches: MatchedVaultFiche[];
}

/** Stopwords français ignorés lors de l'indexation sémantique */
const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'en', 'et', 'au', 'aux',
  'a', 'à', 'ce', 'cet', 'cette', 'ces', 'par', 'pour', 'sur', 'dans', 'avec', 'sans',
  'qui', 'que', 'quoi', 'dont', 'ou', 'où', 'est', 'sont', 'nous', 'vous', 'ils',
  'on', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'se', 'sa', 'son', 'ses',
  'plus', 'très', 'bien', 'tout', 'tous', 'toute', 'toutes', 'comme', 'si', 'fait'
]);

/** Normalise une chaîne de caractères en ensemble de mots-clés distincts */
function tokenize(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // suppression des diacritiques
    .replace(/[^a-z0-9]/g, ' ');

  const tokens = new Set<string>();
  for (const part of normalized.split(/\s+/)) {
    const trimmed = part.trim();
    if (trimmed.length >= 3 && !STOPWORDS.has(trimmed)) {
      tokens.add(trimmed);
    }
  }
  return tokens;
}

/**
 * Calcule un score de pertinence entre un ensemble de tokens de requête
 * et une fiche du Coffre des Savoirs.
 */
function scoreFiche(queryTokens: Set<string>, fiche: VaultSpotRecord): { score: number; matches: string[] } {
  const ficheTokens = new Set<string>();

  // Titre & Lieu (poids 3)
  const titleTokens = tokenize(`${fiche.title} ${fiche.location}`);
  // Tags (poids 2)
  const tagTokens = tokenize(fiche.tags.join(' '));
  // Expérience vécue (poids 1)
  const expTokens = tokenize(fiche.livedExperience);

  let rawScore = 0;
  const matches: string[] = [];

  for (const qt of queryTokens) {
    let matched = false;
    if (titleTokens.has(qt)) {
      rawScore += 3.0;
      matched = true;
    } else if (tagTokens.has(qt)) {
      rawScore += 2.0;
      matched = true;
    } else if (expTokens.has(qt)) {
      rawScore += 1.0;
      matched = true;
    }

    if (matched) {
      matches.push(qt);
    }
  }

  // Normalisation du score entre 0 et 1 (base empirique maximale ~12)
  const normalizedScore = Math.min(1, Number((rawScore / 10).toFixed(2)));

  return {
    score: normalizedScore,
    matches,
  };
}

/**
 * Établit les meilleures correspondances entre un album photo et les fiches du Coffre.
 */
export function matchAlbumToVaultSpots(album: PhotoEvidenceAlbum, maxResults = 5): MatchedVaultFiche[] {
  const allTexts = [
    album.title,
    album.destination,
    ...album.photos.map((p) => `${p.location} ${p.suggestedAnecdote}`),
  ].join(' ');

  const queryTokens = tokenize(allTexts);
  const scoredFiches: MatchedVaultFiche[] = [];

  for (const fiche of VAULT_SPOTS) {
    const { score, matches } = scoreFiche(queryTokens, fiche);
    if (score > 0) {
      scoredFiches.push({
        id: fiche.id,
        title: fiche.title,
        category: fiche.category,
        location: fiche.location,
        excerpt: fiche.livedExperience.slice(0, 180).trim() + (fiche.livedExperience.length > 180 ? '…' : ''),
        score,
        matchingKeywords: matches,
      });
    }
  }

  // Tri décroissant par score
  scoredFiches.sort((a, b) => b.score - a.score);
  return scoredFiches.slice(0, maxResults);
}

/**
 * Établit les correspondances contextuelles pour un cliché photo individuel.
 */
export function matchPhotoToVaultSpots(photo: PhotoEvidenceItem, maxResults = 3): MatchedVaultFiche[] {
  const text = `${photo.location} ${photo.suggestedAnecdote}`;
  const queryTokens = tokenize(text);
  const scoredFiches: MatchedVaultFiche[] = [];

  for (const fiche of VAULT_SPOTS) {
    const { score, matches } = scoreFiche(queryTokens, fiche);
    if (score > 0) {
      scoredFiches.push({
        id: fiche.id,
        title: fiche.title,
        category: fiche.category,
        location: fiche.location,
        excerpt: fiche.livedExperience.slice(0, 180).trim() + (fiche.livedExperience.length > 180 ? '…' : ''),
        score,
        matchingKeywords: matches,
      });
    }
  }

  scoredFiches.sort((a, b) => b.score - a.score);
  return scoredFiches.slice(0, maxResults);
}

/**
 * Génère le tableau complet des suggestions de contexte pour tous les albums certifiés.
 */
export function generateAllAlbumContextSuggestions(): AlbumContextSuggestion[] {
  return VERIFIED_PHOTO_ALBUMS.map((album) => ({
    albumId: album.id,
    albumTitle: album.title,
    destination: album.destination,
    photosCount: album.photosCount,
    suggestedFiches: matchAlbumToVaultSpots(album, 5),
  }));
}
