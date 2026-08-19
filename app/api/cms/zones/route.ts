import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { revalidateCmsTarget } from '@/lib/revalidate';

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

// PATCH /api/cms/zones - Mise à jour rapide d'une zone (Inline Edit)
export async function PATCH(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const { page, zone_key, value } = body;

    if (!page || !zone_key) {
      return NextResponse.json({ error: 'page et zone_key requis' }, { status: 400 });
    }

    // Récupérer l'ancienne valeur pour l'historique
    const { data: existingZone } = await supabase
      .from('cms_editable_zones')
      .select('id, value')
      .eq('page', page)
      .eq('zone_key', zone_key)
      .maybeSingle();

    if (existingZone && existingZone.value !== value) {
      try {
        await supabase.from('cms_zone_history').insert({
          zone_id: existingZone.id,
          page,
          zone_key,
          previous_value: existingZone.value,
          new_value: value,
          created_at: new Date().toISOString(),
        });
      } catch {}
    }

    const { error } = await supabase
      .from('cms_editable_zones')
      .upsert(
        {
          page,
          zone_key,
          value: value ?? '',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page,zone_key' }
      );

    if (error) {
      console.error('[CMS Zones PATCH] Erreur upsert:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidation instantanée On-Demand
    await revalidateCmsTarget({ page });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[CMS Zones PATCH] Exception:', err);
    return NextResponse.json({ error: err.message || 'Échec de la mise à jour' }, { status: 500 });
  }
}

// POST /api/cms/zones - Sauvegarde complète d'une zone depuis le gestionnaire
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const { page, zone_key, value, zone_type, label, is_active } = body;

    if (!page || !zone_key) {
      return NextResponse.json({ error: 'page et zone_key requis' }, { status: 400 });
    }

    const payload: any = {
      page,
      zone_key,
      value: value ?? '',
      updated_at: new Date().toISOString(),
    };

    if (zone_type !== undefined) payload.zone_type = zone_type;
    if (label !== undefined) payload.label = label;
    if (is_active !== undefined) payload.is_active = is_active;

    const { error } = await supabase
      .from('cms_editable_zones')
      .upsert(payload, { onConflict: 'page,zone_key' });

    if (error) {
      console.error('[CMS Zones POST] Erreur upsert:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidation instantanée On-Demand
    await revalidateCmsTarget({ page });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[CMS Zones POST] Exception:', err);
    return NextResponse.json({ error: err.message || 'Échec de la création/mise à jour' }, { status: 500 });
  }
}
