/**
 * Heldonica CMS — Moteur SEO & Score E-E-A-T Temps Réel (Google Search & Discover 2026)
 *
 * Implémenté pour la Phase 7 de la refonte CMS.
 * Analyse la qualité éditoriale, le niveau d'expérience vécue (E-E-A-T)
 * et génère des données structurées Schema.org conformes sans données inventées.
 *
 * Règle AGENTS.md :
 * - Aucune donnée inventée (règle n°1).
 * - Utilise la liste officielle des mots bannis de lib/brand-voice.ts.
 */

import { FORBIDDEN_WORDS } from '@/lib/brand-voice';
import { Accommodation } from '@/lib/cms-hospitality';

export interface EeatAuditResult {
  score: number; // 0 à 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  experienceVerified: boolean;
  bannedWordsFound: string[];
  recommendations: string[];
  metrics: {
    wordCount: number;
    hasRealPhotos: boolean;
    hasAnecdote: boolean;
    hasInternalLinks: boolean;
    hasPracticalDetails: boolean;
  };
}

/**
 * Calcule l'audit E-E-A-T d'un texte ou d'un carnet de route.
 */
export function auditArticleEeat(params: {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  hasRealPhotos?: boolean;
  hasAnecdote?: boolean;
}): EeatAuditResult {
  const { title, content, excerpt, author, hasRealPhotos = false, hasAnecdote = false } = params;

  const fullText = `${title} ${excerpt || ''} ${content}`.toLowerCase();
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Détection des mots bannis (brand voice)
  const bannedWordsFound: string[] = [];
  for (const banned of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${banned}\\b`, 'i');
    if (regex.test(fullText)) {
      bannedWordsFound.push(banned);
    }
  }

  // 2. Critères d'évaluation
  const hasInternalLinks = /href=["']\/(destinations|guides|carnets|articles)/i.test(content) || /\[.*?\]\(\/.*?\)/.test(content);
  const hasPracticalDetails = /\b(\d+\s*€|\d+\s*km|\d+\s*h|saison|accès|sentier|horaires)\b/i.test(content);

  let score = 0;
  const recommendations: string[] = [];

  // Expérience (35 points) : Photos réelles et anecdote
  if (hasRealPhotos) {
    score += 20;
  } else {
    recommendations.push('Ajouter une preuve photo vécue (PhotoEvidenceBlock).');
  }

  if (hasAnecdote) {
    score += 15;
  } else {
    recommendations.push('Ajouter une anecdote personnelle sur le ressenti sur place.');
  }

  // Expertise & Contenu (25 points)
  if (wordCount >= 600) {
    score += 15;
  } else if (wordCount >= 300) {
    score += 10;
    recommendations.push('Étoffer le contenu pour dépasser 600 mots afin d’asseoir l’expertise.');
  } else {
    recommendations.push('Contenu trop court pour un carnet de slow travel approfondi.');
  }

  if (hasPracticalDetails) {
    score += 10;
  } else {
    recommendations.push('Ajouter des repères pratiques concrets (temps de marche, saison recommandée).');
  }

  // Autorité & Maillage (20 points)
  if (hasInternalLinks) {
    score += 10;
  } else {
    recommendations.push('Créer du maillage interne vers les destinations ou guides Heldonica.');
  }

  if (author && author.trim()) {
    score += 10;
  }

  // Fiabilité & Voix de marque (20 points)
  if (bannedWordsFound.length === 0) {
    score += 20;
  } else {
    recommendations.push(`Retirer les mots sensationnalistes bannis : ${bannedWordsFound.slice(0, 3).join(', ')}.`);
  }

  // Attribution de la note
  let grade: EeatAuditResult['grade'] = 'D';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';

  return {
    score,
    grade,
    experienceVerified: hasRealPhotos && hasAnecdote,
    bannedWordsFound,
    recommendations,
    metrics: {
      wordCount,
      hasRealPhotos,
      hasAnecdote,
      hasInternalLinks,
      hasPracticalDetails,
    },
  };
}

/**
 * Génère les données structurées Schema.org pour un hébergement B2B.
 */
export function generateAccommodationJsonLd(
  accommodation: Accommodation,
  baseUrl: string = 'https://heldonica.fr'
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: accommodation.name,
    description: accommodation.description,
    url: `${baseUrl}/expert-hotelier/hebergements/${accommodation.slug}`,
    numberOfRooms: accommodation.capacity,
    priceRange: accommodation.price_per_night ? `${accommodation.price_per_night} €` : undefined,
    amenityFeature: (accommodation.amenities || []).map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    image: accommodation.photos?.map((p) => p.url) || [],
  };
}

/**
 * Génère les données structurées Schema.org pour un article de carnet de route.
 */
export function generateArticleJsonLd(params: {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  featuredImage?: string;
  baseUrl?: string;
}): Record<string, unknown> {
  const { title, slug, excerpt, publishedAt, author = 'Heldonica', featuredImage, baseUrl = 'https://heldonica.fr' } = params;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt || undefined,
    url: `${baseUrl}/articles/${slug}`,
    image: featuredImage ? [featuredImage] : undefined,
    datePublished: publishedAt || undefined,
    dateModified: publishedAt || undefined,
    author: {
      '@type': 'Organization',
      name: author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Heldonica',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo-heldonica.png`,
      },
    },
  };
}
