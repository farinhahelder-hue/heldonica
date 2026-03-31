import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const body = await req.json()
    const { nom, email, telephone, destination, budget, duree, voyageurs, message } = body

    // Email à vous (notification admin)
    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'contact@heldonica.fr'],
      subject: `✈️ Nouvelle demande Travel Planning – ${destination || 'Destination non précisée'}`,
      html: `
        <h2>Nouvelle demande de Travel Planning</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Nom</strong></td><td style="padding:8px;border:1px solid #eee">${nom}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Email</strong></td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Téléphone</strong></td><td style="padding:8px;border:1px solid #eee">${telephone || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Destination</strong></td><td style="padding:8px;border:1px solid #eee">${destination || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Budget</strong></td><td style="padding:8px;border:1px solid #eee">${budget || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Durée</strong></td><td style="padding:8px;border:1px solid #eee">${duree || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Voyageurs</strong></td><td style="padding:8px;border:1px solid #eee">${voyageurs || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee"><strong>Message</strong></td><td style="padding:8px;border:1px solid #eee">${message || '—'}</td></tr>
        </table>
      `,
    })

    // Email de confirmation au client
    await resend.emails.send({
      from: 'Heldonica <onboarding@resend.dev>',
      to: [email],
      subject: '✅ On a bien reçu ta demande – Heldonica Travel Planning',
      html: `
        <p>Bonjour ${nom},</p>
        <p>On a bien reçu ta demande de Travel Planning sur mesure pour <strong>${destination || 'ta destination de rêve'}</strong> 🌍</p>
        <p>On revient vers toi sous <strong>48h</strong> avec une première proposition adaptée à vos envies.</p>
        <p>En attendant, tu peux explorer nos derniers carnets de voyage sur <a href="https://heldonica.fr">heldonica.fr</a>.</p>
        <br/>
        <p>À très vite,<br/><strong>L'équipe Heldonica</strong></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}