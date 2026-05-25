import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email manquant' },
        { status: 400 }
      )
    }

    // Intégration Brevo avec tag prospect_b2c
    const brevoApiKey = process.env.BREVO_API_KEY
    
    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY non configurée')
      return NextResponse.json(
        { success: true, message: 'Email reçu (Brevo non configuré)' },
        { status: 200 }
      )
    }

    try {
      // Création/mise à jour du contact avec attributs
      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          email: email,
          attributes: {
            SOURCE: 'Newsletter_Site',
          },
          listIds: [2], // ID de la liste Brevo — à adapter
          updateEnabled: true,
        }),
      })

      if (!brevoResponse.ok) {
        const error = await brevoResponse.json()
        console.error('Erreur Brevo:', error)
        
        // Si le contact existe déjà, c'est ok
        if (error.code === 'duplicate_parameter') {
          return NextResponse.json(
            { success: true, message: 'Email déjà inscrit' },
            { status: 200 }
          )
        }
      }

      // Ajout du tag prospect_b2c
      await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}/tag`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          tags: ['prospect_b2c'],
        }),
      })
    } catch (brevoErr) {
      console.error('Brevo sync error:', brevoErr)
    }

    return NextResponse.json(
      { success: true, message: 'Inscription réussie' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur API subscribe:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
