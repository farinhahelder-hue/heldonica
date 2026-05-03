import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321")!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fake_key")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface SearchRequest {
  query: string;
  type?: 'articles' | 'demandes' | 'all';
  limit?: number;
}

interface SearchableItem {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  slug?: string;
  type: string;
  score?: number;
}

async function semanticSearch(query: string, type: string = 'all', limit: number = 10): Promise<SearchableItem[]> {
  const results: SearchableItem[] = [];

  // Search articles
  if (type === 'articles' || type === 'all') {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, content, slug')
      .eq('published', true)
      .limit(20);

    if (!error && articles) {
      for (const article of articles) {
        const text = `${article.title} ${article.excerpt} ${article.content || ''}`.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Simple keyword scoring
        const queryWords = queryLower.split(/\s+/);
        let score = 0;
        for (const word of queryWords) {
          if (article.title?.toLowerCase().includes(word)) score += 10;
          if (article.excerpt?.toLowerCase().includes(word)) score += 5;
          if (article.content?.toLowerCase().includes(word)) score += 1;
        }
        
        if (score > 0) {
          results.push({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            type: 'article',
            score
          });
        }
      }
    }
  }

  // Search travel demands
  if (type === 'demandes' || type === 'all') {
    const { data: demandes, error } = await supabase
      .from('demandes_travel')
      .select('id, nom, email, pays_destination, budget, type_sejour')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && demandes) {
      for (const d of demandes) {
        const text = `${d.nom} ${d.email} ${d.pays_destination} ${d.type_sejour}`.toLowerCase();
        const queryLower = query.toLowerCase();
        
        const queryWords = queryLower.split(/\s+/);
        let score = 0;
        for (const word of queryWords) {
          if (d.nom?.toLowerCase().includes(word)) score += 5;
          if (d.pays_destination?.toLowerCase().includes(word)) score += 10;
          if (d.type_sejour?.toLowerCase().includes(word)) score += 8;
        }

        if (score > 0) {
          results.push({
            id: d.id,
            title: `${d.nom} - ${d.pays_destination}`,
            excerpt: `${d.type_sejour} • ${d.budget}`,
            type: 'demande',
            score
          });
        }
      }
    }
  }

  // Sort by score
  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  return results.slice(0, limit);
}

async function llmEnhanceSearch(query: string, results: SearchableItem[]): Promise<string> {
  if (!OPENAI_API_KEY || results.length === 0) {
    return `Trouvé ${results.length} résultat(s) pour "${query}"`;
  }

  try {
    // Use GPT-4 to generate a summary/response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant de recherche intelligent. L'utilisateur cherche "${query}". 
Voici les résultats trouves: ${JSON.stringify(results.slice(0, 5).map(r => ({ titre: r.title, type: r.type })))}.
Résume en 1-2 phrases ce qui correspond le mieux à la recherche.`
          }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Trouvé ${results.length} résultat(s)`;
  } catch (error) {
    console.error('LLM error:', error);
    return `Trouvé ${results.length} résultat(s) pour "${query}"`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as SearchRequest;
    const { query, type = 'all', limit = 10 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // Perform semantic search
    const results = await semanticSearch(query, type, limit);
    
    // Optionally enhance with LLM
    const summary = await llmEnhanceSearch(query, results);

    return NextResponse.json({
      query,
      summary,
      results,
      count: results.length
    });

  } catch (error: any) {
    console.error('LLM Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}