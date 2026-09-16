import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAiAuth } from '@/lib/ai-auth';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * GET /api/ai/destinations
 * Permet aux agents IA (Antigravity, Claude, Pencode) et au CMS d'interroger
 * les récits de terrain et itinéraires des 41 destinations réelles d'Heldonica.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    return auth.response || NextResponse.json({ error: auth.error || 'Non autorisé' }, { status: auth.status || 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  const urlObj = (req as NextRequest).nextUrl || new URL(req.url);
  const slug = urlObj.searchParams.get('slug')?.trim();
  const country = urlObj.searchParams.get('country')?.trim();

  let query = sb
    .from('destinations')
    .select('id, slug, title, country, region, excerpt, intro_narrative, itinerary, faq, budget_details, practical_info, status, travel_style, best_season, created_at')
    .order('country', { ascending: true })
    .order('title', { ascending: true });

  if (slug) {
    query = query.eq('slug', slug);
  }

  if (country) {
    query = query.ilike('country', `%${country}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ai-destinations] Erreur lecture destinations:', error.message);
    return NextResponse.json({ error: 'Erreur lors de la lecture des destinations' }, { status: 500 });
  }

  if (slug && (!data || data.length === 0)) {
    return NextResponse.json({ error: `Destination '${slug}' introuvable` }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    agent: auth.agentName,
    count: data ? data.length : 0,
    destinations: data ?? [],
  });
}
