import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

// Route serveur derrière requireCmsAuth : on utilise la clé service_role
// (la clé anon legacy est désactivée côté Supabase depuis le 19/08).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(req: NextRequest) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

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
  const auth = await requireCmsAuth(req);
  if (auth) return auth;
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

  const { route_id, points } = await req.json();
  if (!route_id || !Array.isArray(points)) {
    return NextResponse.json({ error: 'Missing route_id or points' }, { status: 400 });
  }

  // On remplace la trace : d'abord l'effacer, puis reposer les points. Si
  // l'effacement echoue en silence, les nouveaux s'ajoutent aux anciens et la
  // trace se dedouble.
  const { error: erreurEffacement } = await supabase
    .from('article_map_route_points')
    .delete()
    .eq('route_id', route_id);
  if (erreurEffacement) {
    console.error('[cms/maps/points] ancienne trace non effacee :', erreurEffacement.message);
    return NextResponse.json({ error: "L'ancienne trace n'a pas pu être effacée." }, { status: 500 });
  }

  if (points.length === 0) return NextResponse.json({ ok: true, count: 0 });

  const rows = points.map((p: { lat: number; lng: number; seq: number }) => ({
    route_id,
    lat: p.lat,
    lng: p.lng,
    seq: p.seq,
  }));

  const { data, error } = await supabase
    .from('article_map_route_points')
    .insert(rows)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: data?.length ?? 0 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireCmsAuth(req);
  if (auth) return auth;
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

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
