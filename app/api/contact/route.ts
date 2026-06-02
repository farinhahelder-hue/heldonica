import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Helper to send via Brevo
async function sendViaBrevo(data: {
  email: string
  firstName: string
  destination: string
  dates: string
  message: string
}): Promise<{ contact: boolean; notification: boolean }> {
  if (!BREVO_API_KEY) return { contact: false, notification: false }

  const results = { contact: false, notification: false }

  // Add contact to Brevo list
  try {
    const contactRes = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        listIds: [3],
        attributes: {
          DESTINATION: data.destination || '',
          DATES: data.dates || ''
        }
      })
    })
    results.contact = contactRes.ok || contactRes.status === 400
  } catch (e) {
    console.error('Brevo contact error:', e)
  }

  // Send notification email
  try {
    const emailRes = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Heldonica', email: 'contact@heldonica.fr' },
        to: [{ email: 'contact@heldonica.fr' }],
        subject: `🌍 Nouvelle demande Travel Planning — ${data.firstName} (${data.destination || 'Non précisée'})`,
        htmlContent: `
          <h2>Nouvelle demande de conception sur mesure</h2>
          <table style="border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Prénom</td><td style="padding: 8px;">${data.firstName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Destination</td><td style="padding: 8px;">${data.destination || 'Non précisée'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Dates</td><td style="padding: 8px;">${data.dates || 'Non précisées'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${data.message || 'Aucun'}</td></tr>
          </table>
          <a href="mailto:${data.email}" style="display: inline-block; margin-top: 20px; background: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Répondre</a>
        `
      })
    })
    results.notification = emailRes.ok
  } catch (e) {
    console.error('Brevo notification error:', e)
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, prenom, email, telephone, destination, budget, duree, voyageurs, dates, message } = body

    // Use prenom if available, otherwise fall back to nom
    const firstName = prenom || nom || 'Voyageur'
    const contactEmail = email

    if (!contactEmail || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email et prénom requis' },
        { status: 400 }
      )
    }

    // Try Brevo first if API key is available
    if (BREVO_API_KEY) {
      const brevoResults = await sendViaBrevo({
        email: contactEmail,
        firstName,
        destination: destination || '',
        dates: dates || duree || '',
        message: message || ''
      })

      if (brevoResults.notification) {
        return NextResponse.json({ 
          success: true, 
          via: 'brevo',
          contact_added: brevoResults.contact 
        })
      }
    }

    // Fallback to Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Email notification à l'admin
    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'contact@heldonica.fr'],
      subject: `✈️ Nouvelle demande Travel Planning – ${destination || 'Destination non précisée'}`,
      html: `
        <h2>Nouvelle demande de Travel Planning</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Prénom</strong></td><td style="padding:8px;border:1px solid #eee">${firstName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Email</strong></td><td style="padding:8px;border:1px solid #eee">${contactEmail}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Téléphone</strong></td><td style="padding:8px;border:1px solid #eee">${telephone || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Destination</strong></td><td style="padding:8px;border:1px solid #eee">${destination || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Budget</strong></td><td style="padding:8px;border:1px solid #eee">${budget || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Durée / Dates</strong></td><td style="padding:8px;border:1px solid #eee">${dates || duree || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Voyageurs</strong></td><td style="padding:8px;border:1px solid #eee">${voyageurs || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Message</strong></td><td style="padding:8px;border:1px solid #eee">${message || '—'}</td></tr>
        </table>
      `,
    })

    // Email de confirmation au client
    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [contactEmail],
      subject: '✅ On a bien reçu ta demande – Heldonica Travel Planning',
      html: `
        <p>Bonjour ${firstName},</p>
        <p>On a bien reçu ta demande de Travel Planning sur mesure pour <strong>${destination || 'ta destination de rêve'}</strong> 🌍</p>
        <p>On revient vers toi sous <strong>48h</strong> avec une première proposition adaptée à vos envies.</p>
        <p>En attendant, tu peux explorer nos derniers carnets de voyage sur <a href="https://heldonica.fr/blog">notre blog</a>.</p>
        <br/>
        <p>À très vite,<br/><strong>L'équipe Heldonica</strong></p>
      `,
    })

    return NextResponse.json({ success: true, via: 'resend' })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}