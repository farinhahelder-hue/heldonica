import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function escapeHtml(unsafe: any) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = (url && key) ? createClient(url, key) : null;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  try {
    const body = await req.json()
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

    // Honeypot anti-spam
    if (body.honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validation basique
    if (!firstName || !email || !destination) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // 1. Sauvegarde Supabase
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
    const { error: dbError } = await supabase
      .from('demandes_travel')
      .insert({
        trip_type: tripType,
        vibe,
        destination,
        destination_detail: destinationDetail,
        duree_jours: duration,
        budget_fourchette: budget,
        mois_depart: departureDate || null,
        prenom: firstName,
        nom: '', // Pas de champ nom dans le formulaire, à améliorer
        email,
        telephone: phone || null,
        notes: message || null,
        statut: 'new',
      })

    if (dbError) {
      console.error('Supabase error:', dbError)
    }

    // 2. Intégration Brevo — ajout du contact avec tag prospect_b2c
    const brevoApiKey = process.env.BREVO_API_KEY
    if (brevoApiKey) {
      try {
        await fetch('https://api.brevo.com/v3/contacts', {
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
              DESTINATION: destination + (destinationDetail ? ` — ${destinationDetail}` : ''),
              DUREE: duration || '',
              BUDGET: budget || '',
              DATE_DEPART: departureDate || '',
            },
            listIds: [2], // ID liste Brevo — à adapter
            updateEnabled: true,
          }),
        })

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
    }


    const sFirstName = escapeHtml(firstName);
    const sEmail = escapeHtml(email);
    const sPhone = escapeHtml(phone);
    const sDestination = escapeHtml(destination);
    const sDestinationDetail = escapeHtml(destinationDetail);
    const sTripType = escapeHtml(tripType);
    const sVibe = escapeHtml(vibe);
    const sDuration = escapeHtml(duration);
    const sBudget = escapeHtml(budget);
    const sDepartureDate = escapeHtml(departureDate);
    const sMessage = escapeHtml(message);

    // 3. Email interne à Heldonica
    if (resend) {
      const internalEmails = ['bonjour@heldonica.fr', 'contact@heldonica.fr'];
      for (const recipient of internalEmails) {
        await resend.emails.send({
          from: 'Heldonica <contact@heldonica.fr>',
          to: recipient,
          subject: `✈️ Nouvelle demande Travel Planning — ${sFirstName} (${sDestination})`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f6f2;">
            <h1 style="color: #01696f; font-size: 24px; margin-bottom: 8px;">Nouvelle demande de Travel Planning</h1>
            <p style="color: #7a7974; margin-bottom: 32px; font-size: 14px;">Reçue le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; width: 40%; color: #28251d;">Prénom</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sFirstName}</td></tr>
              <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Email</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;"><a href="mailto:${sEmail}" style="color: #01696f;">${sEmail}</a></td></tr>
              ${phone ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Téléphone</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sPhone}</td></tr>` : ''}
              <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Destination</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDestination}${destinationDetail ? ` — ${sDestinationDetail}` : ''}</td></tr>
              <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Type de voyage</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sTripType || 'Non précisé'}</td></tr>
              <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Ambiance</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sVibe || 'Non précisé'}</td></tr>
              <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Durée</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDuration || 'Non précisé'}</td></tr>
              <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Budget</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sBudget || 'Non précisé'}</td></tr>
              ${departureDate ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Date de départ</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDepartureDate}</td></tr>` : ''}
            </table>

            ${message ? `<div style="margin-top: 24px; padding: 16px; background: #fff; border-left: 3px solid #01696f;"><p style="font-weight: bold; margin-bottom: 8px; color: #28251d;">Message :</p><p style="color: #28251d; line-height: 1.6;">${sMessage}</p></div>` : ''}

            <div style="margin-top: 32px; text-align: center;">
              <a href="mailto:${sEmail}?subject=Re: Votre demande Travel Planning — ${sDestination}" style="display: inline-block; background: #01696f; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: bold;">Répondre à ${sFirstName}</a>
            </div>

            <p style="margin-top: 32px; font-size: 12px; color: #7a7974; text-align: center;">Heldonica • Travel Planning sur mesure • heldonica.fr</p>
          </div>
        `,
        }).catch((err) => console.error('Failed to send internal email:', err));
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping internal email');
    }

    // 4. Email de confirmation au prospect
    if (resend) {
      await resend.emails.send({
        from: 'Heldonica <contact@heldonica.fr>',
        to: email,
        subject: `On a reçu ton projet de voyage ✈️ — Heldonica`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff;">
            <div style="border-bottom: 3px solid #6b2a1a; padding-bottom: 24px; margin-bottom: 32px;">
              <h1 style="color: #6b2a1a; font-size: 28px; margin: 0 0 8px 0;">Merci ${sFirstName} !</h1>
              <p style="color: #1a1a1a; font-size: 16px; margin: 0; line-height: 1.6;">
                On a bien reçu ton projet pour <strong>${sDestination}</strong>.
              </p>
            </div>
            
            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
              On prend le temps de lire ton brief avant de répondre.<br />
              <em style="color: #555;">Pas de réponse automatique ici.</em>
            </p>
            
            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
              On revient vers toi <strong>sous 48h</strong> avec un vrai retour — nos premières idées, et peut-être quelques questions pour affiner ce voyage sur mesure.
            </p>

            <div style="background: #f7f6f2; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #6b2a1a;">
              <h2 style="color: #6b2a1a; font-size: 14px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Récap de ta demande</h2>
              <p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">🗺️ <strong>Destination :</strong> ${sDestination}${destinationDetail ? ` — ${sDestinationDetail}` : ''}</p>
              ${tripType ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">🧳 <strong>Type :</strong> ${sTripType}</p>` : ''}
              ${vibe ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">✨ <strong>Vibe :</strong> ${sVibe}</p>` : ''}
              ${duration ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">📅 <strong>Durée :</strong> ${sDuration}</p>` : ''}
              ${budget ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">💶 <strong>Budget :</strong> ${sBudget}</p>` : ''}
              ${departureDate ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">🛫 <strong>Départ :</strong> ${sDepartureDate}</p>` : ''}
            </div>

            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 8px;">
              À très vite,
            </p>
            <p style="color: #6b2a1a; font-size: 18px; font-style: italic; margin: 0;">Hélder & le duo Heldonica</p>
            <p style="color: #888; font-size: 13px; margin: 8px 0 0 0;">heldonica.fr</p>

            <hr style="border: none; border-top: 1px solid #e8e0d8; margin: 32px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">
              Tu peux aussi nous écrire directement à <a href="mailto:contact@heldonica.fr" style="color: #6b2a1a;">contact@heldonica.fr</a>
            </p>
          </div>
        `,
      }).catch((err) => console.error('Failed to send confirmation email:', err));
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Travel planning API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
