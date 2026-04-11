import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';
  
  if (!GROQ_API_KEY || !UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ 
      error: 'API keys not configured',
      gpt: !!GROQ_API_KEY,
      unsplash: !!UNSPLASH_ACCESS_KEY
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
          { role: 'user', content: `Génère carrousel 5 slides sur: ${topic}. JSON ONLY.` }
        ]
      })
    });

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content || '';
    
    let content = {};
    try {
      // Try direct parse first
      content = JSON.parse(rawContent);
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

    // Search Unsplash for 5 images
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=5&orientation=portrait`,
      { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const unsplashData = await unsplashResponse.json();
    const images = unsplashData.results?.map((r: any) => r.urls?.regular) || [];

    return NextResponse.json({ 
      success: true, 
      topic,
      title: content.title || topic,
      slides: content.slides || [],
      caption: content.caption || '',
      hashtags: content.hashtags || [],
      images
    });

  } catch (error) {
    console.error('Carousel API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}