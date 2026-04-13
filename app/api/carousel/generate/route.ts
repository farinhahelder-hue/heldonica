import { NextRequest, NextResponse } from 'next/server';

// Verified local attractions to prevent AI hallucinations
const VERIFIED_GUIDE: Record<string, any> = {
  'funchal': {
    places: ['Monte Palace Tropical Garden', 'Mercado dos Lavradores', 'Rua Santa Maria', 'Funchal Old Town', 'Cathedral of Funchal', 'Museu CR7', 'Praça do Município'],
    food: ['Espada (poisson sabre)', 'Espetada (brochettes bœuf)', 'Lapas grillées', 'Bolo de Mel', 'Queijada da Madeira', 'Poncha', 'Vinho Madeira'],
    avoid: ['Madeleine', 'Bolo de Alferes', 'Calulu', 'Casa de Pasto', 'Cevada', 'Gato']
  },
  'madeira': {
    places: ['Monte Palace Garden', 'Cabo Girão', 'Porto Moniz', 'Santana', 'Pico do Arieiro', 'Monte toboggan'],
    food: ['Espada com banana', 'Espetada madeirense', 'Lapas grelhées', 'Bolo de Mel', 'Queijadas da Madeira', 'Poncha', 'Vinho Madeira'],
    avoid: ['Madeleine', 'Bolo de Alferes', 'Calulu', 'Casa de Pasto', 'Cevada', 'Gato', 'Vila Franca']
  },
  'lisbonne': {
    places: ['Torre de Belém', 'Monastère des Hiéronymites', 'Alfama', 'Bairro Alto', 'Praça do Comércio', 'Castelo de São Jorge'],
    food: ['Bacalhau', 'Pasteis de Nata', 'Ginjinha', 'Caldo Verde', 'Bifana'],
    avoid: []
  },
  'paris': {
    places: ['Tour Eiffel', 'Louvre', 'Notre-Dame', 'Montmartre', 'Champs-Élysées'],
    food: ['Croissant', 'Baguette', 'Crème brûlée', 'Coq au vin', 'Soufflé'],
    avoid: []
  }
};

function getGuideForTopic(topic: string): string {
  const t = topic.toLowerCase();
  for (const [key, val] of Object.entries(VERIFIED_GUIDE)) {
    if (t.includes(key)) {
      const avoidStr = val.avoid?.length > 0 ? ` ${val.avoid.join(', ')} sont FAUX. NE PAS UTILISER.` : '';
      return `Lieux vérifiés: ${val.places.join(', ')}. Vraies spécialités: ${val.food.join(', ')}.${avoidStr}`;
    }
  }
  return 'Utilise uniquement des lieux et spécialités réels et vérifiés. Ne pas inventer de plats ou restaurants.';
}

export async function POST(request: NextRequest) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';
  
  if (!GROQ_API_KEY || !UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ 
      error: !UNSPLASH_ACCESS_KEY ? 'Unsplash API key missing - configure NEXT_PUBLIC_UNSPLASH_ACCESS_KEY in Vercel' : 'Groq API key missing',
      unsplash_configured: !!UNSPLASH_ACCESS_KEY,
      gpt_configured: !!GROQ_API_KEY
    }, { status: 500 });
  }

  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    }

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Tu es un expert JSON. Réponds STRICTEMENT en JSON valide sans texte avant ou après. Utilise ce format: {"title":"string","slides":[{"title":"string","content":"string"}],"caption":"string","hashtags":["string"]}' },
          { role: 'user', content: `Génère carrousel 5 slides sur: ${topic}. 
JSON ONLY.
${getGuideForTopic(topic)}` }
        ]
      })
    });

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content || '';
    
    let content: {
      title?: string
      slides?: unknown[]
      caption?: string
      hashtags?: string[]
    } = {};
    try {
      // Try direct parse first
      content = JSON.parse(rawContent) as typeof content;
    } catch {
      // Try to extract JSON from text
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          content = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'AI response not valid JSON', raw: rawContent.substring(0, 200) }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'AI response not JSON', raw: rawContent.substring(0, 200) }, { status: 500 });
      }
    }

    let images: string[] = [];
    let image = '';
    
    // Only search Unsplash if we have the key
    if (UNSPLASH_ACCESS_KEY) {
      try {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=5&orientation=portrait`,
          { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        const unsplashData = await unsplashResponse.json();
        images = unsplashData.results?.map((r: any) => r.urls?.regular) || [];
        image = images[0] || '';
      } catch (e) {
        console.error('Unsplash error:', e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      topic,
      title: content.title || topic,
      slides: content.slides || [],
      caption: content.caption || '',
      hashtags: content.hashtags || [],
      images,
      image
    });

  } catch (error) {
    console.error('Carousel API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}