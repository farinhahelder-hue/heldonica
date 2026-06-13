import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireCmsAuth } from '@/lib/cms-auth';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('route_id');

  let query = supabase
    .from('article_map_pois')
    .select('*')
    .eq('content_slug', params.slug)
    .order('display_order');

  if (routeId) query = (query as any).eq('route_id', routeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from('article_map_pois')
    .insert({ ...body, content_slug: params.slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...body } = await req.json();

  const { data, error } = await supabase
    .from('article_map_pois')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('article_map_pois').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
