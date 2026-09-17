import { NextRequest, NextResponse } from 'next/server'
import { HELDONICA_SYSTEM_PROMPT, checkBrandVoice } from '@/lib/brand-voice'
import { requireCmsAuth } from '@/lib/cms-auth'

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

// Le générateur n'injecte plus de « données vérifiées » génériques (Eiffel,
// Louvre, croissant…) : un article Heldonica ne contient que ce que le duo a
// vécu, et c'est dans les notes qu'il le trouve.
const NOTES_MIN = 200

/**
 * Generate blog content using Groq API (same as carousel)
 */
export async function POST(req: NextRequest) {
// Sans verification, l'appel a l'API Groq se faisait avec la cle du site pour
// qui le demandait : un POST anonyme suffisait a consommer le quota. La route
// sert au panneau, dont la session suffit.
  const refus = await requireCmsAuth(req as unknown as Request)
  if (refus) return refus

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

    // Le générateur met en forme du vécu, il n'en fabrique pas. Sans notes,
    // le modèle « ouvrait avec une anecdote réelle vécue sur place » qu'il
    // inventait : c'est ainsi que les brouillons 119 et 120 sont nés
    // (en-têtes de prompt, prix et sensations sortis de nulle part).
    if ((notes || '').trim().length < NOTES_MIN) {
      return NextResponse.json(
        {
          success: false,
          error: `Raconte d'abord ce que tu as vécu (au moins ${NOTES_MIN} caractères : ce que tu as vu, mangé, ce qui a raté, ce qu'on a moins aimé). Sans ça, l'assistant inventerait.`,
        },
        { status: 400 }
      )
    }

    // Build prompt
    const prompt = buildBlogPrompt(topic, destination, notes, seoKeywords, style, length)

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

  let prompt = `Mets en forme, en article de blog Heldonica ${destination ? `sur ${destination}` : ''}, le vécu ci-dessous. Sujet : "${topic}".

LA RÈGLE QUI PRIME SUR TOUT : tu n'ajoutes RIEN qui ne soit dans les notes.
- Aucun fait, chiffre, prix, horaire, distance, durée, date, nom de lieu, d'adresse ou de plat absent des notes.
- Aucune sensation (odeur, goût, son, texture) que les notes ne décrivent pas.
- Là où la structure appellerait un détail que les notes ne donnent pas, tu écris exactement : [À TOI : ce qui manque] — et rien d'autre.
- Les titres de sections décrivent le contenu (« Le marché à 7 h »), jamais la consigne (« Accroche vécue », « Détail sensoriel »).

STRUCTURE :
1. Ouvre sur le moment le plus concret des notes (2-3 phrases)
2. Le vécu d'abord : ce qu'on a ressenti, découvert, compris — d'après les notes
3. L'info pratique ensuite : uniquement celle des notes, sinon [À TOI]
4. « Ce qu'on a moins aimé » : d'après les notes, sinon [À TOI]

LES NOTES (la seule source autorisée) :
---
${notes}
---

`
  if (seoKeywords) prompt += `Inclure naturellement ces mots-clés (sans les forcer, sans inventer un fait pour les placer) : ${seoKeywords}\n\n`
  prompt += `Style éditorial : ${styleInstructions[style] || styleInstructions.story}\n`
  if (toneAdjust[style]) prompt += `${toneAdjust[style]}\n`
  prompt += `Longueur cible : ${lengthMap[length as keyof typeof lengthMap] || lengthMap.medium}.\n`
  prompt += `\nRappel : JAMAIS "bons plans", "incontournable", "tips", "astuces", "inoubliable". Toujours "on", "nous deux", jamais "je".`

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