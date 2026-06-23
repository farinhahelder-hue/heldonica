import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HELDONICA_SYSTEM = `Tu es le rédacteur expert d’Heldonica, blog slow travel en couple.
Ton style : narratif, sensoriel, tutoiement ("tu"), lexique : "pépites dénichées", "joyaux cachés", "plénitude", "déconnexion", "vrai goût".
Archétypes : Le Sage (expert, rigoureux) + L’Explorateur (libre, authentique).
Concept central : "L’Expert de l’Aventure".
Format de sortie STRICTEMENT JSON, sans markdown autour.`;

async function generateWithGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY manquante');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${HELDONICA_SYSTEM}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function generateWithClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY manquante');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: HELDONICA_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function generateWithPerplexity(prompt: string): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error('PERPLEXITY_API_KEY manquante');
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { role: 'system', content: HELDONICA_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function buildPrompt(topic: string, keywords: string, type: string): string {
  const types: Record<string, string> = {
    article: 'article de blog long (1200-1800 mots)',
    instagram: 'post Instagram (80-120 mots, emojis, 5 hashtags)',
    linkedin: 'post LinkedIn professionnel (150-200 mots, ton expert B2B)',
    seo: 'article optimisé SEO avec H2/H3, liste de tips, données chiffrées',
  };
  const format = types[type] || types.article;
  return `Génère un ${format} pour Heldonica sur le thème : "${topic}".
${keywords ? `Mots-clés à intégrer naturellement : ${keywords}.` : ''}
Réponds UNIQUEMENT avec un JSON valide de ce format :
{
  "title": "Titre accrocheur (60 car max)",
  "slug": "slug-url-friendly",
  "excerpt": "Résumé 150 car max",
  "content": "Contenu complet en HTML propre (pas de balise html/body, juste le body interne)",
  "tags": ["tag1", "tag2", "tag3"],
  "metaDescription": "Description SEO 155 car max"
}`;
}

function extractJson(raw: string): Record<string, unknown> {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: try to extract JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Impossible de parser la réponse JSON du modèle');
  }
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  let body: { topic?: string; keywords?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { topic = 'slow travel en couple', keywords = '', type = 'article' } = body;
  const prompt = buildPrompt(topic, keywords, type);

  const providers = [
    { name: 'Gemini', fn: generateWithGemini },
    { name: 'Claude', fn: generateWithClaude },
    { name: 'Perplexity', fn: generateWithPerplexity },
  ];

  const errors: string[] = [];

  for (const { name, fn } of providers) {
    try {
      const raw = await fn(prompt);
      const parsed = extractJson(raw);
      return NextResponse.json({ success: true, provider: name, ...parsed });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${name}: ${msg}`);
      // If it’s just a missing key, skip without logging network error
      if (msg.includes('manquante')) continue;
      console.error(`[ai-blog] ${name} error:`, msg);
    }
  }

  return NextResponse.json(
    {
      error: 'Aucun fournisseur IA disponible',
      details: errors,
      hint: 'Vérifier GEMINI_API_KEY, ANTHROPIC_API_KEY ou PERPLEXITY_API_KEY dans Vercel → Settings → Environment Variables',
    },
    { status: 503 }
  );
}

// GET: status check — which providers are configured
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  return NextResponse.json({
    providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      claude: Boolean(process.env.ANTHROPIC_API_KEY),
      perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
    },
  });
}
