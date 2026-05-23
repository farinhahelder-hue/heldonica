import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

const INSTAGRAM_SYSTEM_PROMPT = `Tu es le copywriter d'Heldonica, un blog slow travel tenu par un couple d'explorateurs français.

RÈGLES ABSOLUES :
- Toujours écrire en "on" (jamais "je" ou "nous")
- Tutoiement si on s'adresse au lecteur
- Ton : sensoriel, narratif, authentique, jamais corporate
- Commencer par une accroche forte (question, fait surprenant, image sensorielle)
- 3 à 5 phrases maximum de corps de texte
- Terminer par une ligne d'espace puis "📍 [Destination]" si connue
- Ligne vide puis 10 hashtags : mélange niche (#slowtravel #voyageencouple #heldonicafr #conceptionsurmesure) + destination (#[ville] #[pays]) + mood (#exploration #pepitesdenichees #voyageauthentique)
- INTERDITS : "bons plans", "organisation de séjour", "nous", "je", tout vocabulaire corporate
- OBLIGATOIRES dans le lexique : "pépites dénichées", "on", sensations physiques (odeur/son/texture), ancrage géographique précis

FORMAT DE SORTIE :
[Accroche]

[Corps — 3-5 phrases sensorielles]

[Ligne émotionnelle de clôture] ✨ ou 🌿 ou 🏔️ selon le contexte

📍 [Destination]

#hashtag1 #hashtag2 ... #hashtag10`;

const SHORT_FORMAT_PROMPT = `Génère une variante courte (max 3 lignes + hashtags) pour Instagram Stories.
Format : 1-2 phrases courtes + 5-7 hashtags pertinents.
Mêmes règles : ton Heldonica, pas de corporate, lexique sensorielles.`;

// POST /api/cms/instagram-captions - Generate Instagram captions
export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const { topic, destination, ambiance, articleTitle, articleExcerpt, variant } = body;

    // Build user prompt
    let userPrompt = '';

    if (variant === 'short') {
      userPrompt = `Génère une légende courte pour Instagram Stories sur : ${topic || articleTitle || 'voyage'}${destination ? ` à ${destination}` : ''}.`;
    } else if (articleTitle || articleExcerpt) {
      userPrompt = `Génère une légende Instagram complète pour cet article :
${articleTitle ? `Titre : ${articleTitle}` : ''}
${articleExcerpt ? `Résumé : ${articleExcerpt}` : ''}
${destination ? `Destination : ${destination}` : ''}
${ambiance ? `Ambiance : ${ambiance}` : ''}`;
    } else {
      userPrompt = `Génère une légende Instagram complète :
Sujet : ${topic || 'voyage'}
${destination ? `Destination : ${destination}` : ''}
${ambiance ? `Ambiance : ${ambiance}` : ''}`;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback response
      const fallbackCaption = generateFallbackCaption(topic, destination, ambiance);
      return NextResponse.json({ 
        caption: fallbackCaption,
        source: 'fallback'
      });
    }

    const systemPrompt = variant === 'short' ? SHORT_FORMAT_PROMPT : INSTAGRAM_SYSTEM_PROMPT;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const caption = data.choices?.[0]?.message?.content?.trim();

    if (!caption) {
      return NextResponse.json({ error: 'Erreur génération IA' }, { status: 500 });
    }

    return NextResponse.json({ 
      caption,
      source: 'openai'
    });
  } catch (e) {
    console.error('Instagram caption generation error:', e);
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 });
  }
}

function generateFallbackCaption(topic: string, destination: string, ambiance: string): string {
  const dest = destination || 'destination mystère';
  
  return `Il y a des lieux qu'on n'oublie jamais.

Ce qu'on a trouvé là-bas, entre ${ambiance?.toLowerCase() || 'découvertes'}, c'est exactement ce qu'on cherchait sans le savoir.

Des ${ambiance?.toLowerCase() || 'instants'} comme on les aime. ✨

📍 ${dest}

#slowtravel #voyageencouple #heldonicafr #conceptionsurmesure #${dest.toLowerCase().replace(/\s+/g, '')} #exploration #pepitesdenichees #voyageauthentique #slowtourisme`;
}