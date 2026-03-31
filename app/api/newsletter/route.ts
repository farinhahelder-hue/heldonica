import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // 1. Ajout dans Brevo
    const brevoApiKey = process.env.BREVO_API_KEY
    if (brevoApiKey) {
      const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          email,
          listIds: [2],
          updateEnabled: true,
        }),
      })

      if (!brevoRes.ok) {
        const err = await brevoRes.json()
        // Contact déjà inscrit → pas une erreur
        if (err.code !== 'duplicate_parameter') {
          console.error('Brevo error:', err)
          return NextResponse.json({ error: 'Erreur inscription newsletter' }, { status: 400 })
        }
      }
    } else {
      console.warn('BREVO_API_KEY non configurée — inscription simulée')
    }

    // 2. Email de bienvenue via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Heldonica <onboarding@resend.dev>',
        to: [email],
        subject: '🌿 Bienvenue dans l'aventure Heldonica !',
        html: `
          <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1c1917">
            <div style="background:#78350f;padding:32px 40px;text-align:center">
              <h1 style="color:#fef3c7;font-weight:300;font-size:28px;margin:0;letter-spacing:0.05em">Heldonica</h1>
              <p style="color:#fde68a;font-size:12px;letter-spacing:0.2em;margin:8px 0 0">SLOW TRAVEL · L'EXPERT DE L'AVENTURE</p>
            </div>
            <div style="padding:40px;background:#fffbf5">
              <p style="font-size:18px;margin:0 0 16px">Bienvenue dans l'aventure ✨</p>
              <p style="color:#57534e;line-height:1.7;margin:0 0 20px">
                On est ravis de t'avoir parmi nous. Tu vas recevoir nos meilleures pépites dénichées : carnets de voyage en couple, adresses hors sentiers battus, et expériences slow que seul un vrai terrain peut révéler.
              </p>
              <p style="color:#57534e;line-height:1.7;margin:0 0 32px">
                En attendant notre prochain carnet, explore les destinations qu'on a vécues :
              </p>
              <a href="https://heldonica.fr/blog" style="display:inline-block;background:#78350f;color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-size:14px;font-family:sans-serif">Voir le blog →</a>
            </div>
            <div style="padding:24px 40px;background:#f5f0eb;text-align:center">
              <p style="font-size:12px;color:#a8a29e;margin:0">
                Tu reçois cet email car tu t'es inscrit(e) sur heldonica.fr.<br/>
                <a href="https://heldonica.fr" style="color:#78350f">heldonica.fr</a>
              </p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json(
      { success: true, message: 'Inscription confirmée !' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
