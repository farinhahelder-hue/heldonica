import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

// GET /api/cms/settings - list all settings
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const { data, error } = await supabase
    .from('cms_settings')
    .select('*')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

// PUT /api/cms/settings - update single or bulk
export async function PUT(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const body = await req.json();

  // Bulk update
  if (Array.isArray(body)) {
    const updates = body.map((s: { key: string; value: string }) => ({
      key: s.key,
      value: s.value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('cms_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Single update
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const { error } = await supabase
    .from('cms_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
