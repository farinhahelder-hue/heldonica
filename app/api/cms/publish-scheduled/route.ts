import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Find articles that should be published (scheduled_published_at <= now but not yet published)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cms_blog_posts?scheduled_published_at=lt.${new Date().toISOString()}&published=eq.false&select=id,title,slug,scheduled_published_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const articles = await res.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ message: 'No scheduled articles to publish', published: 0 });
    }

    // Publish each article
    let published = 0;
    for (const article of articles) {
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
            published_at: new Date().toISOString(),
            scheduled_published_at: null,
          }),
        }
      );

      if (updateRes.ok) published++;
    }

    return NextResponse.json({ message: `Published ${published} article(s)`, published });

  } catch (error) {
    console.error('Publish scheduled error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}