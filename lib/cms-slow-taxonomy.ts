/**
 * Heldonica CMS — Taxonomie Slow Travel & Métadonnées Métier Riches
 *
 * Conforme à la Règle n°1 d'AGENTS.md : On n'invente rien.
 * Structure métier slow travel propre au duo fondateur (saisons calmes,
 * mobilités décarbonées, budgets réels constatés, durées en immersion).
 */

import { siteUrl } from '@/lib/site-url';

export interface SlowSeasonOption {
  value: string;
  label: string;
  emoji: string;
}

export const SLOW_SEASONS: SlowSeasonOption[] = [
  { value: 'printemps', label: 'Printemps fleuri (avril-mai)', emoji: '🌸' },
  { value: 'ete_doux', label: 'Été hors-foule (juin & septembre)', emoji: '☀️' },
  { value: 'automne', label: 'Automne doré (octobre-novembre)', emoji: '🍁' },
  { value: 'hiver', label: 'Hiver calme & hors saison', emoji: '❄️' },
  { value: 'toute_annee', label: 'Toute l’année à rythme lent', emoji: '🌍' },
];

export interface SlowMobilityOption {
  value: string;
  label: string;
  icon: string;
}

export const SLOW_MOBILITIES: SlowMobilityOption[] = [
  { value: 'train', label: 'Train & Réseau ferroviaire', icon: '🚆' },
  { value: 'marche', label: 'Randonnée & À pied', icon: '🥾' },
  { value: 'velo', label: 'Vélo & Gravel / Bikepacking', icon: '🚲' },
  { value: 'voile', label: 'Voile & Traversée maritime', icon: '⛵' },
  { value: 'van', label: 'Road trip lent (Van / Petite route)', icon: '🚐' },
];

export interface SlowBudgetOption {
  value: string;
  label: string;
  range: string;
}

export const SLOW_BUDGETS: SlowBudgetOption[] = [
  { value: 'economique', label: 'Économe (< 60 € / j)', range: '< 60 €/j' },
  { value: 'raisonnable', label: 'Végétal & Local (60 - 110 € / j)', range: '60-110 €/j' },
  { value: 'confort', label: 'Maisons de charme (110 - 180 € / j)', range: '110-180 €/j' },
  { value: 'd_exception', label: 'Hôte d’exception (> 180 € / j)', range: '> 180 €/j' },
];

export interface SlowCarbonOption {
  value: string;
  label: string;
  badge: string;
}

export const SLOW_CARBON_OPTIONS: SlowCarbonOption[] = [
  { value: 'faible', label: 'Empreinte minimale (Train / Marche)', badge: '🌿 Bas carbone' },
  { value: 'moderee', label: 'Empreinte modérée (Van / Ferry)', badge: '🌤️ Modérée' },
  { value: 'neutre', label: 'Projet de compensation locale', badge: '🌍 Compensée' },
];

export interface SlowTaxonomyInput {
  title?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  season?: string;
  mobility?: string;
  budget_level?: string;
  duration?: string;
  carbon_footprint?: string;
}

/**
 * Génère le fil de métadonnées sémantiques pour les SERP Google et aperçus sociaux.
 */
export function buildSlowTravelSnippetTags(input: SlowTaxonomyInput): string[] {
  const tags: string[] = [];

  if (input.duration?.trim()) {
    tags.push(input.duration.trim());
  }

  if (input.season) {
    const s = SLOW_SEASONS.find((x) => x.value === input.season);
    if (s) tags.push(`${s.emoji} ${s.label.split('(')[0].trim()}`);
  }

  if (input.mobility) {
    const m = SLOW_MOBILITIES.find((x) => x.value === input.mobility);
    if (m) tags.push(`${m.icon} ${m.label.split('&')[0].trim()}`);
  }

  if (input.budget_level) {
    const b = SLOW_BUDGETS.find((x) => x.value === input.budget_level);
    if (b) tags.push(b.range);
  }

  if (input.carbon_footprint) {
    const c = SLOW_CARBON_OPTIONS.find((x) => x.value === input.carbon_footprint);
    if (c) tags.push(c.badge);
  }

  return tags;
}

/**
 * Construit l'URL canonique pour l'affichage Google (source unique : siteUrl()).
 */
export function getCanonicalArticleUrl(slug?: string, category?: string): string {
  const baseUrl = siteUrl();
  const cleanSlug = slug?.trim() || 'carnet-de-voyage';
  if (category?.toLowerCase().includes('destination')) {
    return `${baseUrl}/destinations/${cleanSlug}`;
  }
  return `${baseUrl}/blog/${cleanSlug}`;
}
