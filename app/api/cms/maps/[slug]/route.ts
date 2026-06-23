import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireCmsAuth } from '@/lib/cms-auth';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;

  const { slug } = params;

  const [{ data: routes }, { data: pois }] = await Promise.all([
    supabase.from('article_map_routes').select('*').eq('content_slug', slug).order('display_order'),
    supabase.from('article_map_pois').select('*').eq('content_slug', slug).order('display_order'),
  ]);

  const routeIds = (routes ?? []).map((r: any) => r.id);
  let points: any[] = [];
  if (routeIds.length > 0) {
    const { data } = await supabase
      .from('article_map_route_points')
      .select('*')
      .in('route_id', routeIds)
      .order('seq');
    points = data ?? [];
  }

  return NextResponse.json({ routes: routes ?? [], pois: pois ?? [], points });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;

  const body = await req.json();
  const { type, ...data } = body;

  if (type === 'poi') {
    const { data: poi, error } = await supabase
      .from('article_map_pois')
      .insert({ ...data, content_slug: params.slug })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(poi);
  }

  const { data: route, error } = await supabase
    .from('article_map_routes')
    .insert({ ...data, content_slug: params.slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(route);
}

export async function PUT(req: NextRequest) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;

  const body = await req.json();
  const { type, id, ...data } = body;

  const table = type === 'poi' ? 'article_map_pois' : 'article_map_routes';
  const { data: updated, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const table =
    type === 'poi' ? 'article_map_pois' :
    type === 'point' ? 'article_map_route_points' :
    'article_map_routes';

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
