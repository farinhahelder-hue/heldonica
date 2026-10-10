/**
 * Heldonica CMS — Moteur de Variantes & Ciblage Déclaratif (Différentiel Slow Travel)
 *
 * Implémenté pour la Phase 4 du CMS.
 * Permet de servir des textes, accroches et visuels personnalisés sans tracking intrusif :
 * - Selon la saison (printemps, été, automne, hiver)
 * - Selon le profil / persona (couple slow travel, solo, hôtelier B2B)
 * - Selon les paramètres d'arrivée (campagne UTM, source)
 * - Selon l'appareil (mobile, bureau)
 *
 * Règle AGENTS.md :
 * - Zéro dépendance externe lourde.
 * - Respect de la vie privée (calcul purement déterministe en mémoire).
 * - Lecture stricte des erreurs Supabase.
 */

import { supabase } from '@/lib/supabase-client';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Audience = 'couple_slow_travel' | 'solo' | 'hotelier_b2b';
export type DeviceType = 'mobile' | 'desktop';

export interface TargetingRules {
  season?: Season;
  audience?: Audience;
  utm_source?: string;
  utm_campaign?: string;
  device?: DeviceType;
}

export interface TargetingContext {
  date?: Date;
  audience?: Audience;
  utm_source?: string;
  utm_campaign?: string;
  device?: DeviceType;
}

export interface ZoneVariant {
  id: string;
  page: string;
  zone_key: string;
  variant_name: string;
  value: string;
  rules: TargetingRules;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Calcule la saison astronomique/calendaire pour une date donnée.
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1 à 12
  const day = date.getDate();

  // Printemps : ~21 Mars au 20 Juin
  if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return 'spring';
  }
  // Été : ~21 Juin au 20 Septembre
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 20)) {
    return 'summer';
  }
  // Automne : ~21 Septembre au 20 Décembre
  if ((month === 9 && day >= 21) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return 'autumn';
  }
  // Hiver : ~21 Décembre au 20 Mars
  return 'winter';
}

/**
 * Évalue si le contexte d'un visiteur remplit toutes les conditions déclarées dans les règles.
 */
export function matchesTargetingRules(rules: TargetingRules, context: TargetingContext): boolean {
  if (!rules || Object.keys(rules).length === 0) {
    return true; // Règle universelle
  }

  // 1. Contrôle de saison
  if (rules.season) {
    const currentSeason = getCurrentSeason(context.date);
    if (rules.season !== currentSeason) return false;
  }

  // 2. Contrôle d'audience / persona
  if (rules.audience) {
    if (!context.audience || rules.audience !== context.audience) return false;
  }

  // 3. Contrôle UTM Source
  if (rules.utm_source) {
    if (!context.utm_source || !context.utm_source.toLowerCase().includes(rules.utm_source.toLowerCase())) {
      return false;
    }
  }

  // 4. Contrôle UTM Campaign
  if (rules.utm_campaign) {
    if (!context.utm_campaign || !context.utm_campaign.toLowerCase().includes(rules.utm_campaign.toLowerCase())) {
      return false;
    }
  }

  // 5. Contrôle Device
  if (rules.device) {
    if (!context.device || rules.device !== context.device) return false;
  }

  return true;
}

/**
 * Sélectionne la variante la plus pertinente (priorité la plus haute satisfaisant les règles).
 */
export function selectBestVariant(variants: ZoneVariant[], context: TargetingContext): ZoneVariant | null {
  const eligible = variants.filter((v) => v.is_active && matchesTargetingRules(v.rules, context));

  if (eligible.length === 0) return null;

  // Tri par priorité décroissante (plus haute priorité en premier)
  eligible.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return eligible[0];
}

/**
 * Récupère et résout les variantes ciblées pour une page donnée depuis Supabase.
 */
export async function getTargetedZoneVariants(
  page: string,
  context: TargetingContext = {}
): Promise<Record<string, string>> {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('cms_zone_variants')
    .select('*')
    .eq('page', page)
    .eq('is_active', true);

  if (error) {
    console.error(`[CmsTargeting] Erreur lecture variantes pour page "${page}":`, error.message);
    return {};
  }

  if (!data || data.length === 0) return {};

  // Regrouper par zone_key
  const byZone: Record<string, ZoneVariant[]> = {};
  for (const row of data as ZoneVariant[]) {
    if (!byZone[row.zone_key]) byZone[row.zone_key] = [];
    byZone[row.zone_key].push(row);
  }

  // Sélectionner la meilleure pour chaque zone_key
  const resolved: Record<string, string> = {};
  for (const [zoneKey, list] of Object.entries(byZone)) {
    const best = selectBestVariant(list, context);
    if (best) {
      resolved[`${page}__${zoneKey}`] = best.value;
    }
  }

  return resolved;
}
