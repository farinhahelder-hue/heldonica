import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAiAuth, logAiRequest } from '@/lib/ai-auth';
import { generateEmbedding } from '@/lib/ai-embeddings';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface DestinationMatch {
  id: string;
  slug: string;
  title: string;
  country: string;
  region?: string | null;
  excerpt?: string | null;
  intro_narrative?: string | null;
  travel_style?: string | null;
  similarity: number;
}

interface ArticleMatch {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: string[] | null;
  similarity: number;
}

type SearchResultItem = {
  type: 'destination' | 'article';
  id: string | number;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  similarity: number;
  matchScorePercent: number;
  url: string;
};

async function handleSearch(req: NextRequest, queryText: string, typeParam: string, thresholdParam: number, limitParam: number) {
  const debut = Date.now();

  // 1. Authentification stricte
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    return auth.response;
  }

  const query = queryText.trim();
  if (!query) {
    return NextResponse.json(
      { error: 'Paramètre de recherche "q" manquant ou vide' },
      { status: 400 }
    );
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Service Supabase non configuré' },
      { status: 503 }
    );
  }

  const searchType = ['all', 'destinations', 'articles'].includes(typeParam) ? typeParam : 'all';
  const threshold = Math.min(Math.max(thresholdParam, 0.1), 0.99);
  const limit = Math.min(Math.max(limitParam, 1), 30);

  // 2. Génération de l'embedding du prompt de recherche
  const queryEmbedding = await generateEmbedding(query);

  const results: SearchResultItem[] = [];
  let usedMethod: 'pgvector_cosine' | 'fallback_keyword' = 'pgvector_cosine';

  // 3. Tentative de recherche vectorielle via pgvector RPC
  if (queryEmbedding) {
    try {
      if (searchType === 'all' || searchType === 'destinations') {
        const { data: destData, error: eDest } = await sb.rpc('match_destinations', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit,
        });

        if (!eDest && Array.isArray(destData)) {
          for (const d of (destData as DestinationMatch[])) {
            results.push({
              type: 'destination',
              id: d.id,
              slug: d.slug,
              title: d.title,
              subtitle: [d.country, d.region].filter(Boolean).join(' · '),
              excerpt: d.intro_narrative || d.excerpt || '',
              similarity: d.similarity,
              matchScorePercent: Math.round(d.similarity * 100),
              url: `/destinations/${d.slug}`,
            });
          }
        } else if (eDest) {
          // RPC possiblement absente si migration pas encore jouée
          usedMethod = 'fallback_keyword';
        }
      }

      if (searchType === 'all' || searchType === 'articles') {
        const { data: artData, error: eArt } = await sb.rpc('match_articles', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit,
        });

        if (!eArt && Array.isArray(artData)) {
          for (const a of (artData as ArticleMatch[])) {
            results.push({
              type: 'article',
              id: a.id,
              slug: a.slug,
              title: a.title,
              subtitle: a.category || 'Slow Travel',
              excerpt: a.excerpt || '',
              similarity: a.similarity,
              matchScorePercent: Math.round(a.similarity * 100),
              url: `/blog/${a.slug}`,
            });
          }
        } else if (eArt) {
          usedMethod = 'fallback_keyword';
        }
      }
    } catch {
      usedMethod = 'fallback_keyword';
    }
  } else {
    usedMethod = 'fallback_keyword';
  }

  // 4. Fallback intelligent par scoring textuel si pgvector non encore configuré
  if (usedMethod === 'fallback_keyword' || results.length === 0) {
    const motsCles = query.toLowerCase().split(/\s+/).filter((m) => m.length > 2);

    if (searchType === 'all' || searchType === 'destinations') {
      const { data: fallbackDests } = await sb
        .from('destinations')
        .select('id, slug, title, country, region, excerpt, intro_narrative, tags, travel_style')
        .limit(50);

      if (fallbackDests) {
        for (const d of fallbackDests) {
          let score = 0;
          const texte = `${d.title} ${d.country || ''} ${d.region || ''} ${d.excerpt || ''} ${d.intro_narrative || ''} ${(d.tags || []).join(' ')}`.toLowerCase();

          for (const mot of motsCles) {
            if (d.title.toLowerCase().includes(mot)) score += 3;
            else if (d.country?.toLowerCase().includes(mot)) score += 2;
            else if (texte.includes(mot)) score += 1;
          }

          if (score > 0) {
            const normalise = Math.min(0.5 + score * 0.1, 0.95);
            results.push({
              type: 'destination',
              id: d.id,
              slug: d.slug,
              title: d.title,
              subtitle: [d.country, d.region].filter(Boolean).join(' · '),
              excerpt: d.intro_narrative || d.excerpt || '',
              similarity: normalise,
              matchScorePercent: Math.round(normalise * 100),
              url: `/destinations/${d.slug}`,
            });
          }
        }
      }
    }

    if (searchType === 'all' || searchType === 'articles') {
      const { data: fallbackArticles } = await sb
        .from('cms_blog_posts')
        .select('id, slug, title, category, excerpt, tags')
        .eq('published', true)
        .limit(50);

      if (fallbackArticles) {
        for (const a of fallbackArticles) {
          let score = 0;
          const texte = `${a.title} ${a.category || ''} ${a.excerpt || ''} ${(a.tags || []).join(' ')}`.toLowerCase();

          for (const mot of motsCles) {
            if (a.title.toLowerCase().includes(mot)) score += 3;
            else if (texte.includes(mot)) score += 1;
          }

          if (score > 0) {
            const normalise = Math.min(0.5 + score * 0.1, 0.95);
            results.push({
              type: 'article',
              id: a.id,
              slug: a.slug,
              title: a.title,
              subtitle: a.category || 'Slow Travel',
              excerpt: a.excerpt || '',
              similarity: normalise,
              matchScorePercent: Math.round(normalise * 100),
              url: `/blog/${a.slug}`,
            });
          }
        }
      }
    }

    usedMethod = 'fallback_keyword';
  }

  // Tri décroissant par pertinence
  results.sort((a, b) => b.similarity - a.similarity);
  const topResults = results.slice(0, limit);

  const dureeMs = Date.now() - debut;

  // Journalisation dans ai_requests_log
  await logAiRequest({
    apiKeyId: auth.keyId !== 'master' && auth.keyId !== 'cms' ? auth.keyId : undefined,
    agentName: auth.agentName || 'inconnu',
    endpoint: '/api/ai/search',
    model: 'gemini-embedding-001',
    promptPreview: `Search [${searchType}]: ${query.slice(0, 150)}`,
    statusCode: 200,
    durationMs: dureeMs,
  });

  return NextResponse.json({
    success: true,
    query,
    count: topResults.length,
    method: usedMethod,
    results: topResults,
  });
}

export async function GET(req: NextRequest) {
  const urlObj = (req as NextRequest).nextUrl || new URL(req.url);
  const q = urlObj.searchParams.get('q') || '';
  const type = urlObj.searchParams.get('type') || 'all';
  const threshold = parseFloat(urlObj.searchParams.get('threshold') || '0.45');
  const limit = parseInt(urlObj.searchParams.get('limit') || '6', 10);

  return handleSearch(req, q, type, threshold, limit);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const q = body.q || body.query || '';
    const type = body.type || 'all';
    const threshold = parseFloat(body.threshold || '0.45');
    const limit = parseInt(body.limit || '6', 10);

    return handleSearch(req, q, type, threshold, limit);
  } catch {
    return NextResponse.json(
      { error: 'Corps JSON invalide' },
      { status: 400 }
    );
  }
}
