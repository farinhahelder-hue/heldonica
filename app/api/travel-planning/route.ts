import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation basique
    if (!data.email || !data.phone || !data.travelMemory) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }

    // Vérifier le honeypot
    if (data.honeypot) {
      return NextResponse.json({ error: 'Formulaire rejeté' }, { status: 400 });
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Bloquer les domaines suspects
    const blockedDomains = ['mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = data.email.split('@')[1];
    if (blockedDomains.includes(domain)) {
      return NextResponse.json({ error: 'Domaine email non accepté' }, { status: 400 });
    }

    // 1. Notif admin Heldonica
    await resend.emails.send({
      from: 'Heldonica <noreply@heldonica.fr>',
      to: process.env.ADMIN_EMAIL || 'contact@heldonica.fr',
      subject: `✨ Nouvelle demande Travel Planning — ${data.tripType} · ${data.vibe}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D3D3D;">
          <div style="background: #6B2737; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">✨ Nouvelle demande Travel Planning</h1>
          </div>
          <div style="padding: 32px; background: #F8F4EF;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 180px;">Type de voyage</td><td>${data.tripType}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Vibe</td><td>${data.vibe}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Destination</td><td>${data.destination}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Durée</td><td>${data.duration} jours</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Budget</td><td>${data.budget}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Non-négociables</td><td>${data.requirements}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td>${data.email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone</td><td>${data.phone}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Souvenir de voyage</td><td style="font-style: italic;">${data.travelMemory}</td></tr>
            </table>
          </div>
          <div style="padding: 16px 32px; background: #2A7A6F; color: white; font-size: 13px;">
            Reçu le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      `,
    });

    // 2. Email de confirmation au visiteur
    await resend.emails.send({
      from: 'Heldonica <noreply@heldonica.fr>',
      to: data.email,
      subject: '✨ Ta demande Heldonica est bien reçue !',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D3D3D;">
          <div style="background: #6B2737; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Merci pour ta confiance ✨</h1>
          </div>
          <div style="padding: 32px; background: #F8F4EF;">
            <p style="font-size: 18px; line-height: 1.7;">On a bien reçu ta demande de Travel Planning.</p>
            <p style="line-height: 1.7;">On revient vers toi <strong>sous 48h</strong> avec une première approche personnalisée pour ton voyage <em>${data.tripType}</em> — vibe <em>${data.vibe}</em>.</p>
            <p style="line-height: 1.7;">En attendant, tu peux jeter un œil à nos carnets de voyage sur le blog pour nourrir ton inspiration.</p>
            <div style="margin: 32px 0; padding: 20px; background: white; border-left: 4px solid #2A7A6F; border-radius: 4px;">
              <p style="margin: 0; font-style: italic; color: #2A7A6F;">
                « Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple. »
              </p>
            </div>
            <a href="https://heldonica.fr/blog" style="display: inline-block; background: #6B2737; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Explorer le blog →</a>
          </div>
          <div style="padding: 16px 32px; background: #2A7A6F; color: white; font-size: 13px;">
            Heldonica · Slow Travel en couple · <a href="https://heldonica.fr" style="color: white;">heldonica.fr</a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès. Tu vas recevoir un email de confirmation !'
    });

  } catch (error: any) {
    console.error('Erreur Resend:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'envoi' }, { status: 500 });
  }
}
