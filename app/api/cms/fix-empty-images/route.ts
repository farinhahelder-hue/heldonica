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

/**
 * GENERIC_PHOTO_IDS — Blacklist complète des IDs Unsplash à ne jamais conserver en featured_image.
 *
 * Critères d'inclusion :
 *  - IDs utilisés comme fallback hardcodé dans BlogClientPage.tsx (CATEGORY_FALLBACK_BG, DEFAULT_CARD_FALLBACK)
 *  - IDs utilisés comme fallback hardcodé dans lib/unsplash.ts (CATEGORY_FALLBACK_IMAGES)
 *  - IDs utilisés comme décor dans lib/instagram-static.ts
 *  - IDs utilisés dans lib/cms-page-defaults.ts, lib/pillar-data.ts (héros de pages)
 *  - Tout ID générique voyage/paysage sans rapport avec un article spécifique
 *
 * Seuil de duplication : 2 articles (site éditorial slow travel — chaque image doit être unique).
 */
export const GENERIC_PHOTO_IDS = new Set([
  // --- Ancienne blacklist ---
  '1501785888041-af3ef285b470',  // Carnets Voyage fallback (ancienne blacklist)
  '1506012787146-f92b2d7d6d96',  // Placeholder URL principal
  '1501854140801-50d01698950b',  // DEFAULT_CARD_FALLBACK (BlogClientPage) + lib/unsplash.ts default
  '1469474968028-56623f02e42e',  // Hero blog page + cms-page-defaults home hero
  '1506905925346-21bda4d32df4',  // lib/unsplash.ts slow-travel + cms-page-defaults a-propos
  '1476514525535-07fb3b4ae5f1',  // ancienne blacklist
  '1464822759023-fed622ff2c3b',  // Carnets Voyage fallback (BlogClientPage + lib/unsplash.ts)
  '1520939817895-060bdaf4fe1b',  // Découvertes Locales fallback (BlogClientPage + lib/unsplash.ts)
  '1515488764276-beab7607c1e6',  // Guides Pratiques fallback (BlogClientPage + lib/unsplash.ts + instagram-static)
  '1555990793-da11153b6e8d',    // ancienne blacklist
  '1555992828-8e7e4c0c7a0a',    // ancienne blacklist
  '1555992836-003ea0c1b7a9',    // ancienne blacklist
  '1593702288056-2c160f65cf12', // pillar-data.ts hero
  '1555990538-1e0700b21df9',    // ancienne blacklist + instagram-static
  '1590001155093-a3c66ab0c3ff', // ancienne blacklist

  // --- Nouveaux IDs détectés lors de l'audit Phase 1 ---
  '1501785888041-af3ef285b470',  // lib/unsplash.ts Carnets Voyage
  '1499856871958-5b9627545d1a',  // lib/unsplash.ts europe
  '1502602898657-3e91760cbb34',  // lib/unsplash.ts france
  '1555881400-74d7feeac3e4',    // lib/unsplash.ts portugal
  '1539037116277-4db20889f2d4',  // lib/unsplash.ts espagne
  '1515542622106-78bda8ba0e5b',  // lib/unsplash.ts italie
  '1488646953014-85cb44b258dc',  // lib/unsplash.ts voyage générique
  '1560719887-fe3105fa1e55',    // instagram-static.ts post 1
  '1559494007-9f5847c49d94',    // instagram-static.ts post 2
  '1501785888041-af3ef285b470',  // travel-planning hero (cms-page-defaults)
  '1555992828-8e7e4c0c7a0a',    // pillar-data.ts hero 2
  '1555992836-003ea0c1b7a9',    // pillar-data.ts hero 3
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
  // Images locales maison : /images/, /uploads/, ou assets hébergés dans le repo
  return url.startsWith('/images/') || url.startsWith('/uploads/') || url.startsWith('/public/');
}

function isGenericUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return true;
  const trimmed = url.trim();
  if (trimmed === PLACEHOLDER_URL) return true;
  if (trimmed.toLowerCase().includes('placeholder')) return true;
  if (trimmed.toLowerCase().includes('example.com')) return true;
  if (!trimmed.startsWith('http') && !trimmed.startsWith('/')) return true;
  // Les assets maison et Supabase Storage sont toujours valides
  if (isSupabaseStorage(trimmed)) return false;
  if (isEditorialImage(trimmed)) return false;
  const photoId = parsePhotoId(trimmed);
  if (photoId && GENERIC_PHOTO_IDS.has(photoId)) return true;
  return false;
}

type ArticleRow = { slug: string; featured_image: string | null };

