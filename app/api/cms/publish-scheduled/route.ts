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
      `${SUPABASE_URL}/rest/v1/articles?scheduled_published_at=lte.${now}&published=eq.false&select=id,title,slug,scheduled_published_at`,
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

    // Publish each article (only those that passed validation)
    let published = 0;
    const publishErrors: { id: any; error: string }[] = [];
    const validArticles: any[] = [];

    // Validate BEFORE publishing - skip if validation fails
    let skipValidation = false;
    
    // We use the outer SUPABASE_URL and SUPABASE_KEY variables
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('[CRON] Missing Supabase config - skipping validation');
      skipValidation = true;
      validArticles.push(...articles); // Publish all without validation if config missing
    } else {
      try {
        // ⚡ Bolt: Eliminate N+1 queries. Fetch all articles to validate in a single batch request
        const articleIds = articles.map((a: any) => a.id).join(',');

        if (articleIds) {
          const fetchResBatch = await fetch(
            `${SUPABASE_URL}/rest/v1/articles?id=in.(${articleIds})`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
              },
            }
          );
          
          if (!fetchResBatch.ok) {
            throw new Error(`Batch validation fetch failed with status ${fetchResBatch.status}`);
          }
          
          const postsBatch = await fetchResBatch.json();
          const postsMap = new Map(postsBatch.map((p: any) => [p.id, p]));

          for (const article of articles) {
            try {
              const post: any = postsMap.get(article.id);
              if (!post) {
                console.error(`[CRON] Could not find full post for validation: ${article.slug}`);
                publishErrors.push({ id: article.id, error: 'Validation failed: Post not found' });
                continue;
              }

              // Basic validation checks
              const issues: string[] = [];
              if (!post.featured_image) issues.push('no image');
              if (!post.excerpt || post.excerpt.length < 50) issues.push('short excerpt');
              const contentLength = (post.content || '').replace(/<[^>]*>/g, '').trim().length;
              if (contentLength < 300) issues.push('short content');

              if (issues.length > 0) {
                console.error(`[CRON] Validation failed for ${article.slug}:`, issues.join(', '));
                publishErrors.push({ id: article.id, error: 'Validation failed: ' + issues.join(', ') });
                continue; // Skip publishing this article
              }

              validArticles.push(article);
            } catch (e: any) {
              console.error(`[CRON] Validation error for ${article.slug}:`, e.message);
              publishErrors.push({ id: article.id, error: `Validation error: ${e.message}` });
            }
          }
        }
      } catch (err: any) {
         console.error('[CRON] Batch validation error:', err.message);
         // Fallback if batch fetch completely fails: allow publish loop
         if (validArticles.length === 0) {
            validArticles.push(...articles);
         }
      }
    }

    // ⚡ Bolt: Eliminate N+1 queries. Update all valid articles concurrently
    const updatePromises = validArticles.map(async (article) => {
      try {
        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/articles?id=eq.${article.id}`,
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
    });

    await Promise.all(updatePromises);

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