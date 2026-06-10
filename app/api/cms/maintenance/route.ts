import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { createClient } from '@supabase/supabase-js';

const MAINTENANCE_COOKIE = 'heldonica_maintenance';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET — current maintenance status
export async function GET() {
  // Read from Supabase as source of truth
  if (supabase) {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();
    const active = data?.value === 'true' || data?.value === '1';
    return NextResponse.json({ active });
  }
  return NextResponse.json({ active: false });
}

// POST { active: boolean } — toggle maintenance mode
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const { active } = await req.json() as { active: boolean };

  // Persist to Supabase
  if (supabase) {
    await supabase.from('site_settings').upsert(
      { key: 'maintenance_mode', value: active ? 'true' : 'false', updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  }

  const res = NextResponse.json({ success: true, active });

  if (active) {
    // Set cookie readable by edge middleware
    res.cookies.set(MAINTENANCE_COOKIE, '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } else {
    res.cookies.set(MAINTENANCE_COOKIE, '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
    });
  }

  return res;
}
