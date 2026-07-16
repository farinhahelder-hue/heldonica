import { NextRequest, NextResponse } from 'next/server'

// Mapping des sources vers les tags et listes Brevo
const SOURCE_CONFIG: Record<string, { tags: string[], listId: number, attributes?: Record<string, string> }> = {
  'footer': { tags: ['prospect_b2c', 'newsletter'], listId: 2 },
  'popup': { tags: ['prospect_b2c', 'popup'], listId: 2 },
  'blog': { tags: ['prospect_b2c', 'blog'], listId: 2 },
  'guides': { tags: ['lead_magnet', 'guides_gratuits'], listId: 2, attributes: { GUIDES_DOWNLOADED: 'top-10-madere' } },
  'lead_magnet': { tags: ['lead_magnet', 'prospect_b2c'], listId: 2 },
  'travel_planning': { tags: ['travel_planning_lead', 'b2c'], listId: 3, attributes: { SOURCE: 'travel_planning_form' } },
  'expert_hotelier': { tags: ['expert_hotelier', 'b2b'], listId: 4, attributes: { SOURCE: 'expert_hotelier_form' } },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'footer', firstName, attributes = {} } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email manquant' },
        { status: 400 }
      )
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const brevoApiKey = process.env.BREVO_API_KEY
    const config = SOURCE_CONFIG[source] || SOURCE_CONFIG['footer']

    // Merge attributes
    const allAttributes = {
      ...config.attributes,
      SOURCE: source,
      ...attributes,
    }
    if (firstName) {
      allAttributes.NOM = firstName
    }

    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY non configurée, inscription simulée')
      return NextResponse.json(
        { success: true, message: 'Inscription réussie (simulation)' },
        { status: 200 }
      )
    }

    try {
      // Création/mise à jour du contact
      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          email: email,
          attributes: allAttributes,
          listIds: [config.listId],
          updateEnabled: true,
        }),
      })

      if (!brevoResponse.ok) {
        const error = await brevoResponse.json()
        console.error('Erreur Brevo contact:', error)
        
        // Contact déjà existant, c’est ok
        if (error.code !== ‘duplicate_parameter’) {
          // Erreur autre que duplicate
          return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500 }
          )
        }
      }

      // Ajout des tags
      if (config.tags.length > 0) {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}/tag`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            tags: config.tags,
          }),
        })
      }

      return NextResponse.json(
        { success: true, message: 'Inscription réussie' },
        { status: 200 }
      )
    } catch (brevoErr) {
      console.error('Brevo sync error:', brevoErr)
      return NextResponse.json(
        { success: true, message: 'Inscription réussie (erreur Brevo ignorée)' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Erreur API subscribe:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Hash simple pour anonymiser l’email dans GA4
function hashEmail(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
