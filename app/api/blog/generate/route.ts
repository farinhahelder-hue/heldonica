import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

interface BlogGenerationRequest {
  topic: string
  style?: 'story' | 'guide' | 'list' | 'review'
  length?: 'short' | 'medium' | 'long'
}

// Verified data to prevent AI hallucinations
const VERIFIED_DESTINATIONS: Record<string, any> = {
  'madeire': {
    places: ['Funchal', 'Monte Palace', 'Cabo Girão', 'Porto Moniz', 'Santana', 'Pico do Arieiro', 'Ribeiro Frio'],
    food: ['Espada', 'Espetada', 'Lapas', 'Bolo de Mel', 'Queijada', 'Poncha'],
    tips: ['Privilégier avril-juin pour la météo', 'Location de voiture recommandée', 'Randonnée au Pico do Arieiro']
  },
  'maderia': {
    places: ['Funchal', 'Monte Palace', 'Cabo Girão', 'Porto Moniz', 'Santana'],
    food: ['Espada', 'Espetada', 'Lapas', 'Bolo de Mel'],
    tips: ['Climat subtropical', 'Randonnées spectaculaires']
  },
  'zurich': {
    places: ['Lake Zurich', 'Old Town', 'Bahnhofstrasse', 'Uetliberg', 'Kunsthaus'],
    food: ['Fondue', 'Rösti', 'Tièchler'],
    tips: ['Carte journalière CFF', 'mont Uetliberg panorama']
  },
  'paris': {
    places: ['Eiffel', 'Louvre', 'Notre-Dame', 'Montmartre', 'Champs-Élysées', 'Musée d\'Orsay'],
    food: ['Croissant', 'Baguette', 'Crème brûlée', 'Coq au vin', 'Macaron'],
    tips: ['Paris Museum Pass', 'Walk along Seine']
  }
}

function getVerifiedInfo(topic: string): string {
  const t = topic.toLowerCase()
  for (const [key, val] of Object.entries(VERIFIED_DESTINATIONS)) {
    if (t.includes(key)) {
      return `Données vérifiées: ${val.places.slice(0, 5).join(', ')}. Vraies spécialités: ${val.food.slice(0, 4).join(', ')}. Conseils: ${val.tips.slice(0, 3).join(', ')}.`
    }
  }
  return 'Utilise uniquement des lieux et spécialités réels et vérifiés, jamais inventés.'
}

/**
 * Generate blog content using Groq API (same as carousel)
 */
export async function POST(req: NextRequest) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
  
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'GROQ_API_KEY non configurée' },
      { status: 500 }
    )
  }

  try {
    const body: BlogGenerationRequest = await req.json()
    const { topic, style = 'story', length = 'medium' } = body

    if (!topic?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Topic requis' },
        { status: 400 }
      )
    }

    // Build prompt
    const prompt = buildBlogPrompt(topic, style, length)
    const verifiedInfo = getVerifiedInfo(topic)

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Tu es un rédacteur de voyage expert francophone. Tu génères du contenu blog de haute qualité, authentique et personnel. ${verifiedInfo}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: getMaxTokens(length),
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur API' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse the response
    const parsed = parseBlogResponse(content, length)

    return NextResponse.json({
      success: true,
      ...parsed,
    })

  } catch (error) {
    console.error('Blog generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de génération' },
      { status: 500 }
    )
  }
}

function buildBlogPrompt(topic: string, style: string, length: string): string {
  const lengthMap = {
    short: '200-300 mots',
    medium: '400-600 mots',
    long: '800-1000 mots'
  }

  const styleInstructions = {
    story: 'Raconte une histoire personnelle de voyage. Utilise la première personne. Sois narratif et évocateur.',
    guide: 'Crée un guide pratique avec sections claires. Sois informatif et actionnable.',
    list: 'Crée une liste de conseils. Numérote chaque point. Sois concis.',
    review: 'Rédige un retour d\'expérience authentique. Sois honnête et equilibre.'
  }

  return `
Génère un article de blog de voyage en français.

**Sujet:** ${topic}
**Style:** ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.story}
**Longueur:** ${lengthMap[length as keyof typeof lengthMap] || lengthMap.medium}

**Format obligatoire:**
# Titre accrocheur (H1)

Excerpt court (1-2 phrases, max 200 cararctères)

## Introduction engageante

[Corps de l'article avec ### Sous-titres si pertinent]

## Conclusion

#hashtags

Réponds uniquement avec le contenu formaté, sans préambule.
`
}

function getMaxTokens(length: string): number {
  return length === 'long' ? 2000 : length === 'short' ? 500 : 1000
}

function parseBlogResponse(content: string, length: string) {
  // Extract title
  const titleMatch = content.match(/^#?\s*(.+)$/m)
  const title = titleMatch?.[1]?.trim() || 'Mon voyage à...'

  // Extract excerpt
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('##'))
  
  const excerpt = lines[1]?.slice(0, 200) || lines[0]?.slice(0, 200) || ''

  // Clean content
  const cleanContent = content
    .replace(/^#\s*.+$/gm, '')
    .replace(/^##\s*.+$/gm, '### $&')
    .trim()

  return {
    title,
    excerpt: excerpt.slice(0, 200),
    content: cleanContent,
    hashtags: extractHashtags(content),
    suggestedSlug: title.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  }
}

function extractHashtags(content: string): string[] {
  const hashtags = content.match(/#[\wàâäéèêëïîôùûüç-]+/gi) || []
  return [...new Set(hashtags.map(h => h.toLowerCase()))].slice(0, 12)
}