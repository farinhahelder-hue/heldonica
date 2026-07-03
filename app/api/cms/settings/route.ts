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

// GET /api/cms/settings - list all settings (public for layout)
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform to key-value object for easier consumption
  const settings = Object.fromEntries(
    (data || []).map((r: { key: string; value: string }) => [r.key, r.value])
  );

  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

// PATCH /api/cms/settings - update settings (auth required)
export async function PATCH(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();

    // Support both { key: value } and { settings: [{ key, value }] }
    if (Array.isArray(body)) {
      const updates = body.map((s: { key: string; value: string }) => ({
        key: s.key,
        value: s.value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) {
        console.error(`Error bulk updating settings array:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const synced = { ...body };
      // Sync logo_url→site_logo and favicon_url→site_favicon for legacy compatibility
      if (synced.logo_url) synced.site_logo = synced.logo_url;
      if (synced.favicon_url) synced.site_favicon = synced.favicon_url;
      if (synced.site_logo && !synced.logo_url) synced.logo_url = synced.site_logo;
      if (synced.site_favicon && !synced.favicon_url) synced.favicon_url = synced.site_favicon;

      const entries = Object.entries(synced);
      const updates = entries
        .filter(([key]) => key !== 'error' && key !== 'settings')
        .map(([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString()
        }));

      if (updates.length > 0) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(updates, { onConflict: 'key' });

        if (error) {
          console.error(`Error bulk updating settings object:`, error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// Legacy PUT for backward compatibility
export async function PUT(req: NextRequest) {
  return PATCH(req);
}
