import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { searchUnsplash } from '@/lib/unsplash';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

const PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop';

const GENERIC_PHOTO_IDS = new Set([
  '1501785888041-af3ef285b470',
  '1506012787146-f92b2d7d6d96',
  '1501854140801-50d01698950b',
  '1469474968028-56623f02e42e',
  '1506905925346-21bda4d32df4',
  '1476514525535-07fb3b4ae5f1',
  '1464822759023-fed622ff2c3b',
  '1520939817895-060bdaf4fe1b',
  '1515488764276-beab7607c1e6',
  '1555990793-da11153b6e8d',
  '1555992828-8e7e4c0c7a0a',
  '1555992836-003ea0c1b7a9',
  '1593702288056-2c160f65cf12',
  '1555990538-1e0700b21df9',
  '1590001155093-a3c66ab0c3ff',
]);

function parsePhotoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/photo[\/-]([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}

function isSupabaseStorage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('.supabase.co/storage/');
}

function isEditorialImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/images/') || url.startsWith('/uploads/');
}

function isGenericUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return true;
  const trimmed = url.trim();
  if (trimmed === PLACEHOLDER_URL) return true;
  if (trimmed.includes('placeholder')) return true;
  if (!trimmed.startsWith('http') && !trimmed.startsWith('/')) return true;
  if (isSupabaseStorage(trimmed)) return false;
  if (isEditorialImage(trimmed)) return false;
  const photoId = parsePhotoId(trimmed);
  if (photoId && GENERIC_PHOTO_IDS.has(photoId)) return true;
  return false;
}

function extractDuplicateIds(articles: { slug: string; featured_image: string | null }[]): Set<string> {
  const urlCount = new Map<string, string[]>();
  for (const a of articles) {
    if (!a.featured_image) continue;
    if (isSupabaseStorage(a.featured_image)) continue;
    if (isEditorialImage(a.featured_image)) continue;
    const photoId = parsePhotoId(a.featured_image);
    if (!photoId) continue;
    if (!urlCount.has(photoId)) urlCount.set(photoId, []);
    urlCount.get(photoId)!.push(a.slug);
  }
  const dups = new Set<string>();
  for (const [photoId, slugs] of urlCount) {
    if (slugs.length >= 3) dups.add(photoId);
  }
  return dups;
}

function buildQuery(post: { title?: string; category?: string; tags?: string[]; slug?: string; voice_notes?: string }): string {
  const parts: string[] = [];
  if (post.voice_notes) {
    const words = post.voice_notes.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
    if (words) parts.push(words);
  }
  const titleWords = (post.title || '').split(' ').slice(0, 4).join(' ');
  if (titleWords) parts.push(titleWords);
  if (post.category) parts.push(post.category);
  if (Array.isArray(post.tags)) {
    const t = post.tags.slice(0, 2).join(' ');
    if (t) parts.push(t);
  }
  return parts.filter(Boolean).join(' ') || 'travel landscape';
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(req.url);
  const dryRun = searchParams.get('dry_run') === 'true';
  const isRecheck = searchParams.get('recheck') === 'true';

  try {
    const { data: posts, error: postsError } = await supabase.from('cms_blog_posts')
      .select('id, slug, title, category, tags, featured_image, voice_notes');

    if (postsError) throw postsError;

    const publishedPosts = (posts || []).filter((p: any) => p.slug);
    const duplicatePhotoIds = extractDuplicateIds(publishedPosts);

    const candidates = (posts || []).filter((post: { featured_image?: string | null }) => {
      if (isGenericUrl(post.featured_image)) return true;
      if (!post.featured_image) return false;
      if (isSupabaseStorage(post.featured_image) && !isRecheck) return false;
      if (isEditorialImage(post.featured_image) && !isRecheck) return false;
      const photoId = parsePhotoId(post.featured_image);
      if (photoId && duplicatePhotoIds.has(photoId)) return true;
      return false;
    });

    if (dryRun) {
      const details = candidates.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        current_image: p.featured_image?.substring(0, 100) || null,
        reason: !p.featured_image || p.featured_image.trim() === '' ? 'empty' :
                p.featured_image === PLACEHOLDER_URL ? 'placeholder' :
                isGenericUrl(p.featured_image) ? 'generic' : 'duplicate',
        query: buildQuery(p),
      }));
      return NextResponse.json({ dryRun: true, total: posts?.length || 0, candidates: details.length, details });
    }

    let updatedCount = 0;
    const results: { slug: string; old_url: string | null; new_url: string | null; skipped?: string }[] = [];

    const batchSize = 3;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (post: any) => {
        const query = buildQuery(post);
        const photos = await searchUnsplash(query, 5);
        if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
          return { id: post.id, slug: post.slug, old_url: post.featured_image, new_url: photos[0].urls.regular };
        }
        return { id: post.id, slug: post.slug, old_url: post.featured_image, new_url: null, skipped: 'no_unsplash_result' };
      }));
      results.push(...batchResults);
      const valid = batchResults.filter(r => r.new_url);
      if (valid.length > 0) {
        const { error } = await supabase.from('cms_blog_posts').upsert(
          valid.map(r => ({ id: r.id, featured_image: r.new_url }))
        );
        if (error) throw error;
        updatedCount += valid.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} of ${candidates.length} candidate articles with new images.`,
      details: {
        total: posts?.length || 0,
        candidatesFound: candidates.length,
        updated: updatedCount,
        failed: candidates.length - updatedCount,
      },
      results,
    });

  } catch (error: any) {
    console.error("Error fixing images:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
