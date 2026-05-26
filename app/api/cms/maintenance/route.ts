import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

// GET /api/cms/maintenance - get maintenance status
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  if (!supabase) {
    return NextResponse.json({ maintenance_mode: false, maintenance_message: '' });
  }

  const [modeResult, messageResult] = await Promise.all([
    supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single(),
    supabase.from('site_settings').select('value').eq('key', 'maintenance_message').single(),
  ]);

  return NextResponse.json({
    maintenance_mode: modeResult.data?.value === 'true',
    maintenance_message: messageResult.data?.value || 'On revient très vite avec de nouvelles pépites ! 🌿',
  });
}

// POST /api/cms/maintenance - toggle maintenance mode
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await req.json();
  const { maintenance_mode, maintenance_message } = body;

  const now = new Date().toISOString();

  // Update maintenance_mode
  if (typeof maintenance_mode === 'boolean') {
    const { error: error1 } = await supabase
      .from('site_settings')
      .upsert({ key: 'maintenance_mode', value: String(maintenance_mode), updated_at: now }, { onConflict: 'key' });
    
    if (error1) {
      return NextResponse.json({ error: error1.message }, { status: 500 });
    }
  }

  // Update maintenance_message if provided
  if (typeof maintenance_message === 'string') {
    const { error: error2 } = await supabase
      .from('site_settings')
      .upsert({ key: 'maintenance_message', value: maintenance_message, updated_at: now }, { onConflict: 'key' });
    
    if (error2) {
      return NextResponse.json({ error: error2.message }, { status: 500 });
    }
  }

  // Set cookie for middleware to read (httpOnly, secure, sameSite strict)
  const response = NextResponse.json({ 
    success: true, 
    maintenance_mode,
    maintenance_message,
  });

  // Set cookie with maintenance status (7 days expiry)
  response.cookies.set('heldonica_maintenance', maintenance_mode ? '1' : '0', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}