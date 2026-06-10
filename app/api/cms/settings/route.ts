import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

// Keys that must always appear in the CMS even if absent from the DB
const DEFAULT_SETTINGS: { key: string; value: string; label: string; type: string }[] = [
  { key: 'maintenance_mode',     value: 'false',       label: 'Mode maintenance (true/false)', type: 'text' },
  { key: 'maintenance_message',  value: 'Site en maintenance. Revenez bientôt !', label: 'Message affiché', type: 'text' },
  { key: 'maintenance_end_date', value: '',            label: 'Fin de maintenance (date/heure)', type: 'text' },
];

// GET /api/cms/settings - list all settings
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value, label, type')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = (data || []).map(r => ({
    key: r.key,
    value: r.value ?? '',
    label: r.label || r.key,
    type: r.type || 'text',
  }));

  // Inject defaults for keys not yet in the DB
  const existingKeys = new Set(settings.map(s => s.key));
  for (const def of DEFAULT_SETTINGS) {
    if (!existingKeys.has(def.key)) {
      settings.push(def);
    }
  }

  return NextResponse.json({ settings });
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

    if (Array.isArray(body)) {
      const updates = body.map((s: { key: string; value: string }) => ({
        key: s.key,
        value: s.value,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' });
      if (error) console.error('Error in bulk update:', error.message);
    } else {
      // Single key/value update { key, value }
      const { key, value } = body as { key: string; value: string };
      if (key) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) console.error('Error in single update:', error.message);
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
