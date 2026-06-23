import { NextRequest, NextResponse } from 'next/server'

interface CaptionRequest {
  topic: string
  destination?: string
  slides?: Array<{ title: string; content: string }>
  style?: 'narratif' | 'informatif' | 'inspirant'
  defaultHashtags?: string
}

// French hashtags database by category
const HASHTAG_DATABASE = {
  travel: [
    '#slowtravel', '#travelyourway', '#exploremore', '#traveladdict',
    '#travelphotography', '#travelblogger', '#instatravel', '#travelgram',
    '#wanderlust', '#adventuretravel', '#solotravel', '#traveltips',
  ],
  destinations: [
    '#portugal', '#madeira', '#france', '#espagne', '#italie',
    '#grece', '#roumanie', '#voyage', '#destination', '#roadtrip',
  ],
  lifestyle: [
    '#lifestyle', '#lifestyleblogger', '#lifestylephotography',
    '#modedevie', '#lavieestbelle', '#bonheur', '#savoirvivre',
  ],
  eco: [
    '#ecotourism', '#sustainabletravel', '#ecofriendly', '#greenliving',
    '#voyageecoresponsable', '#tourismresponsable', '#respectnature',
  ],
  couple: [
    '#coupletravel', '#travelcouple', '#loveandtravel', '#couplegoals',
    '#romantictravel', '#honeymoon', '#escapade', '#weekendenduo',
  ],
  luxury: [
    '#luxurytravel', '#luxury', '#luxurytravelblogger', '#luxuryhotels',
    '#travelinstyle', '#hautdegamme', '#ecoluxe', '#prestige',
  ],
  brand: [
    '#heldonica', '#heldonicatravel', '#pepite', '#decouvrir',
    '#horssentiersbattus', '#voyageauthentique', '#authenticite',
  ],
}

// Generate caption based on topic and style
function generateCaption(topic: string, style: string, destination?: string): string {
  const templates = {
    narratif: `Envie d'explorer ${destination || 'cette destination'} en profondeur ?

Découvrez ${topic} à travers notre dernier carrousel ✨

Vous y trouverez nos meilleurs conseils, nos découvertes secrètes et nos coups de cœur travel.

Swipez pour tout savoir 👉

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
    informatif: `${topic} : tout ce que vous devez savoir 🗺️

Notre carrousel vous révèle les secrets, les meilleures adresses et les expériences inoubliables.

Conservez ce post pour ne rien manquer 📌

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
    inspirant: `Et si ${destination || 'votre prochain voyage'} était celui-ci ? ✨

${topic}

Chaque image raconte une histoire. Chaque swipe révèle une découverte.

Envolez-vous vers l'authenticité 🕊️

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
  }

  return templates[style as keyof typeof templates] || templates.narratif
}

// Generate hashtags based on topic and context
function generateHashtags(topic: string, destination?: string, style?: string): string[] {
  const hashtags: string[] = []
  
  // Always include brand hashtags
  hashtags.push(...HASHTAG_DATABASE.brand)
  
  // Add travel hashtags
  hashtags.push(...HASHTAG_DATABASE.travel.slice(0, 6))
  
  // Add destination if specified
  if (destination) {
    const destLower = destination.toLowerCase()
    const destHashtag = HASHTAG_DATABASE.destinations.find(h => h.includes(destLower))
    if (destHashtag) {
      hashtags.push(destHashtag)
    } else {
      hashtags.push(`#${destLower}`)
    }
  }
  
  // Add style-specific hashtags
  if (style === 'eco') {
    hashtags.push(...HASHTAG_DATABASE.eco.slice(0, 4))
  } else if (style === 'couple') {
    hashtags.push(...HASHTAG_DATABASE.couple.slice(0, 4))
  } else if (style === 'luxury') {
    hashtags.push(...HASHTAG_DATABASE.luxury.slice(0, 4))
  }
  
  // Add lifestyle hashtags
  hashtags.push(...HASHTAG_DATABASE.lifestyle.slice(0, 3))
  
  // Shuffle and limit to 25-30 hashtags
  const shuffled = hashtags.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(shuffled.length, 28))
}

// Generate via OpenAI
async function generateWithOpenAI(topic: string, slides: any[], style: string, destination?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return generateCaption(topic, style, destination)
  }

  const systemPrompt = `Tu es un expert en rédaction Instagram pour Heldonica, marque de slow travel en couple.
Ton style : narratif, sensoriel, chaleureux. Utilise le tutoiement.
Génère une légende de 150-220 mots avec :
- Accroche forte (première ligne qui donne envie d'ouvrir)
- Corps narratif basé sur le contenu des slides
- CTA naturel ("Sauvegarde ce post 🔖", "Envoie-le à quelqu'un qui en a besoin")
- Emojis intégrés dans le texte (pas en liste)

Style demandé : ${style}
Destination : ${destination || 'non spécifiée'}

Slides :
${slides.map((s, i) => `${i+1}. ${s.title} - ${s.content}`).join('\n')}`

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
          { role: 'user', content: `Génère la légende Instagram pour ce carrousel sur "${topic}"` }
        ],
        max_tokens: 500,
      })
    })

    if (!response.ok) {
      console.error('OpenAI error:', response.status)
      return generateCaption(topic, style, destination)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateCaption(topic, style, destination)
  } catch (error) {
    console.error('OpenAI caption error:', error)
    return generateCaption(topic, style, destination)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, destination, slides, style, defaultHashtags } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic requis' }, { status: 400 })
    }

    // Generate caption (OpenAI if available)
    const caption = await generateWithOpenAI(topic, slides || [], style || 'narratif', destination)
    
    // Generate hashtags
    let hashtags = generateHashtags(topic, destination, style)
    
    // Add default hashtags from brand config
    if (defaultHashtags) {
      const defaultTags = defaultHashtags.split(' ').filter((t: string) => t.startsWith('#'))
      hashtags = [...new Set([...defaultTags, ...hashtags])]
    }

    return NextResponse.json({
      success: true,
      caption,
      hashtags: hashtags.slice(0, 30),
      stats: {
        captionLength: caption.length,
        hashtagCount: hashtags.length,
      }
    })
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}