import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// Route appelée par un cron (Vercel Cron ou CMS) pour envoyer les emails en attente
// Méthode: GET /api/send-email-sequences?key=SECRET_KEY
// Fréquence recommandée: toutes les heures

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

const EMAIL_2 = {
  subject: 'Le slow travel, ça ressemble à quoi vraiment ? 🌿',
  html: () => `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
      <div style="background: #01696f; padding: 32px 40px; text-align: center;">
        <h1 style="color: #fff; font-weight: 300; font-size: 26px; margin: 0;">Le slow travel</h1>
        <p style="color: #b2dfdb; font-size: 11px; letter-spacing: 0.2em; margin: 8px 0 0;">NOTRE PHILOSOPHIE</p>
      </div>
      <div style="padding: 40px; background: #faf9f7;">
        <p style="font-size: 18px; margin: 0 0 24px; color: #1a1a1a;">
          Le slow travel, c'est pas voyager lentement. C'est voyager <em>vraiment</em>.
        </p>
        <p style="color: #444; line-height: 1.7; margin: 0 0 20px;">
          C'est prendre le temps de s'asseoir dans cette tasca de village où personne ne parle anglais. C'est rater son bus de retour parce que le coucher de soleil depuis ce belvédère valait le détour. C'est revenir avec l'adresse du café que même le réceptionniste de l'hôtel ne connaissait pas.
        </p>
        <p style="color: #444; line-height: 1.7; margin: 0 0 32px;">
          On a testé, on a vécu, on a parfois raté des trucs — et c'est pour ça qu'on peut te dire ce qui vaut vraiment le coup.
        </p>
        <a href="https://heldonica.fr/a-propos" style="display: inline-block; background: #01696f; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Découvrir notre histoire →</a>
      </div>
      <div style="padding: 24px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
        <p style="font-size: 13px; color: #666; margin: 0 0 12px;">
          Une pépite de notre dernier carnet :
        </p>
        <blockquote style="font-style: italic; color: #444; border-left: 3px solid #01696f; padding-left: 16px; margin: 0 0 20px;">
          "On a passé 3 jours à Madère sans voir un seul touriste. Parce qu'on avait pris le temps de chercher les bons chemins."
        </blockquote>
        <a href="https://heldonica.fr/blog" style="color: #6b2a1a; font-size: 13px;">Lire nos carnets de voyage →</a>
      </div>
    </div>
  `,
}

const EMAIL_3 = {
  subject: 'Et si on concevait ton prochain voyage ensemble ? 🗺️',
  html: () => `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
      <div style="background: #6b2a1a; padding: 32px 40px; text-align: center;">
        <h1 style="color: #fef3c7; font-weight: 300; font-size: 26px; margin: 0;">Travel Planning</h1>
        <p style="color: #fde68a; font-size: 11px; letter-spacing: 0.2em; margin: 8px 0 0;">CONCEPTION SUR MESURE</p>
      </div>
      <div style="padding: 40px; background: #faf9f7;">
        <p style="font-size: 18px; margin: 0 0 24px; color: #1a1a1a;">
          On ne te vend pas un voyage tout fait.
        </p>
        <p style="color: #444; line-height: 1.7; margin: 0 0 20px;">
          On conçoit avec toi un carnet de route qui te ressemble. Tes envies, ton rythme, tes contraintes — on prend tout en compte. Et on ne te recommande que des endroits qu'on a vraiment vécus.
        </p>
        <p style="color: #444; line-height: 1.7; margin: 0 0 24px;">
          Un Travel Planning Heldonica, c'est 150€ à 350€ selon la complexité du voyage — et ça inclut un échange humain, un vrai brief, et un carnet de route détaillé.
        </p>
        <div style="background: #f5f3ef; border-left: 4px solid #6b2a1a; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="font-style: italic; color: #444; margin: 0 0 12px;">"Sophie, 34 ans, a voulu découvrir Madère en couple — sans le côté trop touristique. En 10 jours, on lui a conçu un itinéraire avec des levadas, des villages de pêcheurs et deux restaurants où le patron la reconnaît maintenant."</p>
          <p style="font-size: 12px; color: #888; margin: 0;">— Le duo Heldonica</p>
        </div>
        <a href="https://heldonica.fr/travel-planning" style="display: inline-block; background: #6b2a1a; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Dis-nous ton projet →</a>
      </div>
      <div style="padding: 24px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
        <p style="font-size: 11px; color: #888; margin: 0;">
          Tu reçois cet email car tu t'es inscrit(e) sur heldonica.fr · <a href="https://heldonica.fr/mentions-legales" style="color: #6b2a1a;">Se désabonner</a>
        </p>
      </div>
    </div>
  `,
}

export async function GET(request: Request) {
  // Vérification du secret cron (optionnel en prod)
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (process.env.NODE_ENV === 'production' && key !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY non configurée — emails non envoyés')
      return NextResponse.json({ success: false, message: 'RESEND_API_KEY non configurée' })
    }

    // Récupérer les emails en attente
    const { data: pending, error } = await supabase
      .from('email_sequences')
      .select('*')
      .is('sent_at', null)
      .lte('scheduled_at', new Date().toISOString())
      .limit(50)

    if (error) {
      console.error('Error fetching pending emails:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No pending emails' })
    }

    // Envoyer les emails
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)
    const results: { email: string; step: number; success: boolean }[] = []

    for (const seq of pending) {
      try {
        const emailContent = seq.step === 2 ? EMAIL_2 : EMAIL_3
        
        await resend.emails.send({
          from: 'Heldonica <contact@heldonica.fr>',
          to: [seq.email],
          subject: emailContent.subject,
          html: emailContent.html(),
        })

        // Marquer comme envoyé
        await supabase
          .from('email_sequences')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', seq.id)

        results.push({ email: seq.email, step: seq.step, success: true })
      } catch (err) {
        console.error(`Error sending email to ${seq.email}:`, err)
        results.push({ email: seq.email, step: seq.step, success: false })
      }
    }

    const sentCount = results.filter(r => r.success).length
    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: pending.length,
      results,
    })
  } catch (error) {
    console.error('Send email sequences error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}