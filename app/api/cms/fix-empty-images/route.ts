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

function needsUpdate(imageUrl: string | null | undefined): boolean {
  return !imageUrl || imageUrl.trim() === '' || imageUrl.includes('placeholder') || imageUrl === PLACEHOLDER_URL;
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    // 1. Fetch Blog Posts with title for better image search
    const { data: posts, error: postsError } = await supabase.from('cms_blog_posts')
      .select('id, title, category, tags, featured_image');

    if (postsError) throw postsError;

    const postsToUpdate = (posts || []).filter((post: { featured_image?: string | null }) => needsUpdate(post.featured_image));

    // 2. Fetch Destinations
    const { data: destinations, error: destError } = await supabase.from('destinations')
      .select('id, name, country, tags, featured_image');

    if (destError) throw destError;

    const destsToUpdate = (destinations || []).filter((dest: { featured_image?: string | null }) => needsUpdate(dest.featured_image));

    let updatedCount = 0;

    // 3. Process Blog Posts concurrently for Unsplash API
    // Uses title + tags for relevant images instead of just category
    const postResults = await Promise.all(postsToUpdate.map(async (post: { id: number; title?: string; category?: string; tags?: string[] }) => {
      // Build query from title + category + tags for relevance
      const titleWords = (post.title || '').split(' ').slice(0, 4).join(' ');
      const category = post.category || '';
      const tags = Array.isArray(post.tags) ? post.tags.slice(0, 2).join(' ') : '';
      const query = [titleWords, category, tags].filter(Boolean).join(' ') || 'travel landscape';
      const photos = await searchUnsplash(query, 1);
      if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
        return { id: post.id, featured_image: photos[0].urls.regular };
      }
      return null;
    }));

    const validPostUpdates = postResults.filter(Boolean);
    if (validPostUpdates.length > 0) {
      // Optimization: batching updates using upsert instead of N+1 update queries reduces DB roundtrips.
      const { error } = await supabase.from('cms_blog_posts').upsert(validPostUpdates);
      if (error) throw error;
      updatedCount += validPostUpdates.length;
    }

    // 4. Process Destinations concurrently for Unsplash API
    // Optimization: using Promise.all speeds up the external API requests, reducing I/O wait time.
    const destResults = await Promise.all(destsToUpdate.map(async (dest: { id: number; name?: string; country?: string }) => {
      const query = dest.name || dest.country || 'landscape';
      const photos = await searchUnsplash(query, 1);
      if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
        return { id: dest.id, featured_image: photos[0].urls.regular };
      }
      return null;
    }));

    const validDestUpdates = destResults.filter(Boolean);
    if (validDestUpdates.length > 0) {
      // Optimization: batching updates using upsert instead of N+1 update queries reduces DB roundtrips.
      const { error } = await supabase.from('destinations').upsert(validDestUpdates);
      if (error) throw error;
      updatedCount += validDestUpdates.length;
    }

    return NextResponse.json({
        success: true,
        message: `Updated ${updatedCount} records with new images.`,
        details: {
            postsFound: postsToUpdate.length,
            destinationsFound: destsToUpdate.length,
            totalUpdates: updatedCount
        }
    });

  } catch (error: any) {
    console.error("Error fixing images:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}