import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

// Types
export interface CmsZone {
  id: string;
  page: string;
  zone_key: string;
  zone_type: string;
  value: string;
  is_active: boolean;
}

export interface CmsZonesResponse {
  zones: Record<string, CmsZone>;
  byPage: Record<string, Record<string, CmsZone>>;
}

// GET /api/cms/zones - lecture publique des zones actives
// Query params: ?page=global (optionnel, défaut: toutes)
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page'); // 'global', 'home', etc.

  try {
    let query = supabase
      .from('cms_editable_zones')
      .select('id, page, zone_key, zone_type, value, is_active')
      .eq('is_active', true)
      .order('page')
      .order('zone_key');

    if (page) {
      query = query.eq('page', page);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching zones:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Organiser par clé et par page
    const zones: Record<string, CmsZone> = {};
    const byPage: Record<string, Record<string, CmsZone>> = {};

    (data || []).forEach((zone: CmsZone) => {
      // Index par zone_key
      zones[zone.zone_key] = zone;
      
      // Index par page > zone_key
      if (!byPage[zone.page]) {
        byPage[zone.page] = {};
      }
      byPage[zone.page][zone.zone_key] = zone;
    });

    const response: CmsZonesResponse = { zones, byPage };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Zones fetch error:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
