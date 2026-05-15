import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  // 1. Security Check (Vercel Cron)
  const authHeader = req.headers.get('Authorization');
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  // Allow manual trigger for testing (to be removed in production if needed)
  if (!isCron && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Support both service key names used in the project
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[CRON] Supabase configuration missing');
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const now = new Date().toISOString();

    // Find articles that should be published (scheduled_published_at <= now but not yet published)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cms_blog_posts?scheduled_published_at=lte.${now}&published=eq.false&select=id,title,slug,scheduled_published_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[CRON] Failed to fetch scheduled articles:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Supabase', details: errorText }, { status: res.status });
    }

    const articles = await res.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ message: 'No scheduled articles to publish', published: 0 });
    }


    // Publish each article
    let published = 0;
    const errors = [];

    for (const article of articles) {
      try {
        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/cms_blog_posts?id=eq.${article.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              published: true,
              published_at: now,
              scheduled_published_at: null,
            }),
          }
        );

        if (updateRes.ok) {
          published++;
        } else {
          const err = await updateRes.text();
          console.error(`[CRON] Failed to publish ${article.slug}:`, err);
          errors.push({ id: article.id, error: err });
        }
      } catch (e: any) {
        console.error(`[CRON] Exception publishing ${article.slug}:`, e.message);
        errors.push({ id: article.id, error: e.message });
      }
    }

    return NextResponse.json({ 
      message: `Published ${published}/${articles.length} article(s)`, 
      published,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('[CRON] Publish scheduled fatal error:', error.message);
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}