import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { searchUnsplash } from '@/lib/unsplash';
import { GENERIC_PHOTO_IDS } from '@/lib/generic-photos';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

const PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop';


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
  const title = (post.title || '').toLowerCase();
  const slug = (post.slug || '').toLowerCase();
  const tags = (post.tags || []).map(t => t.toLowerCase());
  const category = (post.category || '').toLowerCase();
  const allText = [title, slug, ...tags, category].join(' ');

  if (allText.includes('madere') || allText.includes('madère') || allText.includes('madeira')) {
    if (allText.includes('poncha')) return 'Madeira poncha traditional drink cocktail';
    if (allText.includes('fanal')) return 'Madeira Fanal forest mist laurissilva';
    if (allText.includes('bacalhau')) return 'portuguese codfish bacalhau dish';
    if (allText.includes('bolo')) return 'traditional bread bolo do caco madeira';
    if (allText.includes('prego')) return 'beef sandwich prego portugal';
    if (allText.includes('levada')) return 'Madeira levada hiking trail forest';
    if (allText.includes('curral')) return 'Curral das Freiras valley madeira mountains';
    return 'Madeira island landscape coast nature';
  }
  if (allText.includes('suisse') || allText.includes('switzerland') || allText.includes('zurich') || allText.includes('stoos') || allText.includes('limmat')) {
    if (allText.includes('stoos')) return 'Stoos Ridge switzerland mountain lake';
    if (allText.includes('zurich') || allText.includes('limmat')) return 'Zurich city Limmat river switzerland';
    if (allText.includes('brasserie') || allText.includes('bière')) return 'zurich brewery beer craft';
    return 'Swiss Alps mountain landscape';
  }
  if (allText.includes('roumanie') || allText.includes('romania') || allText.includes('maramures') || allText.includes('timisoara') || allText.includes('mocanita')) {
    if (allText.includes('mocanita') || allText.includes('train')) return 'Mocanita steam train maramures romania';
    if (allText.includes('timisoara') || allText.includes('cuib')) return 'Timisoara city square romania';
    if (allText.includes('roumanie') || allText.includes('romania')) return 'Maramures wooden churches landscape romania';
    return 'Romania landscape countryside';
  }
  if (allText.includes('montenegro') || allText.includes('podgorica')) {
    return 'Podgorica city montenegro landscape';
  }
  if (allText.includes('paris') || allText.includes('mouffetard') || allText.includes('ceinture')) {
    if (allText.includes('mouffetard')) return 'Rue Mouffetard Paris street market';
    if (allText.includes('ceinture')) return 'Petite Ceinture Paris abandoned railway garden';
    return 'Paris street seine cityscape';
  }
  if (allText.includes('lisbonne') || allText.includes('lisbon') || allText.includes('porto') || allText.includes('portugal')) {
    if (allText.includes('porto')) return 'Porto city riverside douro portugal';
    return 'Lisbon Alfama street view portugal';
  }
  if (allText.includes('sicile') || allText.includes('sicily')) {
    return 'Sicily landscape nature sea italy';
  }
  if (allText.includes('grece') || allText.includes('grèce') || allText.includes('greek')) {
    if (allText.includes('athènes') || allText.includes('athens')) return 'Athens acropolis greece';
    return 'Greek island aegean sea landscape';
  }

  // Fallback : utiliser le contenu terrain (voice_notes) puis le titre
  const parts: string[] = [];
  if (post.voice_notes) {
    const words = post.voice_notes.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
    if (words) parts.push(words);
  }
  if (title) {
    const titleWords = title.split(' ').slice(0, 4).join(' ');
    if (titleWords) parts.push(titleWords);
  }
  if (category && !parts.some(p => p.includes(category))) parts.push(category);
  return parts.filter(Boolean).join(' ') || 'slow travel landscape europe';
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
