import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CMS_PASSWORD = process.env.CMS_PASSWORD || 'heldonica2024';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-cms-auth');
  return auth === CMS_PASSWORD;
}

// GET /api/cms/content?page=home
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

  let query = supabase.from('site_content').select('*').order('page').order('id');
  if (page) query = query.eq('page', page);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data });
}

// PUT /api/cms/content  body: { page, block_key, value }
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { page, block_key, value } = body;
  if (!page || !block_key) return NextResponse.json({ error: 'page et block_key requis' }, { status: 400 });

  const { error } = await supabase
    .from('site_content')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('page', page)
    .eq('block_key', block_key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
