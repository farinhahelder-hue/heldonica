import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// GET /api/cms/settings?group=general
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  
  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const group = searchParams.get('group');

  let query = supabase.from('site_settings').select('*').order('group_name').order('id');
  if (group) query = query.eq('group_name', group);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

// PUT /api/cms/settings  body: { key, value }
export async function PUT(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  
  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const { error } = await supabase
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
