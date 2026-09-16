import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'


function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') || // Cloudflare
         'unknown'
}

function escapeHtml(unsafe: unknown): string {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface TravelFormData {
  tripType?: string
  vibe?: string
  destination?: string
  destinationDetail?: string
  duration?: string
  budget?: string
  departureDate?: string // Form sends departureDate, not startDate
  firstName?: string
  email?: string
  phone?: string
  message?: string // Form sends message, not notes
  honeypot?: string
  website_url?: string
}

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests per IP per hour
  const result = checkRateLimit(getClientIP(req), { limit: 5, prefix: 'travel-planning' })
  if (!result.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessaie dans 1 heure.' },
      { status: 429 }
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = (url && key) ? createClient(url, key) : null;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  try {
    const body = await req.json() as TravelFormData

    // Honeypot anti-spam
    if (body.honeypot || body.website_url) {
      return NextResponse.json({ success: true })
    }

    // Extract and normalize field names (form sends departureDate/message)
    const {
      tripType,
      vibe,
      destination,
      destinationDetail,
      duration,
      budget,
      departureDate,
      firstName,
      email,
      phone,
      message,
    } = body

    // Validation
    if (!firstName || !email || !destination) {
      return NextResponse.json(
        { error: 'Ton prénom et ton email sont nécessaires.' },
        { status: 400 }
      )
    }

    // La liste du formulaire met « Destination précise » / « Suggestions
    // Heldonica » / « Région/continent » dans `destination` ; le nom réel
    // (« Madère ») est dans `destinationDetail`. C'est lui qu'on montre.
    const destinationAffichee = (destinationDetail || destination || '').toString().trim()

    // 1. Save to Supabase (priority)
    let dbSaved = false
    let demandeId: string | null = null
    if (supabase) {
      const { data: inseree, error: dbError } = await supabase
        .from('demandes_travel')
        .insert({
          trip_type: tripType || null,
          vibe: vibe || null,
          destination,
          destination_detail: destinationDetail || null,
          duree_jours: duration || null,
          budget_fourchette: budget || null,
          mois_depart: departureDate || null,
          prenom: firstName,
          nom: '',
          email,
          telephone: phone || null,
          notes: message || null,
          statut: 'new',
        })
        .select('id')
        .single()

      if (dbError) {
        console.error('Supabase insert error:', dbError)
        return NextResponse.json(
          { error: 'Impossible d\'enregistrer ta demande.' },
          { status: 500 }
        )
      }
      dbSaved = true
      demandeId = inseree?.id ?? null
    } else {
      return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
    }

    // Prepare escaped values
    const sFirstName = escapeHtml(firstName);
    const sEmail = escapeHtml(email);
    const sPhone = escapeHtml(phone);
    const sDestination = escapeHtml(destinationAffichee);
    const sDestinationDetail = escapeHtml(destinationDetail);
    const sTripType = escapeHtml(tripType);
    const sVibe = escapeHtml(vibe);
    const sDuration = escapeHtml(duration);
    const sBudget = escapeHtml(budget);
    const sDepartureDate = escapeHtml(departureDate);
    const sMessage = escapeHtml(message);

    // 2. Brevo integration (secondary)
    // Brevo n'a pas de liste blanche d'IP pour Vercel par défaut : un 401
    // arrivait ici sans être lu. On lit res.ok et on trace brevoSynced.
    const brevoApiKey = process.env.BREVO_API_KEY
    let brevoSynced = false
    if (brevoApiKey && dbSaved) {
      try {
        const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            email: email,
            attributes: {
              PRENOM: firstName,
              TELEPHONE: phone || '',
              TYPE_VOYAGE: tripType || '',
              VIBE: vibe || '',
              DESTINATION: destinationAffichee,
              DUREE: duration || '',
              BUDGET: budget || '',
              DATE_DEPART: departureDate || '',
            },
            listIds: [2],
            updateEnabled: true,
          }),
        })
        if (!contactRes.ok) {
          console.error('Brevo contact error:', contactRes.status, await contactRes.text())
        }
        const tagRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email as string)}/tag`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({ tags: ['prospect_b2c'] }),
        })
        if (!tagRes.ok) {
          console.error('Brevo tag error:', tagRes.status, await tagRes.text())
        }
        brevoSynced = contactRes.ok
      } catch (brevoErr) {
        console.error('Brevo sync error:', brevoErr)
      }
    }

    // 3. Internal email (secondary)
    //
    // Les envois étaient lancés sans await : la fonction répondait « success »
    // avant qu'ils partent, et une promesse orpheline peut être tuée à la fin
    // d'une fonction Vercel. On attend, on lit le retour, on trace en base.
    const envois: Promise<{ quoi: string; ok: boolean; erreur?: string }>[] = []
    if (resend && dbSaved) {
      const internalEmails = ['bonjour@heldonica.fr', 'contact@heldonica.fr'];
      for (const recipient of internalEmails) {
        envois.push(resend.emails.send({
          from: 'Heldonica <contact@heldonica.fr>',
          to: recipient,
          subject: `✈️ Nouvelle demande Travel Planning — ${sFirstName} (${sDestination})`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f6f2;">
              <h1 style="color: #01696f; font-size: 24px; margin-bottom: 8px;">Nouvelle demande de Travel Planning</h1>
              <p style="color: #7a7974; margin-bottom: 32px; font-size: 14px;">Reçue le ${new Date().toLocaleDateString('fr-FR')}</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; width: 40%;">Prénom</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5;">${sFirstName}</td></tr>
                <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Email</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;"><a href="mailto:${sEmail}" style="color: #01696f;">${sEmail}</a></td></tr>
                ${phone ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Téléphone</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5;">${sPhone}</td></tr>` : ''}
                <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Destination</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;">${sDestination}${destinationDetail ? ` — ${sDestinationDetail}` : ''}</td></tr>
                <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Type</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5;">${sTripType || 'Non précisé'}</td></tr>
                <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Ambiance</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;">${sVibe || 'Non précisé'}</td></tr>
                <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Durée</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5;">${sDuration || 'Non précisé'}</td></tr>
                <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold;">Budget</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;">${sBudget || 'Non précisé'}</td></tr>
              </table>
              ${message ? `<div style="margin-top: 24px; padding: 16px; background: #fff; border-left: 3px solid #01696f;"><p style="font-weight: bold;">Message :</p><p>${sMessage}</p></div>` : ''}
              <div style="margin-top: 32px; text-align: center;">
                <a href="mailto:${sEmail}?subject=Re: Votre demande Travel Planning" style="display: inline-block; background: #01696f; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none;">Répondre à ${sFirstName}</a>
              </div>
            </div>
          `,
        }).then((r) => ({ quoi: `interne ${recipient}`, ok: !r.error, erreur: r.error?.message }))
          .catch((err) => ({ quoi: `interne ${recipient}`, ok: false, erreur: String(err) })));
      }
    }

    // 4. Confirmation email (secondary)
    if (resend && dbSaved) {
      envois.push(resend.emails.send({
        from: 'Heldonica <contact@heldonica.fr>',
        to: email as string,
        subject: `On a reçu ton projet de voyage ✈️ — Heldonica`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff;">
            <h1 style="color: #6b2a1a; font-size: 28px; margin-bottom: 16px;">Merci ${sFirstName} !</h1>
            <p style="font-size: 16px; line-height: 1.7;">On a bien reçu ton projet pour <strong>${sDestination}</strong>.</p>
            <p style="font-size: 16px; line-height: 1.7;">On revient vers toi <strong>sous 48h</strong> avec un vrai retour.</p>
            <div style="background: #f7f6f2; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h2 style="color: #6b2a1a; font-size: 14px;">Récap de ta demande</h2>
              <p>🗺️ <strong>Destination :</strong> ${sDestination}</p>
              ${tripType ? `<p>🧳 <strong>Type :</strong> ${sTripType}</p>` : ''}
              ${vibe ? `<p>✨ <strong>Vibe :</strong> ${sVibe}</p>` : ''}
              ${duration ? `<p>📅 <strong>Durée :</strong> ${sDuration}</p>` : ''}
              ${budget ? `<p>💶 <strong>Budget :</strong> ${sBudget}</p>` : ''}
            </div>
            <p style="color: #6b2a1a; font-size: 18px; font-style: italic;">L'équipe Heldonica</p>
          </div>
        `,
      }).then((r) => ({ quoi: 'confirmation', ok: !r.error, erreur: r.error?.message }))
        .catch((err) => ({ quoi: 'confirmation', ok: false, erreur: String(err) })));
    }

    const resultats = await Promise.all(envois)
    for (const r of resultats) {
      if (!r.ok) console.error(`Travel planning e-mail ${r.quoi} :`, r.erreur)
    }
    const confirmationEnvoyee = resultats.some((r) => r.quoi === 'confirmation' && r.ok)

    // 5. Trace en base de ce qui est vraiment parti — sans ça, rien ne
    // distingue une demande dont les e-mails ont échoué.
    if (supabase && demandeId) {
      const { error: traceError } = await supabase
        .from('demandes_travel')
        .update({
          brevo_synced: brevoSynced,
          email_sent_at: confirmationEnvoyee ? new Date().toISOString() : null,
        })
        .eq('id', demandeId)
      if (traceError) console.error('Travel planning trace error:', traceError.message)
    }

    return NextResponse.json({
      success: dbSaved,
      emails: resultats.map((r) => ({ quoi: r.quoi, ok: r.ok })),
      brevo: brevoSynced,
    })
  } catch (error) {
    console.error('Travel planning API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    )
  }
}
