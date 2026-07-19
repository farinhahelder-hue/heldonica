import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Newsletter Heldonica — Resend (email de bienvenue + séquences) + Supabase (stockage)
// Variables requises : RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    const { email, website_url } = await request.json()
    const supabase = createServiceClient()

    // Server-side honeypot: silently reject if bot filled the hidden field
    if (website_url) {
      return NextResponse.json({ success: true, message: 'Inscription confirmée !' }, { status: 200 })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // 1. Ajout dans Supabase (table newsletter_subscribers)
    const { error: subError } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, source: 'popup' }, { onConflict: 'email' })

    if (subError) {
      console.error('Erreur Supabase newsletter:', subError)
    }


    // 2. Email de bienvenue via Resend (Email 1 — immédiate)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const { Resend } = await import('resend')
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Heldonica <contact@heldonica.fr>',
        to: [email],
        subject: "Bienvenue dans l'aventure Heldonica 🌿",
        html: `
          <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
            <div style="background: #6b2a1a; padding: 32px 40px; text-align: center;">
              <h1 style="color: #fef3c7; font-weight: 300; font-size: 28px; margin: 0; letter-spacing: 0.05em;">Heldonica</h1>
              <p style="color: #fde68a; font-size: 11px; letter-spacing: 0.2em; margin: 8px 0 0;">SLOW TRAVEL · VOYAGES VÉCUS</p>
            </div>
            <div style="padding: 40px; background: #faf9f7;">
              <p style="font-size: 20px; margin: 0 0 20px; color: #6b2a1a;">Bienvenue dans l'aventure ✨</p>
              <p style="color: #444; line-height: 1.7; margin: 0 0 20px;">
                On est ravis de t'avoir parmi nous. Tu vas recevoir nos meilleures pépites dénichées : carnets de voyage en couple, adresses hors sentiers battus, et expériences slow que seul un vrai terrain peut révéler.
              </p>
              <p style="color: #444; line-height: 1.7; margin: 0 0 32px;">
                En attendant notre prochain carnet, explore les destinations qu'on a vraiment vécues :
              </p>
              <a href="https://www.heldonica.fr/blog" style="display: inline-block; background: #6b2a1a; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Voir le blog →</a>
              <p style="margin-top: 24px;">
                <a href="https://www.heldonica.fr/a-propos" style="color: #01696f; font-size: 14px;">Découvrir notre histoire →</a>
              </p>
            </div>
            <div style="padding: 24px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
              <p style="font-size: 11px; color: #888; margin: 0;">
                Tu reçois cet email car tu t'es inscrit(e) sur heldonica.fr · Désabonnement en 1 clic · <a href="https://www.heldonica.fr/mentions-legales" style="color: #6b2a1a;">Mentions légales</a>
              </p>
            </div>
          </div>
        `,
      })
    }

    // 3. Programmer les séquences J+3 et J+7 dans Supabase
    const now = new Date()
    const j3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const j7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { error: upsertError } = await supabase.from('email_sequences').upsert([
      { email, step: 2, scheduled_at: j3.toISOString() },
      { email, step: 3, scheduled_at: j7.toISOString() },
    ], { onConflict: 'email,step' })

    if (upsertError) {
      console.error('Supabase sequence upsert error:', upsertError)
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
