import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY!)

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
    const { error: dbError } = await supabase
      .from('travel_requests')
      .insert({
        trip_type: tripType,
        vibe,
        destination,
        destination_detail: destinationDetail,
        duration,
        budget,
        departure_date: departureDate || null,
        first_name: firstName,
        email,
        phone: phone || null,
        message: message || null,
        status: 'new',
      })

    if (dbError) {
      console.error('Supabase error:', dbError)
    }

    // 2. Email interne à Heldonica
    await resend.emails.send({
      from: 'Heldonica <contact@heldonica.fr>',
      to: 'contact@heldonica.fr',
      subject: `✈️ Nouvelle demande Travel Planning — ${firstName} (${destination})`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f6f2;">
          <h1 style="color: #01696f; font-size: 24px; margin-bottom: 8px;">Nouvelle demande de Travel Planning</h1>
          <p style="color: #7a7974; margin-bottom: 32px; font-size: 14px;">Reçue le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; width: 40%; color: #28251d;">Prénom</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${firstName}</td></tr>
            <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Email</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;"><a href="mailto:${email}" style="color: #01696f;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Téléphone</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${phone}</td></tr>` : ''}
            <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Destination</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${destination}${destinationDetail ? ` — ${destinationDetail}` : ''}</td></tr>
            <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Type de voyage</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${tripType || 'Non précisé'}</td></tr>
            <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Ambiance</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${vibe || 'Non précisé'}</td></tr>
            <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Durée</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${duration || 'Non précisé'}</td></tr>
            <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Budget</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${budget || 'Non précisé'}</td></tr>
            ${departureDate ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Date de départ</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${departureDate}</td></tr>` : ''}
          </table>

          ${message ? `<div style="margin-top: 24px; padding: 16px; background: #fff; border-left: 3px solid #01696f;"><p style="font-weight: bold; margin-bottom: 8px; color: #28251d;">Message :</p><p style="color: #28251d; line-height: 1.6;">${message}</p></div>` : ''}

          <div style="margin-top: 32px; text-align: center;">
            <a href="mailto:${email}?subject=Re: Votre demande Travel Planning — ${destination}" style="display: inline-block; background: #01696f; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: bold;">Répondre à ${firstName}</a>
          </div>

          <p style="margin-top: 32px; font-size: 12px; color: #7a7974; text-align: center;">Heldonica • Travel Planning sur mesure • heldonica.fr</p>
        </div>
      `,
    })

    // 3. Email de confirmation au prospect
    await resend.emails.send({
      from: 'Heldonica <contact@heldonica.fr>',
      to: email,
      subject: `Merci ${firstName} — On a bien reçu ta demande ✈️`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f6f2;">
          <h1 style="color: #01696f; font-size: 28px; margin-bottom: 16px;">Merci ${firstName} !</h1>
          <p style="color: #28251d; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
            On a bien reçu ta demande pour <strong>${destination}</strong> — et on est déjà enthousiastes à l'idée de la faire naître.
          </p>
          <p style="color: #28251d; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
            On revient vers toi sous <strong>48h ouvrées</strong> pour un premier échange et te poser quelques questions pour affiner ton voyage sur mesure.
          </p>

          <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #28251d; font-size: 16px; margin-bottom: 16px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; color: #7a7974;">Récap de ta demande</h2>
            <p style="margin: 4px 0; color: #28251d;">🗺️ <strong>Destination :</strong> ${destination}${destinationDetail ? ` — ${destinationDetail}` : ''}</p>
            ${tripType ? `<p style="margin: 4px 0; color: #28251d;">🧳 <strong>Type :</strong> ${tripType}</p>` : ''}
            ${duration ? `<p style="margin: 4px 0; color: #28251d;">📅 <strong>Durée :</strong> ${duration}</p>` : ''}
            ${budget ? `<p style="margin: 4px 0; color: #28251d;">💶 <strong>Budget :</strong> ${budget}</p>` : ''}
          </div>

          <p style="color: #28251d; font-size: 16px; line-height: 1.7; margin-bottom: 8px;">
            À très vite,
          </p>
          <p style="color: #01696f; font-size: 16px; font-style: italic;">Hélder & Elena — Heldonica</p>

          <hr style="border: none; border-top: 1px solid #dcd9d5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #7a7974; text-align: center;">
            <a href="https://www.heldonica.fr" style="color: #01696f;">heldonica.fr</a> • Slow Travel & Travel Planning sur mesure
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Travel planning API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
