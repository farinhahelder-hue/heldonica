import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { GENERIC_PHOTO_IDS } from '@/app/api/cms/fix-empty-images/route';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function parsePhotoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/photo[\/-]([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}

function isSupabaseStorage(url: string | null | undefined): boolean {
  return !!(url && url.includes('.supabase.co/storage/'));
}

function isEditorialImage(url: string | null | undefined): boolean {
  return !!(url && (
    url.startsWith('/images/') ||
    url.startsWith('/uploads/') ||
    url.startsWith('/public/')
  ));
}

export type ImageIssueType = 'null' | 'generic' | 'duplicate' | 'ok';

export interface ImageAuditItem {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  featured_image: string | null;
  issue_type: ImageIssueType;
  /** Slugs des articles partageant la même image (vide si issue_type != 'duplicate') */
  shared_with: string[];
  /** Nombre total d'articles partageant cette image (1 = unique) */
  duplicate_count: number;
  /** Identifiant Unsplash extrait de l'URL, null pour les assets maison */
  photo_id: string | null;
  /** Vrai si l'image est hébergée sur Supabase Storage (validée manuellement) */
  is_supabase: boolean;
  /** Vrai si l'image est un asset local maison */
  is_editorial: boolean;
}

export interface ImageAuditResponse {
  total: number;
  ok: number;
  issues_count: number;
  by_type: Record<ImageIssueType, number>;
  items: ImageAuditItem[];
}

export async function GET(req: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(req.url);
  const onlyIssues = searchParams.get('only_issues') === 'true';

  try {
    const { data: posts, error } = await supabase
      .from('cms_blog_posts')
      .select('id, slug, title, category, featured_image')
      .order('published_at', { ascending: false });

    if (error) throw error;

    const allPosts: { id: number; slug: string; title: string; category: string | null; featured_image: string | null }[] =
      (posts || []).filter((p: any) => p.slug);

    // Étape 1 : construire le compte de duplication par photo_id
    const photoIdToSlugs = new Map<string, string[]>();
    for (const p of allPosts) {
      if (!p.featured_image) continue;
      if (isSupabaseStorage(p.featured_image)) continue;
      if (isEditorialImage(p.featured_image)) continue;
      const photoId = parsePhotoId(p.featured_image);
      if (!photoId) continue;
      if (!photoIdToSlugs.has(photoId)) photoIdToSlugs.set(photoId, []);
      photoIdToSlugs.get(photoId)!.push(p.slug);
    }

    // Étape 2 : qualifier chaque article
    const items: ImageAuditItem[] = allPosts.map(p => {
      const url = p.featured_image;
      const isSupa = isSupabaseStorage(url);
      const isEdi = isEditorialImage(url);
      const photoId = parsePhotoId(url);
      const sharedSlugs = photoId && photoIdToSlugs.has(photoId)
        ? photoIdToSlugs.get(photoId)!.filter(s => s !== p.slug)
        : [];
      const duplicateCount = sharedSlugs.length + 1;

      let issueType: ImageIssueType = 'ok';

      if (!url || url.trim() === '') {
        issueType = 'null';
      } else if (isSupa || isEdi) {
        issueType = 'ok'; // assets validés, jamais à corriger
      } else if (photoId && GENERIC_PHOTO_IDS.has(photoId)) {
        issueType = 'generic';
      } else if (url.toLowerCase().includes('placeholder')) {
        issueType = 'generic';
      } else if (duplicateCount >= 2 && photoId) {
        issueType = 'duplicate';
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        featured_image: url,
        issue_type: issueType,
        shared_with: sharedSlugs,
        duplicate_count: duplicateCount,
        photo_id: photoId,
        is_supabase: isSupa,
        is_editorial: isEdi,
      };
    });

    // Étape 3 : statistiques
    const byType: Record<ImageIssueType, number> = { null: 0, generic: 0, duplicate: 0, ok: 0 };
    for (const item of items) byType[item.issue_type]++;

    const issuesCount = items.filter(i => i.issue_type !== 'ok').length;
    const output = onlyIssues ? items.filter(i => i.issue_type !== 'ok') : items;

    return NextResponse.json({
      total: allPosts.length,
      ok: byType.ok,
      issues_count: issuesCount,
      by_type: byType,
      items: output,
    } satisfies ImageAuditResponse);
  } catch (err: any) {
    console.error('[audit-images] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
