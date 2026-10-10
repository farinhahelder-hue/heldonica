/**
 * Heldonica CMS — Gestion des Releases & Publications Groupées
 *
 * Implémenté pour la Phase 3 du CMS (Pattern Strapi Releases).
 * Permet de regrouper plusieurs contenus (articles de blog, hébergements, guides)
 * dans une "Release" pour une publication groupée atomique ou planifiée.
 *
 * Règle AGENTS.md :
 * - Aucune écriture sans vérification de retour d'erreur.
 * - Audit systématique de chaque publication.
 */

import { supabase } from '@/lib/supabase-client';
import { CmsUser } from '@/lib/cms-access';
import { logCmsAudit } from '@/lib/cms-audit';

export type ReleaseStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'cancelled';

export interface ReleaseItem {
  entity: 'post' | 'accommodation' | 'destination';
  id: string;
  title?: string;
}

export interface CmsRelease {
  id: string;
  title: string;
  description?: string | null;
  status: ReleaseStatus;
  items: ReleaseItem[];
  scheduled_at?: string | null;
  published_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Crée une nouvelle release de publication.
 */
export async function createRelease(params: {
  title: string;
  description?: string;
  scheduled_at?: string;
  items?: ReleaseItem[];
  user?: CmsUser;
}): Promise<{ success: boolean; release?: CmsRelease; error?: string }> {
  const { title, description, scheduled_at, items = [], user } = params;

  if (!title || !title.trim()) {
    return { success: false, error: 'Le titre de la release est obligatoire.' };
  }

  if (!supabase) {
    return { success: false, error: 'Client Supabase non initialisé.' };
  }

  const payload = {
    title: title.trim(),
    description: description?.trim() || null,
    status: (scheduled_at ? 'scheduled' : 'draft') as ReleaseStatus,
    items,
    scheduled_at: scheduled_at || null,
    created_by: user?.email || 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cms_releases')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[CmsReleases] Erreur création release:', error);
    return { success: false, error: error.message };
  }

  return { success: true, release: data as CmsRelease };
}

/**
 * Liste les releases existantes.
 */
export async function listReleases(): Promise<{ success: boolean; releases: CmsRelease[]; error?: string }> {
  if (!supabase) {
    return { success: false, releases: [], error: 'Client Supabase non initialisé.' };
  }

  const { data, error } = await supabase
    .from('cms_releases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CmsReleases] Erreur récupération releases:', error);
    return { success: false, releases: [], error: error.message };
  }

  return { success: true, releases: (data || []) as CmsRelease[] };
}

/**
 * Ajoute un ou plusieurs éléments à une release.
 */
export async function addItemsToRelease(
  releaseId: string,
  newItems: ReleaseItem[]
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Client Supabase non initialisé.' };
  }

  const { data: release, error: getErr } = await supabase
    .from('cms_releases')
    .select('id, items, status')
    .eq('id', releaseId)
    .single();

  if (getErr || !release) {
    return { success: false, error: 'Release introuvable.' };
  }

  if (release.status === 'published' || release.status === 'cancelled') {
    return { success: false, error: 'Impossible de modifier une release déjà clôturée.' };
  }

  const existingItems = (release.items as ReleaseItem[]) || [];
  // Éviter les doublons exacts (même entity et même id)
  const mergedItems = [...existingItems];
  for (const item of newItems) {
    const exists = mergedItems.some((ex) => ex.entity === item.entity && ex.id === item.id);
    if (!exists) mergedItems.push(item);
  }

  const { error: updErr } = await supabase
    .from('cms_releases')
    .update({ items: mergedItems, updated_at: new Date().toISOString() })
    .eq('id', releaseId);

  if (updErr) {
    console.error('[CmsReleases] Erreur mise à jour items:', updErr);
    return { success: false, error: updErr.message };
  }

  return { success: true };
}

/**
 * Exécute la publication groupée de tous les éléments d'une release.
 */
export async function executeReleasePublication(
  releaseId: string,
  user: CmsUser
): Promise<{ success: boolean; publishedCount: number; errors: string[] }> {
  if (!supabase) {
    return { success: false, publishedCount: 0, errors: ['Client Supabase non initialisé.'] };
  }

  const { data: release, error: getErr } = await supabase
    .from('cms_releases')
    .select('*')
    .eq('id', releaseId)
    .single();

  if (getErr || !release) {
    return { success: false, publishedCount: 0, errors: ['Release introuvable.'] };
  }

  const items = (release.items as ReleaseItem[]) || [];
  if (items.length === 0) {
    return { success: false, publishedCount: 0, errors: ['La release ne contient aucun élément à publier.'] };
  }

  // Marquer la release comme en cours de publication
  const { error: markPublishingErr } = await supabase
    .from('cms_releases')
    .update({ status: 'publishing', updated_at: new Date().toISOString() })
    .eq('id', releaseId);

  if (markPublishingErr) {
    console.error('[CmsReleases] Erreur passage statut publishing:', markPublishingErr);
  }

  let publishedCount = 0;
  const errors: string[] = [];
  const now = new Date().toISOString();

  for (const item of items) {
    try {
      if (item.entity === 'post') {
        const { error: postErr } = await supabase
          .from('cms_blog_posts')
          .update({ published: true, published_at: now, updated_at: now })
          .eq('id', item.id);

        if (postErr) {
          errors.push(`Article ${item.id}: ${postErr.message}`);
        } else {
          publishedCount++;
          await logCmsAudit({
            user,
            action: 'publish',
            entity: 'article',
            entityId: String(item.id),
            before: { published: false },
            after: { published: true, release_id: releaseId },
            metadata: { release_title: release.title },
          });
        }
      } else if (item.entity === 'accommodation') {
        const { error: accErr } = await supabase
          .from('cms_accommodations')
          .update({ status: 'published', updated_at: now })
          .eq('id', item.id);

        if (accErr) {
          errors.push(`Hébergement ${item.id}: ${accErr.message}`);
        } else {
          publishedCount++;
          await logCmsAudit({
            user,
            action: 'publish',
            entity: 'accommodation',
            entityId: item.id,
            before: { status: 'draft' },
            after: { status: 'published', release_id: releaseId },
            metadata: { release_title: release.title },
          });
        }
      }
    } catch (err) {
      errors.push(`Élément ${item.entity} (${item.id}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const finalStatus: ReleaseStatus = errors.length === 0 ? 'published' : 'draft';
  const { error: finishReleaseErr } = await supabase
    .from('cms_releases')
    .update({
      status: finalStatus,
      published_at: errors.length === 0 ? now : null,
      updated_at: now,
    })
    .eq('id', releaseId);

  if (finishReleaseErr) {
    console.error('[CmsReleases] Erreur finalisation release:', finishReleaseErr);
  }

  return {
    success: errors.length === 0,
    publishedCount,
    errors,
  };
}
