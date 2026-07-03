import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

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

    const zones: Record<string, CmsZone> = {};
    const byPage: Record<string, Record<string, CmsZone>> = {};

    (data || []).forEach((zone: CmsZone) => {
      zones[zone.zone_key] = zone;
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

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const { page, zone_key, value, zone_type } = body;

    if (!page || !zone_key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: page, zone_key, value' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('cms_editable_zones')
      .select('id, value')
      .eq('page', page)
      .eq('zone_key', zone_key)
      .maybeSingle();

    if (existing) {
      // Log history before overwriting
      await supabase.from('cms_zone_history').insert({
        page,
        zone_key,
        old_value: existing.value ?? null,
        new_value: value,
      });

      const { error } = await supabase
        .from('cms_editable_zones')
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Zone update error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('cms_editable_zones')
        .insert({
          page,
          zone_key,
          value,
          zone_type: zone_type || 'text',
          is_active: true,
        });

      if (error) {
        console.error('Zone insert error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Zone PATCH error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
