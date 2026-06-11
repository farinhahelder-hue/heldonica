import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Cache-Control for quick propagation (max 60s as per spec)
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=30';

// GET /api/cms/settings/maintenance - get current maintenance status
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  if (error) {
    // If not found, return false (maintenance off)
    if (error.code === 'PGRST116') {
      return NextResponse.json({ active: false }, {
        headers: { 'Cache-Control': CACHE_CONTROL }
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const active = data?.value === 'true' || data?.value === '1';
  return NextResponse.json({ active }, {
    headers: { 'Cache-Control': CACHE_CONTROL }
  });
}

// PATCH /api/cms/settings/maintenance - toggle maintenance mode
export async function PATCH(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const { active } = await req.json() as { active: boolean };

    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body: active must be a boolean' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'maintenance_mode',
        value: active ? 'true' : 'false',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error updating maintenance mode:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      active,
      message: active
        ? 'Mode maintenance activé. Le site est maintenant inaccessible aux visiteurs.'
        : 'Mode maintenance désactivé. Le site est de nouveau accessible.'
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('Error in maintenance PATCH:', err);
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}