import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
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

    // 1. Sauvegarde dans Supabase
    const { error: dbError } = await supabase
      .from('travel_requests')
      .insert([
        {
          trip_type: tripType,
          vibe,
          destination,
          destination_detail: destinationDetail,
          duration,
          budget,
          departure_date: departureDate,
          first_name: firstName,
          email,
          phone,
          message,
          created_at: new Date().toISOString(),
          status: 'new',
        },
      ])

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // 2. Email interne à Heldonica
    await resend.emails.send({
      from: 'Heldonica Travel Planning <contact@heldonica.fr>',
      to: ['contact@heldonica.fr'],
      subject: `🌍 Nouvelle demande Travel Planning — ${firstName} (${tripType})`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d2a26;">
          <div style="background: #6b3a2a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; font-size: 22px; margin: 0;">Nouvelle demande Travel Planning</h1>
          </div>
          <div style="background: #f9f8f5; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e0da;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px; width: 40%;">Prénom</td><td style="padding: 8px 0; font-weight: 600;">${firstName}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #01696f;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Téléphone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
              <tr><td colspan="2" style="padding: 16px 0 4px; border-top: 1px solid #e5e0da;"></td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Type de voyage</td><td style="padding: 8px 0;">${tripType}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Ambiance</td><td style="padding: 8px 0;">${vibe}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Destination</td><td style="padding: 8px 0;">${destination}${destinationDetail ? ` — ${destinationDetail}` : ''}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Durée</td><td style="padding: 8px 0;">${duration || 'Non précisée'}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Budget</td><td style="padding: 8px 0;">${budget || 'Non précisé'}</td></tr>
              <tr><td style="padding: 8px 0; color: #7a7974; font-size: 14px;">Date départ</td><td style="padding: 8px 0;">${departureDate || 'Flexible'}</td></tr>
              ${message ? `<tr><td colspan="2" style="padding: 16px 0 0;"><p style="margin: 0; font-size: 14px; color: #7a7974;">Message</p><p style="margin: 8px 0 0; background: #fff; border: 1px solid #e5e0da; border-radius: 6px; padding: 12px; font-style: italic;">"${message}"</p></td></tr>` : ''}
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${email}?subject=Votre demande Travel Planning Heldonica" style="display: inline-block; background: #6b3a2a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px;">Répondre à ${firstName}</a>
            </div>
          </div>
        </div>
      `,
    })

    // 3. Email de confirmation au prospect
    await resend.emails.send({
      from: 'Heldonica — Travel Planning <contact@heldonica.fr>',
      to: [email],
      subject: `Ta demande est bien reçue, ${firstName} ✈️`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d2a26;">
          <div style="background: #6b3a2a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; font-size: 22px; margin: 0;">Heldonica — Travel Planning</h1>
          </div>
          <div style="background: #f9f8f5; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e0da;">
            <h2 style="font-size: 20px; margin: 0 0 16px; color: #2d2a26;">Bonjour ${firstName} 👋</h2>
            <p style="line-height: 1.7; margin: 0 0 16px;">On a bien reçu ta demande de conception sur mesure — merci de nous faire confiance pour ton prochain voyage !</p>
            <p style="line-height: 1.7; margin: 0 0 16px;">On la lit avec attention et on te revient dans les <strong>48h</strong> avec une première proposition adaptée à ta vibe <em>${vibe}</em>.</p>
            <div style="background: #fff; border: 1px solid #e5e0da; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #7a7974; text-transform: uppercase; letter-spacing: 0.05em;">Récapitulatif de ta demande</p>
              <p style="margin: 4px 0;">🌍 <strong>Type :</strong> ${tripType} · ${vibe}</p>
              <p style="margin: 4px 0;">📍 <strong>Destination :</strong> ${destination}${destinationDetail ? ` — ${destinationDetail}` : ''}</p>
              ${duration ? `<p style="margin: 4px 0;">⏳ <strong>Durée :</strong> ${duration}</p>` : ''}
              ${budget ? `<p style="margin: 4px 0;">💶 <strong>Budget :</strong> ${budget}</p>` : ''}
            </div>
            <p style="line-height: 1.7; margin: 0 0 24px; font-style: italic; color: #7a7974;">À très vite pour partir à l'aventure ensemble,<br/><strong>Heldonica — On est deux, on voyage pour toi</strong></p>
            <div style="text-align: center; border-top: 1px solid #e5e0da; padding-top: 20px; margin-top: 8px;">
              <a href="https://heldonica.fr/blog" style="color: #01696f; text-decoration: none; font-size: 14px;">Explorer le blog Heldonica →</a>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Travel planning API error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
