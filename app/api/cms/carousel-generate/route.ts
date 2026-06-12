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

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function parseSlidesFromText(text: string): SlideData[] {
  const lines = text.split('\n').filter(l => l.trim())
  const slides: SlideData[] = []
  let currentTitle = ''
  let currentContent = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check if line looks like a title
    if (/^\d+[\.\)\-:]/.test(trimmed) || trimmed.length < 60) {
      if (currentTitle) {
        slides.push({
          id: generateId(),
          title: currentTitle,
          content: currentContent || currentTitle,
          backgroundColor: HELDONICA_TOKENS.colors.background,
          textColor: HELDONICA_TOKENS.colors.text,
        })
      }
      currentTitle = trimmed.replace(/^\d+[\.\)\-:]\s*/, '')
      currentContent = ''
    } else {
      currentContent += (currentContent ? ' ' : '') + trimmed
    }
  }

  if (currentTitle) {
    slides.push({
      id: generateId(),
      title: currentTitle,
      content: currentContent || currentTitle,
      backgroundColor: HELDONICA_TOKENS.colors.background,
      textColor: HELDONICA_TOKENS.colors.text,
    })
  }

  return slides.slice(0, 10) // Max 10 slides
}

// Mock AI generation - in production, this would call an LLM API
async function generateSlidesWithAI(prompt: string): Promise<SlideData[]> {
  const tokens = HELDONICA_TOKENS
  
  // Parse number of slides from prompt
  const slideMatch = prompt.match(/(\d+)\s*slides?/i)
  const slideCount = slideMatch ? parseInt(slideMatch[1]) : 5
  
  // Extract topic from prompt
  const topic = prompt
    .replace(/\d+\s*slides?/gi, '')
    .replace(/carrousel|carousel|génère|générer|create/i, '')
    .trim()

  // Generate mock slides based on topic
  const slides: SlideData[] = []
  const colors = [tokens.colors.primary, tokens.colors.secondary, tokens.colors.accent]
  
  for (let i = 0; i < slideCount; i++) {
    slides.push({
      id: generateId(),
      title: `${['Tip', 'Astuce', 'Secret', 'Éxo', 'Découverte'][i % 5]} #${i + 1} : ${topic.split(' ').slice(0, 3).join(' ')}`,
      content: `Découvrez ${topic} avec Heldonica. Une expérience unique pour les voyageurs en quête d'authenticité.`,
      cta: i === slideCount - 1 ? 'Découvrir' : undefined,
      backgroundColor: tokens.colors.background,
      textColor: tokens.colors.text,
      fontSize: 'md' as const,
    })
  }

  return slides
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, brand, style } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })
    }

    // Generate slides using AI (mock for now)
    const slides = await generateSlidesWithAI(prompt)

    return NextResponse.json({
      success: true,
      slides,
      meta: {
        brand: brand || 'heldonica',
        slideCount: slides.length,
        style: HELDONICA_TOKENS.style,
      }
    })
  } catch (error) {
    console.error('Carousel generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}