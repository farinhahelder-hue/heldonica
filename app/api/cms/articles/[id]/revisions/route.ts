import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { getPostRevisions, savePostRevision } from '@/lib/cms-revisions';
import { supabase } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/cms/articles/[id]/revisions : Récupérer l'historique des versions d'un article
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'ID d’article manquant.' }, { status: 400 });
  }

  const result = await getPostRevisions(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ revisions: result.revisions, count: result.revisions.length });
}

/**
 * POST /api/cms/articles/[id]/revisions : Sauvegarder manuellement un point de restauration
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'ID d’article manquant.' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase indisponible.' }, { status: 500 });
  }

  const { data: post, error } = await supabase
    .from('cms_blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, author')
    .eq('id', id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
  }

  const result = await savePostRevision(post, {
    id: 'operator',
    email: 'admin@heldonica.fr',
    role: 'admin',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, revisionId: result.revisionId }, { status: 201 });
}
