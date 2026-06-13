import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-service';
import { requireCmsAuth } from '@/lib/cms-auth';

export async function GET(req: NextRequest) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('route_id');
  if (!routeId) return NextResponse.json({ error: 'Missing route_id' }, { status: 400 });

  const { data, error } = await supabase
    .from('article_map_route_points')
    .select('*')
    .eq('route_id', routeId)
    .order('seq');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { route_id, points } = await req.json();
  if (!route_id || !Array.isArray(points)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Delete existing then insert new
  await supabase.from('article_map_route_points').delete().eq('route_id', route_id);
  if (points.length > 0) {
    const rows = points.map((p: { lat: number; lng: number }, i: number) => ({
      route_id,
      lat: p.lat,
      lng: p.lng,
      seq: i,
    }));
    const { error } = await supabase.from('article_map_route_points').insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: points.length });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCmsAuth();
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('route_id');
  if (!routeId) return NextResponse.json({ error: 'Missing route_id' }, { status: 400 });

  const { error } = await supabase
    .from('article_map_route_points')
    .delete()
    .eq('route_id', routeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
