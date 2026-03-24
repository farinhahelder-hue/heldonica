import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validation basique
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // TODO: Envoyer l'email (Resend, SendGrid, etc.)
    // Pour l'instant, on log juste
    console.log('Nouveau message de contact:', data)

    return NextResponse.json(
      { success: true, message: 'Message reçu' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur API contact:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
