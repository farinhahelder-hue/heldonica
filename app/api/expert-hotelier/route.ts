import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type HotelierLead = {
  name: string
  establishment: string
  city: string
  website?: string
  type: string
  rooms?: string
  directBookingsShare?: string
  message?: string
}

async function notifyViaBrevo(email: string, data: HotelierLead): Promise<boolean> {
  if (!BREVO_API_KEY) return false
  try {
    const res = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Heldonica', email: 'contact@heldonica.fr' },
        to: [{ email: 'contact@heldonica.fr' }],
        subject: `Nouvelle demande Consulting hébergeur — ${data.establishment} (${data.city})`,
        htmlContent: `
          <h2>Nouvelle demande de diagnostic hébergeur</h2>
          <table style="border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Nom</td><td style="padding: 8px;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Établissement</td><td style="padding: 8px;">${escapeHtml(data.establishment)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Ville</td><td style="padding: 8px;">${escapeHtml(data.city)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Site web</td><td style="padding: 8px;">${escapeHtml(data.website || '—')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Type d'hébergement</td><td style="padding: 8px;">${escapeHtml(data.type)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Nombre de chambres</td><td style="padding: 8px;">${escapeHtml(data.rooms || '—')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Part de réservations directes</td><td style="padding: 8px;">${escapeHtml(data.directBookingsShare || '—')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${escapeHtml(data.message || '—')}</td></tr>
          </table>
          <a href="mailto:${escapeHtml(email)}" style="display: inline-block; margin-top: 20px; background: #6B2D1F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Répondre</a>
        `,
      }),
    })
    return res.ok
  } catch (e) {
    console.error('Brevo hotelier notification error:', e)
    return false
  }
}

export async function POST(req: NextRequest) {
  // Ce formulaire envoie un courriel a chaque soumission, aux frais du
  // compte Resend. Ses trois voisins etaient limites, celui-ci non : rien
  // n'empechait d'en declencher autant qu'on voulait.
  const debit = checkRateLimit(getClientIp(req), { limit: 5, prefix: 'expert-hotelier' })
  if (!debit.success) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessaie dans un instant.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { name, email, establishment, city, website, type, rooms, directBookingsShare, message, rgpd } = body

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Adresse email invalide' }, { status: 400 })
    }
    if (!name || !establishment || !city || !type) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 })
    }
    if (!rgpd) {
      return NextResponse.json({ success: false, error: 'Consentement requis' }, { status: 400 })
    }
    if (message && message.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message trop long (2000 caractères max)' }, { status: 400 })
    }

    const lead: HotelierLead = { name, establishment, city, website, type, rooms, directBookingsShare, message }

    if (BREVO_API_KEY) {
      const ok = await notifyViaBrevo(email, lead)
      if (ok) return NextResponse.json({ success: true, via: 'brevo' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'contact@heldonica.fr'],
      subject: `Nouvelle demande Consulting hébergeur — ${escapeHtml(establishment)} (${escapeHtml(city)})`,
      html: `
        <h2>Nouvelle demande de diagnostic hébergeur</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Nom</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Email</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Établissement</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(establishment)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Ville</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(city)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Site web</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(website || '—')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Type d'hébergement</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(type)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Nombre de chambres</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(rooms || '—')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Part de réservations directes</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(directBookingsShare || '—')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Message</strong></td><td style="padding:8px;border:1px solid #eee">${escapeHtml(message || '—')}</td></tr>
        </table>
      `,
    })

    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [email],
      subject: 'Demande reçue — Consulting hébergeur Heldonica',
      html: `
        <p>Bonjour ${escapeHtml(name)},</p>
        <p>On a bien reçu ta demande de diagnostic pour <strong>${escapeHtml(establishment)}</strong>.</p>
        <p>On revient vers toi sous <strong>48h</strong> pour planifier un appel découverte de 30 minutes.</p>
        <br/>
        <p>À très vite,<br/><strong>L'équipe Heldonica</strong></p>
      `,
    })

    return NextResponse.json({ success: true, via: 'resend' })
  } catch (error) {
    console.error('Expert-hotelier form error:', error)
    return NextResponse.json({ success: false, error: 'Erreur envoi email' }, { status: 500 })
  }
}
