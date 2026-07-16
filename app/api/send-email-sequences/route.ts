import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// Route appelÃ©e par un cron (Vercel Cron ou CMS) pour envoyer les emails en attente
// MÃ©thode: GET /api/send-email-sequences?key=SECRET_KEY
// FrÃ©quence recommandÃ©e: toutes les heures

const CRON_SECRET = process.env.CRON_SECRET

// FORMAT ULTRA-COURT : 1 adresse + 1 timing + 1 erreur Ã  Ã©viter
const EMAIL_2 = {
  subject: 'ðŸ“ Cette adresse Ã  MadÃ¨re',
  html: () => `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
      <div style="background: #01696f; padding: 28px 40px; text-align: center;">
        <h1 style="color: #fff; font-weight: 400; font-size: 20px; margin: 0;">PÃ©pite de la semaine</h1>
      </div>
      <div style="padding: 36px 40px; background: #faf9f7;">
        
        <!-- ðŸ“ ADRESSE -->
        <div style="background: #fff; border-left: 4px solid #01696f; padding: 20px 24px; margin: 0 0 28px; border-radius: 0 8px 8px 0;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #01696f; margin: 0 0 8px; font-family: sans-serif;">ðŸ“ L'adresse</p>
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 4px; color: #1a1a1a;">CafÃ© do Furado</p>
          <p style="font-size: 13px; color: #666; margin: 0;">Praia Formosa, MadÃ¨re</p>
          <p style="font-size: 14px; color: #444; margin: 12px 0 0; line-height: 1.6;">
            Une tasca de pÃªcheurs sans menu. Poisson du matin, ZERO touriste en mai.
          </p>
        </div>
        
        <!-- â±ï¸ TIMING -->
        <div style="margin: 0 0 28px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #01696f; margin: 0 0 8px; font-family: sans-serif;">â±ï¸ Timing</p>
          <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.6;">
            Entre 10h et 11h30. Avant : les pÃªcheurs. AprÃ¨s 12h30 : complet.
          </p>
        </div>
        
        <!-- âš ï¸ ERREUR Ã€ Ã‰VITER -->
        <div style="background: #fef2f2; border-left: 4px solid #991b1b; padding: 20px 24px; margin: 0 0 28px; border-radius: 0 8px 8px 0;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #991b1b; margin: 0 0 8px; font-family: sans-serif;">âš ï¸ Erreur Ã  Ã©viter</p>
          <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.6;">
            Pas le "plat du jour" le dimanche. SurgelÃ© de Funchal. Prendre le poisson grillÃ© sur l'ardoise.
          </p>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; padding-top: 12px;">
          <a href="https://www.heldonica.fr/blog" style="display: inline-block; background: #01696f; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Voir le dernier carnet â†’</a>
        </div>
      </div>
      <div style="padding: 20px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
        <p style="font-size: 11px; color: #888; margin: 0;">
          Tu reÃ§ois Ã§a chaque semaine Â· <a href="https://www.heldonica.fr/mentions-legales" style="color: #6b2a1a;">Se dÃ©sabonner</a>
        </p>
      </div>
    </div>
  `,
}

// EMAIL 3 : CONVERSION TRAVEL PLANNING
const EMAIL_3 = {
  subject: 'ðŸ—ºï¸ On conÃ§oit ton voyage avec toi',
  html: () => `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
      <div style="background: #6b2a1a; padding: 28px 40px; text-align: center;">
        <h1 style="color: #fef3c7; font-weight: 400; font-size: 20px; margin: 0;">Travel Planning</h1>
      </div>
      <div style="padding: 36px 40px; background: #faf9f7;">
        
        <!-- CONTEXTE -->
        <div style="margin: 0 0 24px;">
          <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">
            On ne te vend pas un voyage tout fait.
          </p>
          <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.7;">
            On conÃ§oit avec toi un carnet de route qui te ressemble. Tes envies, ton rythme, tes contraintes â€” on prend tout. Et on ne recommande que des endroits qu'on a vraiment vÃ©cus.
          </p>
        </div>
        
        <!-- PRIX -->
        <div style="background: #fff; border-left: 4px solid #6b2a1a; padding: 20px 24px; margin: 0 0 24px; border-radius: 0 8px 8px 0;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b2a1a; margin: 0 0 8px; font-family: sans-serif;">Le tarif</p>
          <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.6;">
            150â‚¬ Ã  350â‚¬ selon la complexitÃ©. Inclus : Ã©change humain, brief, et carnet de route dÃ©taillÃ©.
          </p>
        </div>
        
        <!-- TÃ‰MOIGNAGE -->
        <div style="background: #fef2f2; border-left: 4px solid #991b1b; padding: 20px 24px; margin: 0 0 24px; border-radius: 0 8px 8px 0;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #991b1b; margin: 0 0 8px; font-family: sans-serif;">Ce qu'on a entendu</p>
          <p style="font-size: 14px; color: #444; margin: 0; font-style: italic; line-height: 1.6;">
            "Sophie a voulu dÃ©couvrir MadÃ¨re en couple, sans le cÃ´tÃ© trop touristique. En 10 jours : levadas, villages de pÃªcheurs, deux restos oÃ¹ le patron la reconnaÃ®t maintenant."
          </p>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; padding-top: 12px;">
          <a href="https://www.heldonica.fr/travel-planning" style="display: inline-block; background: #6b2a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-family: sans-serif;">Dis-nous ton projet â†’</a>
        </div>
      </div>
      <div style="padding: 20px 40px; background: #f5f3ef; text-align: center; border-top: 1px solid #e8e0d8;">
        <p style="font-size: 11px; color: #888; margin: 0;">
          Tu reÃ§ois cet email car tu t'es inscrit(e) sur heldonica.fr Â· <a href="https://www.heldonica.fr/mentions-legales" style="color: #6b2a1a;">Se dÃ©sabonner</a>
        </p>
      </div>
    </div>
  `,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  // Support both query param (?key=SECRET) and Vercel Cron header (Authorization: Bearer SECRET)
  const authHeader = request.headers.get('Authorization')
  const isCron = authHeader === `Bearer ${CRON_SECRET}`
  const isAuthorized = (key === CRON_SECRET) || isCron

  if (process.env.NODE_ENV === 'production' && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY non configurÃ©e â€” emails non envoyÃ©s')
      return NextResponse.json({ success: false, message: 'RESEND_API_KEY non configurÃ©e' })
    }

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

