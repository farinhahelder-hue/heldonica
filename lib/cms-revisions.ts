/**
 * Heldonica CMS — Moteur de Révisions de Contenu & Rollback en 1 clic
 *
 * Implémenté pour la Phase 6 du CMS (Pattern Payload / Enterprise CMS).
 * Permet l'archivage automatique des versions d'un article et la restauration
 * immédiate sans perte de données.
 *
 * Règle AGENTS.md :
 * - Aucune écriture sans vérification de retour d'erreur.
 * - Audit systématique de chaque rollback.
 */

import { supabase } from '@/lib/supabase-client';
import { CmsUser } from '@/lib/cms-access';
import { logCmsAudit } from '@/lib/cms-audit';

export interface PostRevision {
  id: string;
  post_id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  author?: string | null;
  saved_by?: string | null;
  saved_at: string;
}

/**
 * Enregistre un instantané (révision) d'un article.
 */
export async function savePostRevision(
  post: {
    id: string | number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featured_image?: string | null;
    author?: string | null;
  },
  user?: CmsUser
): Promise<{ success: boolean; revisionId?: string; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase non configuré.' };

  const payload = {
    post_id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content,
    featured_image: post.featured_image || null,
    author: post.author || 'Heldonica',
    saved_by: user?.email || 'admin',
    saved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cms_post_revisions')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    console.error('[CmsRevisions] Erreur sauvegarde révision:', error);
    return { success: false, error: error.message };
  }

  return { success: true, revisionId: data?.id };
}

/**
 * Récupère l'historique des révisions d'un article (jusqu'à 20 versions).
 */
export async function getPostRevisions(postId: string | number): Promise<{
  success: boolean;
  revisions: PostRevision[];
  error?: string;
}> {
  if (!supabase) return { success: false, revisions: [], error: 'Supabase non configuré.' };

  const { data, error } = await supabase
    .from('cms_post_revisions')
    .select('*')
    .eq('post_id', String(postId))
    .order('saved_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[CmsRevisions] Erreur lecture révisions:', error);
    return { success: false, revisions: [], error: error.message };
  }

  return { success: true, revisions: (data || []) as PostRevision[] };
}

/**
 * Restaure une révision antérieure d'un article (Rollback).
 */
export async function restorePostRevision(
  postId: string | number,
  revisionId: string,
  user: CmsUser
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase non configuré.' };

  // 1. Lire la révision cible
  const { data: revision, error: revErr } = await supabase
    .from('cms_post_revisions')
    .select('*')
    .eq('id', revisionId)
    .single();

  if (revErr || !revision) {
    return { success: false, error: 'Révision cible introuvable.' };
  }

  // 2. Lire l'article actuel pour capturer l'état avant rollback
  const { data: current, error: curErr } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (curErr || !current) {
    return { success: false, error: 'Article actuel introuvable.' };
  }

  // 3. Sauvegarder automatiquement l'état actuel comme point de restauration de sécurité
  await savePostRevision(current, user);

  // 4. Appliquer la révision
  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from('cms_blog_posts')
    .update({
      title: revision.title,
      slug: revision.slug,
      excerpt: revision.excerpt,
      content: revision.content,
      featured_image: revision.featured_image,
      author: revision.author,
      updated_at: now,
    })
    .eq('id', postId);

  if (updErr) {
    console.error('[CmsRevisions] Erreur application révision:', updErr);
    return { success: false, error: updErr.message };
  }

  // 5. Journalisation d'audit
  await logCmsAudit({
    user,
    action: 'update',
    entity: 'article',
    entityId: String(postId),
    before: { title: current.title, content_length: current.content?.length },
    after: { title: revision.title, content_length: revision.content?.length },
    metadata: {
      note: 'Rollback / Restauration d’une version antérieure',
      restored_revision_id: revisionId,
      revision_date: revision.saved_at,
    },
  });

  return { success: true };
}
