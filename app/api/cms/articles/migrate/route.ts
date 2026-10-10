import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { revalidateCmsTarget } from '@/lib/revalidate';
import {
  migrateArticleContentToBlocks,
  batchMigrateArticles,
  isArticleConvertedToBlocks,
} from '@/lib/cms-article-migrator';

let _cached: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = url && key ? createClient(url, key) : null;
  }
  return _cached;
}

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/articles/migrate
 * Diagnostic et simulation (dry-run) de la migration par blocs sur les articles de la base.
 */
export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10) || 50));

  const { data, error } = await (sb.from('cms_blog_posts') as any)
    .select('id, title, slug, content, season, mobility, budget_level, carbon_footprint')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title || 'Sans titre',
    slug: p.slug || '',
    content: p.content || '',
    season: p.season,
    mobility: p.mobility,
    budget_level: p.budget_level,
    carbon_footprint: p.carbon_footprint,
  }));

  const report = batchMigrateArticles(articles, {
    cleanupWordPressNoise: true,
    detectPhotoEvidence: true,
  });

  return NextResponse.json({
    mode: 'dry_run',
    report,
  });
}

/**
 * POST /api/cms/articles/migrate
 * Exécute la migration idempotente pour un article spécifique ou par lot.
 */
export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const dryRun = body.dry_run === true;
  const detectPhoto = body.detect_photo_evidence !== false;
  const articleId = body.article_id ? Number(body.article_id) : null;

  // 1. Cas : Migration d'un article unique
  if (articleId) {
    const { data: post, error: fetchErr } = await (sb.from('cms_blog_posts') as any)
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchErr || !post) {
      return NextResponse.json(
        { error: fetchErr ? fetchErr.message : 'Article introuvable' },
        { status: 404 }
      );
    }

    const migrationRes = migrateArticleContentToBlocks(
      post.content,
      {
        title: post.title,
        season: post.season,
        mobility: post.mobility,
        budget_level: post.budget_level,
        carbon_footprint: post.carbon_footprint,
      },
      {
        cleanupWordPressNoise: true,
        detectPhotoEvidence: detectPhoto,
      }
    );

    if (!dryRun && migrationRes.changed) {
      const { error: updateErr } = await (sb.from('cms_blog_posts') as any)
        .update({
          content: migrationRes.migratedHtml,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      await revalidateCmsTarget({ page: 'blog' });
      if (post.slug) {
        await revalidateCmsTarget({ type: 'article', slug: post.slug });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      articleId,
      slug: post.slug,
      ...migrationRes,
    });
  }

  // 2. Cas : Migration par lot (batch)
  const limit = Math.max(1, Math.min(100, Number(body.limit) || 50));
  const { data: posts, error: listErr } = await sb
    .from('cms_blog_posts')
    .select('id, title, slug, content, season, mobility, budget_level, carbon_footprint')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const articles = (posts || []).map((p: any) => ({
    id: p.id,
    title: p.title || 'Sans titre',
    slug: p.slug || '',
    content: p.content || '',
    season: p.season,
    mobility: p.mobility,
    budget_level: p.budget_level,
    carbon_footprint: p.carbon_footprint,
  }));

  const report = batchMigrateArticles(articles, {
    cleanupWordPressNoise: true,
    detectPhotoEvidence: detectPhoto,
  });

  // Si exécution réelle (non dry-run), persister les articles modifiés
  if (!dryRun) {
    let persistedCount = 0;
    for (const art of articles) {
      if (!isArticleConvertedToBlocks(art.content)) {
        const single = migrateArticleContentToBlocks(art.content, { title: art.title });
        if (single.changed) {
          const { error: upErr } = await (sb.from('cms_blog_posts') as any)
            .update({
              content: single.migratedHtml,
              updated_at: new Date().toISOString(),
            })
            .eq('id', art.id);

          if (!upErr) {
            persistedCount++;
          }
        }
      }
    }

    await revalidateCmsTarget({ page: 'blog' });
    return NextResponse.json({
      success: true,
      dryRun: false,
      persistedCount,
      report,
    });
  }

  return NextResponse.json({
    success: true,
    dryRun: true,
    report,
  });
}
