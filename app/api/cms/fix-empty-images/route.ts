import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { searchUnsplash } from '@/lib/unsplash';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const PLACEHOLDER_URL = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop';

function needsUpdate(imageUrl: string | null | undefined): boolean {
  return !imageUrl || imageUrl.trim() === '' || imageUrl.includes('placeholder') || imageUrl === PLACEHOLDER_URL;
}

export async function POST(req: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    // 1. Fetch Blog Posts
    const { data: posts, error: postsError } = await supabase.from('cms_blog_posts')
      .select('id, category, featured_image');

    if (postsError) throw postsError;

    const postsToUpdate = (posts || []).filter(post => needsUpdate(post.featured_image));

    // 2. Fetch Destinations
    const { data: destinations, error: destError } = await supabase.from('destinations')
      .select('id, name, country, featured_image');

    if (destError) throw destError;

    const destsToUpdate = (destinations || []).filter(dest => needsUpdate(dest.featured_image));

        let updatedCount = 0;

    // ⚡ Bolt: Use Promise.all() for concurrent Unsplash requests and batch Supabase upserts to minimize database calls.
    // 3. Process Blog Posts concurrently
    const postUpdates = await Promise.all(postsToUpdate.map(async (post) => {
        const query = post.category || 'travel';
        const photos = await searchUnsplash(query, 1);
        if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
            return { id: post.id, featured_image: photos[0].urls.regular };
        }
        return null;
    }));
    const validPostUpdates = postUpdates.filter((update): update is { id: number; featured_image: string } => update !== null);

    if (validPostUpdates.length > 0) {
        await supabase.from('cms_blog_posts').upsert(validPostUpdates);
        updatedCount += validPostUpdates.length;
    }

    // 4. Process Destinations concurrently
    const destUpdates = await Promise.all(destsToUpdate.map(async (dest) => {
        const query = dest.name || dest.country || 'landscape';
        const photos = await searchUnsplash(query, 1);
        if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
            return { id: dest.id, featured_image: photos[0].urls.regular };
        }
        return null;
    }));
    const validDestUpdates = destUpdates.filter((update): update is { id: number; featured_image: string } => update !== null);

    if (validDestUpdates.length > 0) {
        await supabase.from('destinations').upsert(validDestUpdates);
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