import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

// GET /api/cms/audit - Liste les événements récents d'audit
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const entity = searchParams.get('entity');

  let query = supabase
    .from('cms_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (entity) {
    query = query.eq('entity', entity);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    logs: data || [],
    count: (data || []).length,
  });
}

// POST /api/cms/audit - Enregistre une entrée d'audit manuelle ou programmatique
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { action, entity, entity_id, diff, metadata, user_email, user_role } = body;

    if (!action || !entity) {
      return NextResponse.json({ error: 'Champs action et entity obligatoires' }, { status: 400 });
    }

    const { data, error } = await supabase.from('cms_audit_log').insert({
      action,
      entity,
      entity_id: entity_id || null,
      diff: diff || {},
      metadata: metadata || {},
      user_email: user_email || 'admin@heldonica.fr',
      user_role: user_role || 'admin',
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Corps de requête invalide';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
