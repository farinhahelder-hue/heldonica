import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

let _cached: ReturnType<typeof createClient> | null = null;
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = url && key ? createClient(url, key) : null;
  }
  return _cached;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const sb = supabase();
  if (!sb) {
    return NextResponse.json({ tasks: [], warning: 'Supabase non configuré' }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const agent = searchParams.get('agent');
  const status = searchParams.get('status');
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '30', 10) || 30));

  let query: any = (sb.from('agent_tasks' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (agent && agent !== 'all') {
    query = query.eq('agent', agent);
  }
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[agent-tasks GET] Erreur Supabase:', error.message);
    return NextResponse.json({ tasks: [], error: error.message }, { status: 200 });
  }

  return NextResponse.json({ tasks: data || [] }, { status: 200 });
}

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  let body: {
    agent?: string;
    task?: string;
    description?: string;
    scope?: string;
    risk_level?: string;
    article_id?: number;
    article_slug?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  const { agent, task, description, scope, risk_level, article_id, article_slug } = body;

  if (!agent || !task || task.trim().length < 5) {
    return NextResponse.json({ error: 'Champs agent et task (min 5 car.) obligatoires' }, { status: 400 });
  }

  const sb = supabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  let enrichedDescription = description || '';
  if (article_id || article_slug) {
    const metaTag = `\n[Contexte CMS: Article #${article_id || 'n/a'} - ${article_slug || 'n/a'}]`;
    if (!enrichedDescription.includes(metaTag)) {
      enrichedDescription = `${enrichedDescription.trim()}${metaTag}`;
    }
  }

  const { data, error } = await (sb.from('agent_tasks' as any) as any)
    .insert([
      {
        agent: agent.toLowerCase().trim(),
        task: task.trim(),
        description: enrichedDescription.trim(),
        scope: scope || 'content',
        risk_level: risk_level || 'low',
        status: 'sent',
        validated_by: 'pending',
      },
    ])
    .select('*')
    .single();

  if (error) {
    console.error('[agent-tasks POST] Erreur insertion:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  let body: {
    id?: string;
    status?: string;
    validated_by?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  const { id, status, validated_by, notes } = body;
  if (!id) {
    return NextResponse.json({ error: 'Identifiant id obligatoire' }, { status: 400 });
  }

  const sb = supabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status) updates.status = status;
  if (validated_by) {
    updates.validated_by = validated_by;
    updates.validated_at = new Date().toISOString();
  }
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await (sb.from('agent_tasks' as any) as any)
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[agent-tasks PATCH] Erreur mise à jour:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 200 });
}
