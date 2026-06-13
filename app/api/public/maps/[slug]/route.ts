import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Public API - no auth required
// GET /api/public/maps/[slug] - Fetch map data for public display
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { slug } = params;

  // Check if article has map enabled (from cms_blog_posts.show_map)
  // We need to check both tables for show_map flag
  const { data: post } = await supabase
    .from('cms_blog_posts')
    .select('show_map')
    .eq('slug', slug)
    .single();

  // If show_map is explicitly false or column doesn't exist, return empty
  if (post && post.show_map === false) {
    return NextResponse.json({ routes: [], pois: [], points: [] });
  }

  // Fetch routes
  const { data: routes } = await supabase
    .from('article_map_routes')
    .select('id, name, color, difficulty, duration_min, distance_km, content_type')
    .eq('content_slug', slug)
    .eq('is_active', true)
    .order('display_order');

  const routeIds = (routes ?? []).map(r => r.id);

  // Fetch POIs
  const { data: pois } = await supabase
    .from('article_map_pois')
    .select('id, name, category, lat, lng, description, route_id')
    .eq('content_slug', slug)
    .order('display_order');

  // Fetch route points
  let points: any[] = [];
  if (routeIds.length > 0) {
    const { data: routePoints } = await supabase
      .from('article_map_route_points')
      .select('route_id, lat, lng, seq')
      .in('route_id', routeIds)
      .order('seq');
    points = routePoints ?? [];
  }

  return NextResponse.json({
    routes: routes ?? [],
    pois: pois ?? [],
    points,
  });
}