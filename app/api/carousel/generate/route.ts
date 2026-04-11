import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    }

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Expert contenu Instagram. Réponds en JSON uniquement.' },
          { role: 'user', content: `Génère carrousel 5 slides sur: ${topic}. Format: {"title":"...", "slides":[{"title":"Tip 1","content":"..."}], "caption":"...", "hashtags":["#..."]}` }
        ]
      })
    });

    const groqData = await groqResponse.json();
    const content = JSON.parse(groqData.choices?.[0]?.message?.content || '{}');

    // Search Unsplash
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=1&orientation=portrait`,
      { headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    const unsplashData = await unsplashResponse.json();
    const image = unsplashData.results?.[0]?.urls?.regular || '';

    return NextResponse.json({ 
      success: true, 
      topic,
      title: content.title || topic,
      slides: content.slides || [],
      caption: content.caption || '',
      hashtags: content.hashtags || [],
      image
    });

  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}