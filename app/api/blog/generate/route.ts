import { NextRequest, NextResponse } from 'next/server'
import { HELDONICA_SYSTEM_PROMPT, checkBrandVoice } from '@/lib/brand-voice'

export const maxDuration = 60

interface BlogGenerationRequest {
  topic: string
  destination?: string
  notes?: string
  seoKeywords?: string
  tone?: 'informatif' | 'intimiste' | 'humoristique' | 'expert'
  language?: 'FR' | 'EN'
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
    const { topic, destination = '', notes = '', seoKeywords = '', tone = 'informatif', language = 'FR', style = 'story', length = 'medium' } = body

    if (!topic?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Topic requis' },
        { status: 400 }
      )
    }

    // Build prompt
    const prompt = buildBlogPrompt(topic, destination, notes, seoKeywords, style, length)
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
            content: `${HELDONICA_SYSTEM_PROMPT}\n\n${language === 'EN' ? 'EXCEPTION: Write in English for this article only, but keep the Heldonica voice.' : 'Écris en français.'}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: getMaxTokens(length),
        temperature: 0.75,
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
    const voiceCheck = checkBrandVoice(content)

    return NextResponse.json({
      success: true,
      ...parsed,
      voiceCheck,
    })

  } catch (error) {
    console.error('Blog generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de génération' },
      { status: 500 }
    )
  }
}

function buildBlogPrompt(topic: string, destination: string, notes: string, seoKeywords: string, style: string, length: string): string {
  const lengthMap = {
    short: '200-300 mots',
    medium: '400-600 mots',
    long: '800-1000 mots'
  }

  const styleInstructions: Record<string, string> = {
    story: 'Récit narratif à la première personne du pluriel ("on"). Commence par une anecdote vécue — une scène concrète, un moment précis. Pas de généralités en ouverture.',
    guide: 'Guide structuré en sections H2/H3. Commence par "on y est allés et voilà ce qu\'on a retenu". Inclure infos pratiques à la fin seulement.',
    list: 'Liste de pépites dénichées (pas de "bons plans" !). Chaque point commence par une micro-anecdote puis l\'info concrète.',
    review: "Retour d’expérience authentique à la première personne du pluriel. Honnête, avec les points moins bons aussi."
  }

  const toneAdjust: Record<string, string> = {
    informatif: '',
    intimiste: 'Ton très personnel, comme si on écrivait dans notre carnet de voyage. Phrases courtes. Beaucoup de "on".',
    humoristique: 'Autoderision légère. On peut se moquer de nos propres erreurs de voyageurs.',
    expert: 'Expertise slow travel visible, mais jamais condescendant. On partage ce qu\'on sait vraiment.'
  }

  let prompt = `Écris un article de blog Heldonica ${destination ? `sur ${destination}` : ''} avec ce sujet : "${topic}".

STRUCTURE OBLIGATOIRE :
1. Ouvre avec une anecdote réelle ou un moment précis vécu sur place (2-3 phrases max)
2. "Le vécu d’abord" : ce qu’on a ressenti, découvert, compris
3. "L’info pratique ensuite" : détails concrets (horaires, prix, comment y aller)
4. Chaque paragraphe : une image sensorielle (ce qu’on a entendu / goûté / senti / vu)

`
  if (notes) prompt += `Intègre obligatoirement cette anecdote/note personnelle : ${notes}\n\n`
  if (seoKeywords) prompt += `Inclure naturellement ces mots-clés (sans les forcer) : ${seoKeywords}\n\n`
  prompt += `Style éditorial : ${styleInstructions[style] || styleInstructions.story}\n`
  if (toneAdjust[style]) prompt += `${toneAdjust[style]}\n`
  prompt += `Longueur cible : ${lengthMap[length as keyof typeof lengthMap] || lengthMap.medium}.\n`
  prompt += `\nRappel : JAMAIS "bons plans", "incontournable", "tips", "astuces", "inoubliable". Toujours "on", "nous deux", jamais "je".`

  if (destination) {
    const verifiedInfo = getVerifiedInfo(topic + ' ' + destination)
    if (verifiedInfo) prompt += `\n\nDonnées factuelles vérifiées à utiliser : ${verifiedInfo}`
  }

  return prompt
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