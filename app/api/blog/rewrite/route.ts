import { NextRequest, NextResponse } from 'next/server';

const HELDONICA_SYSTEM_PROMPT = `Tu es l'assistant de voix de marque Heldonica. Réécris le texte fourni en adaptant le ton au slow travel:

RÈGLES:
- Écris à la première personne du pluriel (nous, notre)
- Sois sensoriel et évocateur
- ÉVITE absolument ces mots: "tips", "incontournables", "best-of", "top 10", "à ne pas manquer", "must-see", "must-do"
- Utilise plutôt: "ce qu'on a vécu", "ce qui nous a marqués", "ce qu'on recommande"
- Garde le formatage (paragraphes, listes à puces)
- Maximum 15% plus long que l'original
- Ne fais pas de liste numérotée pour des raisons autres que chronologiques
`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ 
        rewritten: text,
        notice: 'GROQ_API_KEY not configured, returning original text'
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ rewritten: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Rewrite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
