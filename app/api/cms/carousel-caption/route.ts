import { NextRequest, NextResponse } from 'next/server'

interface CaptionRequest {
  topic: string
  destination?: string
  slides?: Array<{ title: string; content: string }>
  style?: 'informative' | 'romantic' | 'adventure' | 'minimal'
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
    informative: `Envie d'explorer ${destination || 'cette destination'} en profondeur ?

Découvrez ${topic} à travers notre dernier carrousel ✨

Vous y trouverez nos meilleurs conseils, nos découvertes secrètes et nos coups de cœur travel.

Swipez pour tout savoir 👉

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
    romantic: `Pour les voyageurs en quête d'amour et d'authenticité ❤️

${topic} n'a plus de secrets pour nous. Et maintenant, c'est à votre tour de découvrir ces endroits magiques.

Parce que les plus beaux voyages se partagent 💑

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
    adventure: `L'aventure commence ici 🌍✨

Préparez-vous à découvrir ${topic} comme vous ne l'avez jamais imaginé.

Des paysages à couper le souffle, des rencontres inoubliables, des moments suspendus.

Prêt à sauter le pas ? 👇

${destination ? `📍 ${destination}\n` : ''}📸 @heldonica
🔗 Lien en bio`,
    minimal: `${topic} ✨

📍 ${destination || 'Europe'}
📸 @heldonica`,
  }

  return templates[style as keyof typeof templates] || templates.informative
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
  } else if (style === 'couple' || style === 'romantic') {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, destination, slides, style } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic requis' }, { status: 400 })
    }

    // Generate caption
    const caption = generateCaption(topic, style || 'informative', destination)
    
    // Generate hashtags
    const hashtags = generateHashtags(topic, destination, style)

    // Extract topic keywords for additional hashtags
    const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 3)
    const topicHashtags = topicWords.map(w => `#${w.replace(/[^a-z]/gi, '')}`).slice(0, 5)

    return NextResponse.json({
      success: true,
      caption,
      hashtags: [...hashtags, ...topicHashtags],
      stats: {
        captionLength: caption.length,
        hashtagCount: hashtags.length + topicHashtags.length,
      }
    })
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}