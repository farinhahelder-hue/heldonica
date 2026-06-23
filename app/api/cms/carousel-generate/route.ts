import { NextRequest, NextResponse } from 'next/server'
import { HELDONICA_TOKENS } from '@/app/panel-manager/carousel/tokens'

interface SlideData {
  id: string
  title: string
  content: string
  cta?: string
  backgroundColor?: string
  textColor?: string
  fontSize?: 'sm' | 'md' | 'lg'
}

interface GenerateRequest {
  prompt: string
  slideCount?: number
  brand?: string
  style?: string
  destination?: string
  brandConfig?: {
    colors?: { primary: string; secondary: string; accent: string; background: string; text: string }
    keywords?: string[]
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Extract destination from prompt
function extractDestination(prompt: string): string {
  const destinations = [
    'Portugal', 'Madère', 'Espagne', 'France', 'Italie', 'Grèce',
    'Roumanie', 'Croatie', 'Maroc', 'Japon', 'Portugal',
    'Provence', 'Bretagne', 'Alsace', 'Côte d\'Azur',
  ]
  for (const dest of destinations) {
    if (prompt.toLowerCase().includes(dest.toLowerCase())) {
      return dest
    }
  }
  return 'cette destination'
}

// Parse slide count from prompt
function parseSlideCount(prompt: string, defaultCount: number = 5): number {
  const match = prompt.match(/(\d+)\s*slides?/i)
  return match ? parseInt(match[1]) : defaultCount
}

// Generate slide content based on topic
function generateSlideContent(index: number, total: number, topic: string): { title: string; content: string } {
  const templates = [
    { title: `Tip #${index + 1}`, content: `Découvrez ${topic} avec Heldonica. Une expérience unique pour les voyageurs en quête d’authenticité.` },
      { title: `Astuce ${index + 1}`, content: `${topic} vous attend. Un moment suspendu, loin du tourisme de masse.` },
    { title: `Secret #${index + 1}`, content: `Ce que peu de gens savent sur ${topic}. Un voyage commence ici.` },
    { title: `Éxo #${index + 1}`, content: `L’art de ${topic}. Slow travel, éco-luxe, moments précieux.` },
    { title: `Découverte ${index + 1}`, content: `${topic} n’a plus de secrets pour vous. Partez avec Heldonica.` },
  ]
  return templates[index % templates.length]
}

// Mock generation (when no OpenAI key)
function generateMockSlides(request: GenerateRequest): SlideData[] {
  const { prompt } = request
  const slideCount = Math.min(parseSlideCount(prompt, 5), 10)
  const destination = extractDestination(prompt)
  const topic = prompt.replace(/\d+\s*slides?/gi, '').replace(/carrousel|carousel/g, '').trim()
  
  const tokens = HELDONICA_TOKENS
  const slides: SlideData[] = []
  
  const colorSchemes = [
    { bg: tokens.colors.background, text: tokens.colors.text },
    { bg: tokens.colors.primary, text: '#ffffff' },
    { bg: tokens.colors.secondary, text: tokens.colors.text },
    { bg: tokens.colors.accent, text: '#ffffff' },
    { bg: tokens.colors.backgroundAlt, text: tokens.colors.primary },
  ]
  
  for (let i = 0; i < slideCount; i++) {
    const colors = colorSchemes[i % colorSchemes.length]
    const { title, content } = generateSlideContent(i, slideCount, topic || destination)
    
    slides.push({
      id: generateId(),
      title,
      content,
      cta: i === slideCount - 1 ? 'Découvrir' : undefined,
      backgroundColor: colors.bg,
      textColor: colors.text,
      fontSize: 'md',
    })
  }
  
  return slides
}

// Generate via OpenAI
async function generateWithOpenAI(request: GenerateRequest): Promise<SlideData[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return generateMockSlides(request)
  }

  const slideCount = Math.min(request.slideCount || parseSlideCount(request.prompt, 5), 10)
  const destination = extractDestination(request.prompt)
  
  const systemPrompt = `Tu es le générateur de contenu Instagram pour Heldonica, une marque de slow travel en couple. 
Ton style : narratif, sensoriel, chaleureux. Utilise le tutoiement.
Génère ${slideCount} slides avec ce format JSON:
{
  "slides": [{
    "title": "max 8 mots",
    "content": "max 30 mots",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "layout": "title-only|title-body|quote"
  }]
}`

  const userPrompt = `${request.prompt}
Destination: ${destination}
Nombre de slides: ${slideCount}
Style Heldonica: slow travel, éco-luxe, authenticité`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      console.error('OpenAI error:', response.status)
      return generateMockSlides(request)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (content) {
      const parsed = JSON.parse(content)
      const generatedSlides = parsed.slides || []
      
      const tokens = HELDONICA_TOKENS
      return generatedSlides.map((s: any, i: number) => ({
        id: generateId(),
        title: s.title || `Slide ${i + 1}`,
        content: s.content || '',
        backgroundColor: s.backgroundColor || tokens.colors.background,
        textColor: s.textColor || tokens.colors.text,
        fontSize: 'md',
        cta: i === generatedSlides.length - 1 ? 'Découvrir' : undefined,
      }))
    }
  } catch (error) {
    console.error('OpenAI generation error:', error)
  }
  
  return generateMockSlides(request)
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, slideCount, brand, style, destination, brandConfig } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })
    }

    // Generate slides (OpenAI if available, mock otherwise)
    const slides = await generateWithOpenAI({ prompt, slideCount, brand, style, destination, brandConfig })

    return NextResponse.json({
      success: true,
      slides,
      meta: {
        brand: brand || 'heldonica',
        slideCount: slides.length,
        style: HELDONICA_TOKENS.style,
        prompt: prompt,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
      }
    })
  } catch (error) {
    console.error('Carousel generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
