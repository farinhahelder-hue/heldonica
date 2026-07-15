import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// Newsletter Heldonica â€” Brevo (contacts) + Resend (email de bienvenue + sÃ©quences)
// Variables requises : BREVO_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Liste Brevo cible : listIds [2] â€” "Newsletter Heldonica"

export async function POST(request: NextRequest) {
  try {
    const { email, website_url } = await request.json()

    // Server-side honeypot: silently reject if bot filled the hidden field
    if (website_url) {
      return NextResponse.json({ success: true, message: 'Inscription confirmÃ©e !' }, { status: 200 })
    }

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
        // Contact dÃ©jÃ  inscrit â†’ pas une erreur bloquante
        if (err.code !== 'duplicate_parameter') {
          console.error('Brevo error:', err)
          return NextResponse.json({ error: 'Erreur inscription newsletter' }, { status: 400 })
        }
      }
    }

    // 2. Email de bienvenue via Resend (Email 1 â€” immÃ©diate)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const { Resend } = await import('resend')
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Heldonica <contact@heldonica.fr>',
        to: [email],
        subject: 'Bienvenue dans l\'aventure Heldonica ðŸŒ¿',
        html: `
          <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
            <div style="background: #6b2a1a; padding: 32px 40px; text-align: center;">
              <h1 style="color: #fef3c7; font-weight: 300; font-size: 28px; margin: 0; letter-spacing: 0.05em;">Heldonica</h1>
              <p style="color: #fde68a; font-size: 11px; letter-spacing: 0.2em; margin: 8px 0 0;">SLOW TRAVEL Â· VOYAGES VÃ‰CUS</p>
            </div>
            <div style="padding: 40px; background: #faf9f7;">
              <p style="font-size: 20px; margin: 0 0 20px; color: #6b2a1a;">Bienvenue dans lâ€™aventure âœ¨</p>
              <p style="color: #444; line-height: 1.7; margin: 0 0 20px;">
                On est ravis de tâ€™avoir parmi nous. Tu vas recevoir nos meilleures pÃ©pites dÃ©nichÃ©es : carnets de voyage en couple, adresses hors sentiers battus, et expÃ©riences slow que seul un vrai terrain peut rÃ©vÃ©ler.
              </p>
              <p style="color: #444; line-height: 1.7; margin: 0 0 32px;">
                En attendant notre prochain carnet, explore les destinations quâ€™on a vraiment vÃ©cues :
              </p>
              <a href="https://www.heldonica.fr/blog" style="display: inline-block; background: #6b2a1a; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Voir le blog â†’</a>
              <p style="margin-top: 24px;">
                <a href="https://www.heldonica.fr/a-propos" style="color: #01696f; font-size: 14px;">DÃ©couvrir notre histoire â†’</a>
              </p>
            </div>
            <div style="padding: 24px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
              <p style="font-size: 11px; color: #888; margin: 0;">
                Tu reÃ§ois cet email car tu tâ€™es inscrit(e) sur heldonica.fr Â· DÃ©sabonnement en 1 clic Â· <a href="https://www.heldonica.fr/mentions-legales" style="color: #6b2a1a;">Mentions lÃ©gales</a>
              </p>
            </div>
          </div>
        `,
      })
    }

    // 3. Programmer les sÃ©quences J+3 et J+7 dans Supabase
    const now = new Date()
    const j3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const j7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await supabase.from('email_sequences').upsert([
      { email, step: 2, scheduled_at: j3.toISOString() },
      { email, step: 3, scheduled_at: j7.toISOString() },
    ], { onConflict: 'email,step' })

    return NextResponse.json(
      { success: true, message: 'Inscription confirmÃ©e !' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

