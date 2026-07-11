import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limiter: 5 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false
  }
  
  entry.count++
  return true
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') || // Cloudflare
         'unknown'
}

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
  // Rate limiting
  const clientIP = getClientIP(req)
  if (!checkRateLimit(clientIP)) {
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
    const body = await req.json()
    const {
      prenom,
      email,
      destination,
      travelers,
      duree,
      budget,
      date_depart,
      message,
    } = body

    // Honeypot anti-spam
    if (body.website_url) {
      return NextResponse.json({ success: true })
    }

    // Validation basique
    if (!prenom || !email || !destination) {
      return NextResponse.json(
        { error: 'Ton prénom, ton email et ta destination sont obligatoires.' },
        { status: 400 }
      )
    }

    // 1. Sauvegarde Supabase
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 503 })
    }
    
    const { error: dbError } = await supabase
      .from('demandes_travel')
      .insert({
        prenom,
        email,
        destination,
        duree_jours: duree || null,
        budget_fourchette: budget || null,
        mois_depart: date_depart || null,
        notes: message || null,
        statut: 'new',
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
    }

    // 2. Intégration Brevo
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
              PRENOM: prenom,
              DESTINATION: destination,
              TRAVELERS: travelers || '',
              DUREE: duree || '',
              BUDGET: budget || '',
              DATE_DEPART: date_depart || '',
            },
            listIds: [2], // ID liste Brevo
            updateEnabled: true,
          }),
        })

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

    const sPrenom = escapeHtml(prenom);
    const sEmail = escapeHtml(email);
    const sDestination = escapeHtml(destination);
    const sTravelers = escapeHtml(travelers);
    const sDuree = escapeHtml(duree);
    const sBudget = escapeHtml(budget);
    const sDateDepart = escapeHtml(date_depart);
    const sMessage = escapeHtml(message);

    // 3. Email interne à Heldonica
    if (resend) {
      const internalEmails = ['bonjour@heldonica.fr', 'contact@heldonica.fr'];
      for (const recipient of internalEmails) {
        await resend.emails.send({
          from: 'Heldonica <contact@heldonica.fr>',
          to: recipient,
          subject: `✈️ Nouvelle demande — ${sPrenom} vers ${sDestination}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f6f2;">
              <h1 style="color: #6b2a1a; font-size: 24px; margin-bottom: 8px;">Nouvelle demande de Travel Planning</h1>
              <p style="color: #7a7974; margin-bottom: 32px; font-size: 14px;">Reçue le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; width: 40%; color: #28251d;">Prénom</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sPrenom}</td></tr>
                <tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Email</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5;"><a href="mailto:${sEmail}" style="color: #6b2a1a;">${sEmail}</a></td></tr>
                <tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Destination</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDestination}</td></tr>
                ${travelers ? `<tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Voyageurs</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sTravelers}</td></tr>` : ''}
                ${duree ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Durée</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDuree}</td></tr>` : ''}
                ${budget ? `<tr><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Budget</td><td style="padding: 12px; background: #f9f8f5; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sBudget}</td></tr>` : ''}
                ${date_depart ? `<tr><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; font-weight: bold; color: #28251d;">Date de départ</td><td style="padding: 12px; background: #fff; border-bottom: 1px solid #dcd9d5; color: #28251d;">${sDateDepart}</td></tr>` : ''}
              </table>

              ${message ? `<div style="margin-top: 24px; padding: 16px; background: #fff; border-left: 3px solid #6b2a1a;"><p style="font-weight: bold; margin-bottom: 8px; color: #28251d;">Message :</p><p style="color: #28251d; line-height: 1.6;">${sMessage}</p></div>` : ''}

              <div style="margin-top: 32px; text-align: center;">
                <a href="mailto:${sEmail}?subject=Re: Votre demande Travel Planning — ${sDestination}" style="display: inline-block; background: #6b2a1a; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: bold;">Répondre à ${sPrenom}</a>
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
              <h1 style="color: #6b2a1a; font-size: 28px; margin: 0 0 8px 0;">Merci ${sPrenom} !</h1>
              <p style="color: #1a1a1a; font-size: 16px; margin: 0; line-height: 1.6;">
                On a bien reçu ton projet pour <strong>${sDestination}</strong>.
              </p>
            </div>
            
            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
              On prend le temps de lire ton brief avant de te répondre avec une proposition concrète.<br />
              <em style="color: #555;">Pas de réponse automatique ici.</em>
            </p>
            
            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
              On revient vers toi <strong>sous 48h</strong> avec un vrai retour — nos premières idées, et peut-être quelques questions pour affiner ce voyage sur mesure.
            </p>

            <div style="background: #f7f6f2; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #6b2a1a;">
              <h2 style="color: #6b2a1a; font-size: 14px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Récap de ta demande</h2>
              <p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">🗺️ <strong>Destination :</strong> ${sDestination}</p>
              ${travelers ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">👥 <strong>Voyageurs :</strong> ${sTravelers}</p>` : ''}
              ${duree ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">📅 <strong>Durée :</strong> ${sDuree}</p>` : ''}
              ${budget ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">💶 <strong>Budget :</strong> ${sBudget}</p>` : ''}
              ${date_depart ? `<p style="margin: 8px 0; color: #1a1a1a; font-size: 15px;">🛫 <strong>Départ :</strong> ${sDateDepart}</p>` : ''}
            </div>

            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.7; margin-bottom: 8px;">
              À très vite,
            </p>
            <p style="color: #6b2a1a; font-size: 18px; font-style: italic; margin: 0;">L'équipe Heldonica</p>
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
    console.error('Demandes travel API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
