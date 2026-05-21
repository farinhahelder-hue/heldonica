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
    console.log(`[CRON] Checking scheduled articles to publish at ${now}`);

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
      console.log('[CRON] No scheduled articles found');
      return NextResponse.json({ message: 'No scheduled articles to publish', published: 0 });
    }

    console.log(`[CRON] Found ${articles.length} articles to publish:`, articles.map(a => a.slug).join(', '));

    // Validate BEFORE publishing - skip if validation fails
    const publishErrors: { id: string; error: string }[] = [];
    let validArticles = articles;
    
    // We already have SUPABASE_URL and SUPABASE_KEY from earlier in the handler
    // Re-assigning to ensure they are available for mapping, though they are already in scope
    const API_URL = SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const API_KEY = SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!API_URL || !API_KEY) {
      console.error('[CRON] Missing Supabase config - skipping validation');
    } else {
      const validationResults = await Promise.all(
        articles.map(async (article: any) => {
          try {
            // Fetch full article for validation
            const fetchRes = await fetch(
              `${API_URL}/rest/v1/cms_blog_posts?id=eq.${article.id}`,
              {
                headers: {
                  'apikey': API_KEY,
                  'Authorization': `Bearer ${API_KEY}`,
                },
              }
            );
            const [post] = await fetchRes.json();

            // Basic validation checks
            const issues: string[] = [];
            if (!post.featured_image) issues.push('no image');
            if (!post.excerpt || post.excerpt.length < 50) issues.push('short excerpt');
            const contentLength = (post.content || '').replace(/<[^>]*>/g, '').trim().length;
            if (contentLength < 300) issues.push('short content');

            if (issues.length > 0) {
              console.error(`[CRON] Validation failed for ${article.slug}:`, issues.join(', '));
              publishErrors.push({ id: article.id, error: 'Validation failed: ' + issues.join(', ') });
              return null; // Invalid article
            }
            return article; // Valid article
          } catch (e: any) {
            console.error(`[CRON] Validation error for ${article.slug}:`, e.message);
            return null; // On error, fail safe (don't publish)
          }
        })
      );

      validArticles = validationResults.filter(Boolean);
    }

    // Publish each valid article concurrently
    let published = 0;

    await Promise.all(
      validArticles.map(async (article: any) => {
        try {
          const updateRes = await fetch(
            `${API_URL}/rest/v1/cms_blog_posts?id=eq.${article.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
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
            console.log(`[CRON] Successfully published: ${article.slug}`);

            // Notify via webhook (optional: n8n, Slack, etc.)
            if (process.env.CMS_WEBHOOK_URL) {
              fetch(process.env.CMS_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'article.published',
                  article: { id: article.id, title: article.title, slug: article.slug }
                })
              }).catch(() => {/* ignore webhook errors */});
            }
          } else {
            const err = await updateRes.text();
            console.error(`[CRON] Failed to publish ${article.slug}:`, err);
            publishErrors.push({ id: article.id, error: err });
          }
        } catch (e: any) {
          console.error(`[CRON] Exception publishing ${article.slug}:`, e.message);
          publishErrors.push({ id: article.id, error: e.message });
        }
      })
    );

    return NextResponse.json({ 
      message: `Published ${published}/${articles.length} article(s)`, 
      published,
      errors: publishErrors.length > 0 ? publishErrors : undefined
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