/**
 * Détecte les IDs Unsplash partagés par plusieurs articles.
 * Seuil : 2 articles (site éditorial — chaque image doit être unique).
 * Les assets Supabase Storage et images maison sont toujours exclus du comptage.
 */
function extractDuplicateIds(articles: ArticleRow[]): Map<string, string[]> {
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
  // Conserver uniquement les IDs utilisés par ≥ 2 articles (seuil éditorial strict)
  const dups = new Map<string, string[]>();
  for (const [photoId, slugs] of urlCount) {
    if (slugs.length >= 2) dups.set(photoId, slugs);
  }
  return dups;
}

function buildQuery(post: {
  title?: string;
  category?: string;
  tags?: string[];
  slug?: string;
  voice_notes?: string;
}): string {
  const parts: string[] = [];
  // Priorité 1 : mots-clés voice_notes (contenu terrain)
  if (post.voice_notes) {
    const words = post.voice_notes.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
    if (words) parts.push(words);
  }
  // Priorité 2 : titre (4 premiers mots)
  const titleWords = (post.title || '').split(' ').slice(0, 4).join(' ');
  if (titleWords) parts.push(titleWords);
  // Priorité 3 : catégorie
  if (post.category) parts.push(post.category);
  // Priorité 4 : tags (2 premiers)
  if (Array.isArray(post.tags)) {
    const t = post.tags.slice(0, 2).join(' ');
    if (t) parts.push(t);
  }
  return parts.filter(Boolean).join(' ') || 'slow travel landscape';
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
  // Limite optionnelle pour les passes partielles (ex: ?limit=5)
  const limit = parseInt(searchParams.get('limit') || '0', 10);

  try {
    const { data: posts, error: postsError } = await supabase
      .from('cms_blog_posts')
      .select('id, slug, title, category, tags, featured_image, voice_notes');

    if (postsError) throw postsError;

    const allPosts = (posts || []).filter((p: any) => p.slug);
    const duplicateMap = extractDuplicateIds(allPosts);
    const duplicatePhotoIds = new Set(duplicateMap.keys());

    const candidates = allPosts.filter((post: { featured_image?: string | null }) => {
      if (isGenericUrl(post.featured_image)) return true;
      if (!post.featured_image) return false;
      if (isSupabaseStorage(post.featured_image) && !isRecheck) return false;
      if (isEditorialImage(post.featured_image) && !isRecheck) return false;
      const photoId = parsePhotoId(post.featured_image);
      if (photoId && duplicatePhotoIds.has(photoId)) return true;
      return false;
    });

    // Appliquer la limite si demandée
    const paginated = limit > 0 ? candidates.slice(0, limit) : candidates;

    if (dryRun) {
      const details = paginated.map((p: any) => {
        const photoId = parsePhotoId(p.featured_image);
        const sharedWith = photoId && duplicateMap.has(photoId)
          ? duplicateMap.get(photoId)!.filter(s => s !== p.slug)
          : [];
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          current_image: p.featured_image?.substring(0, 120) || null,
          reason: !p.featured_image || p.featured_image.trim() === ''
            ? 'empty'
            : p.featured_image === PLACEHOLDER_URL
            ? 'placeholder'
            : isGenericUrl(p.featured_image)
            ? 'generic'
            : 'duplicate',
          duplicate_count: sharedWith.length + 1,
          shared_with: sharedWith,
          query: buildQuery(p),
        };
      });
      return NextResponse.json({
        dryRun: true,
        total: allPosts.length,
        candidates: paginated.length,
        totalCandidates: candidates.length,
        details,
      });
    }

    let updatedCount = 0;
    const results: {
      slug: string;
      old_url: string | null;
      new_url: string | null;
      skipped?: string;
    }[] = [];

    const batchSize = 3;
    for (let i = 0; i < paginated.length; i += batchSize) {
      const batch = paginated.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (post: any) => {
          const query = buildQuery(post);
          const photos = await searchUnsplash(query, 5);
          if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
            return {
              id: post.id,
              slug: post.slug,
              old_url: post.featured_image,
              new_url: photos[0].urls.regular,
            };
          }
          return {
            id: post.id,
            slug: post.slug,
            old_url: post.featured_image,
            new_url: null,
            skipped: 'no_unsplash_result',
          };
        })
      );
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
      message: `Mis à jour : ${updatedCount} article(s) sur ${paginated.length} candidat(s).`,
      details: {
        total: allPosts.length,
        candidatesFound: candidates.length,
        paginated: paginated.length,
        updated: updatedCount,
        failed: paginated.length - updatedCount,
      },
      results,
    });
  } catch (error: any) {
    console.error('[fix-empty-images] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
