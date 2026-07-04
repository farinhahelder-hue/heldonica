import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { HELDONICA_SYSTEM_PROMPT, buildVoiceCorrectPrompt } from '@/lib/brand-voice'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clé API GROQ non configurée' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { text, zone_type } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Texte manquant' },
        { status: 400 }
      )
    }

    const voicePrompt = buildVoiceCorrectPrompt(text)
    
    // Request GROQ to output exactly 2 variants in a JSON structure, without using model json_object mode
    const prompt = `Tu dois corriger le texte fourni ci-dessous pour qu'il respecte le style Heldonica.
Renvoie obligatoirement deux variantes du texte.
Retourne UNIQUEMENT un objet JSON brut avec la structure suivante, sans aucun blabla, ni balises markdown (comme \`\`\`json), ni commentaire :
{
  "variant_1": "Première variante...",
  "variant_2": "Deuxième variante..."
}

${voicePrompt}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const errMsg = await res.text()
      console.error('[AI Improve API] Groq error:', errMsg)
      return NextResponse.json({ error: 'Erreur de l\'API d\'IA' }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parsing variants from raw response text
    let variants: [string, string] = ['', '']
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        variants = [
          parsed.variant_1 || parsed.variant_1 === '' ? parsed.variant_1 : '',
          parsed.variant_2 || parsed.variant_2 === '' ? parsed.variant_2 : ''
        ]
      } else {
        // Fallback if no JSON structure was found: split by variant marker
        console.warn('[AI Improve API] JSON match not found. Content:', content)
        variants = [content, content]
      }
    } catch (parseErr) {
      console.error('[AI Improve API] Failed to parse JSON variants. Raw content:', content, parseErr)
      variants = [content, content]
    }

    // Clean up empty lines or quotes
    const cleanVariants = variants.map(v => v.replace(/^"|"$/g, '').trim())

    return NextResponse.json({ success: true, variants: cleanVariants })
  } catch (err) {
    console.error('[AI Improve API] Error:', err)
    return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
  }
}
