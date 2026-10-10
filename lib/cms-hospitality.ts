/**
 * Heldonica CMS — Module Métier Hôtellerie B2B & Séjours Structurés
 * Phase 2 : Modèles Structurés et Workflow de Validation
 * Règle AGENTS.md : zéro donnée inventée, typage strict, gestion des erreurs Supabase.
 */

import { supabase } from '@/lib/supabase-client';
import { canPublish, CmsUser, SYSTEM_ADMIN_USER } from '@/lib/cms-access';
import { logCmsAudit } from '@/lib/cms-audit';

export type HospitalityStatus = 'draft' | 'waiting_review' | 'approved' | 'published';
export type AccommodationType = 'chambre_hotes' | 'gite_charme' | 'hotel_independant' | 'cabane_insolite';

export interface AccommodationPhoto {
  url: string;
  caption?: string;
  is_primary?: boolean;
}

export interface Accommodation {
  id?: string;
  slug: string;
  name: string;
  destination_slug?: string;
  type: AccommodationType;
  capacity: number;
  surface_m2?: number;
  price_per_night?: number;
  direct_booking_url?: string;
  description: string;
  amenities: string[];
  photos: AccommodationPhoto[];
  status: HospitalityStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StayOffer {
  id?: string;
  slug: string;
  title: string;
  accommodation_id?: string;
  tagline?: string;
  duration_nights: number;
  price_total?: number;
  included_items: string[];
  valid_from?: string;
  valid_to?: string;
  status: HospitalityStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Validation TypeScript stricte des données d'hébergement sans dépendance externe.
 */
export function validateAccommodation(data: Partial<Accommodation>): string[] {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Le nom de l’hébergement est obligatoire.');
  }

  if (!data.slug || typeof data.slug !== 'string' || !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Le slug est obligatoire et doit être en minuscules avec tirets (kebab-case).');
  }

  if (data.capacity !== undefined && (typeof data.capacity !== 'number' || data.capacity < 1)) {
    errors.push('La capacité doit être un nombre positif supérieur ou égal à 1.');
  }

  if (data.price_per_night !== undefined && data.price_per_night !== null) {
    if (typeof data.price_per_night !== 'number' || data.price_per_night < 0) {
      errors.push('Le tarif par nuit doit être un nombre positif.');
    }
  }

  if (data.direct_booking_url) {
    try {
      const u = new URL(data.direct_booking_url);
      if (u.protocol !== 'https:') {
        errors.push('Le lien direct de réservation doit être en HTTPS sécurisé.');
      }
    } catch {
      errors.push('L’URL de réservation directe est invalide.');
    }
  }

  if (data.photos && Array.isArray(data.photos)) {
    for (const p of data.photos) {
      if (!p.url || !p.url.startsWith('https://')) {
        errors.push('Chaque photo doit comporter une URL HTTPS valide.');
        break;
      }
    }
  }

  return errors;
}

/**
 * Récupère tous les hébergements avec filtre optionnel sur le statut.
 */
export async function getAccommodations(statusFilter?: HospitalityStatus): Promise<Accommodation[]> {
  if (!supabase) return [];
  let query = supabase.from('cms_accommodations').select('*').order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[CmsHospitality] Erreur lecture hébergements:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    photos: Array.isArray(row.photos) ? row.photos : [],
  }));
}

/**
 * Crée un nouvel hébergement (par défaut en brouillon).
 */
export async function createAccommodation(
  input: Accommodation,
  user?: CmsUser
): Promise<{ success: boolean; accommodation?: Accommodation; errors?: string[] }> {
  const errors = validateAccommodation(input);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (!supabase) {
    return { success: false, errors: ['Supabase non disponible'] };
  }

  const activeUser = user || SYSTEM_ADMIN_USER;
  const payload = {
    ...input,
    status: input.status || 'draft',
    created_by: activeUser.email,
    amenities: input.amenities || [],
    photos: input.photos || [],
  };

  const { data, error } = await supabase
    .from('cms_accommodations')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[CmsHospitality] Erreur création hébergement:', error);
    return { success: false, errors: [error.message] };
  }

  // Journalisation d'audit
  await logCmsAudit({
    user: activeUser,
    action: 'create',
    entity: 'accommodation',
    entityId: data.id,
    before: null,
    after: { name: data.name, status: data.status },
    metadata: { slug: data.slug, type: data.type },
  });

  return { success: true, accommodation: data };
}

/**
 * Soumet un hébergement pour revue (workflow: draft -> waiting_review).
 */
export async function submitAccommodationForReview(
  id: string,
  user?: CmsUser
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase non configuré' };

  const { data: current, error: getErr } = await supabase
    .from('cms_accommodations')
    .select('id, name, status')
    .eq('id', id)
    .single();

  if (getErr || !current) {
    return { success: false, error: 'Hébergement introuvable.' };
  }

  const { error: updErr } = await supabase
    .from('cms_accommodations')
    .update({ status: 'waiting_review', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updErr) {
    return { success: false, error: updErr.message };
  }

  await logCmsAudit({
    user: user || SYSTEM_ADMIN_USER,
    action: 'update',
    entity: 'accommodation',
    entityId: id,
    before: { status: current.status },
    after: { status: 'waiting_review' },
    metadata: { name: current.name, note: 'Soumission pour relecture par un éditeur' },
  });

  return { success: true };
}

/**
 * Publie un hébergement (réservé à l'administrateur selon canPublish).
 */
export async function publishAccommodation(
  id: string,
  user: CmsUser
): Promise<{ success: boolean; error?: string }> {
  if (!canPublish(user, 'accommodation')) {
    return {
      success: false,
      error: 'Permission refusée : seul un administrateur peut valider et publier un hébergement.',
    };
  }

  if (!supabase) return { success: false, error: 'Supabase non configuré' };

  const { data: current, error: getErr } = await supabase
    .from('cms_accommodations')
    .select('id, name, status')
    .eq('id', id)
    .single();

  if (getErr || !current) {
    return { success: false, error: 'Hébergement introuvable.' };
  }

  const { error: updErr } = await supabase
    .from('cms_accommodations')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updErr) {
    return { success: false, error: updErr.message };
  }

  await logCmsAudit({
    user,
    action: 'publish',
    entity: 'accommodation',
    entityId: id,
    before: { status: current.status },
    after: { status: 'published' },
    metadata: { name: current.name, validated_by: user.email },
  });

  return { success: true };
}
