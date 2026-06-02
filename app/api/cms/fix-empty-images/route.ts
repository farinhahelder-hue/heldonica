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

    const updatePromises: Promise<any>[] = [];
    let updatedCount = 0;

    // 3. Process Blog Posts sequentially for Unsplash API
    for (const post of postsToUpdate) {
      const query = post.category || 'travel';
      const photos = await searchUnsplash(query, 1);

      if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
         updatePromises.push(
           // @ts-expect-error Supabase types are not fully inferred
           supabase.from('cms_blog_posts').update({ featured_image: photos[0].urls.regular }).eq('id', post.id)
         );
         updatedCount++;
      }
    }

    // 4. Process Destinations sequentially for Unsplash API
    for (const dest of destsToUpdate) {
        const query = dest.name || dest.country || 'landscape';
        const photos = await searchUnsplash(query, 1);

        if (photos && photos.length > 0 && photos[0]?.urls?.regular) {
            updatePromises.push(
                // @ts-expect-error Supabase types are not fully inferred
                supabase.from('destinations').update({ featured_image: photos[0].urls.regular }).eq('id', dest.id)
            )
            updatedCount++;
        }
    }

    // 5. Execute all database updates concurrently
    await Promise.all(updatePromises);

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