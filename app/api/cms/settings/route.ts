import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

// GET /api/cms/settings - list all settings (public for layout)
export async function GET(req: NextRequest) {
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
    (data || []).map(r => [r.key, r.value])
  );
  
  return NextResponse.json(settings);
}

// PATCH /api/cms/settings - update settings (auth required)
export async function PATCH(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    
    // Support both { key: value } and { settings: [{ key, value }] }
    if (Array.isArray(body)) {
      // Bulk update with array format
      const updates = body.map((s: { key: string; value: string }) => ({
        key: s.key,
        value: s.value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) console.error(`Error updating ${update.key}:`, error.message);
      }
    } else {
      // Simple key-value format
      const entries = Object.entries(body);
      for (const [key, value] of entries) {
        if (key === 'error' || key === 'settings') continue; // Skip internal keys
        
        const { error } = await supabase
          .from('site_settings')
          .upsert({ 
            key, 
            value: String(value), 
            updated_at: new Date().toISOString() 
          }, { onConflict: 'key' });
        
        if (error) console.error(`Error updating ${key}:`, error.message);
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
