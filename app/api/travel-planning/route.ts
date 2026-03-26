import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation basique
    if (!data.email || !data.phone || !data.travelMemory) {
      return NextResponse.json(
        { error: 'Données incomplètes' },
        { status: 400 }
      );
    }

    // Vérifier le honeypot
    if (data.honeypot) {
      return NextResponse.json(
        { error: 'Formulaire rejeté' },
        { status: 400 }
      );
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Bloquer les domaines suspects
    const blockedDomains = ['mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = data.email.split('@')[1];
    if (blockedDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Domaine email non accepté' },
        { status: 400 }
      );
    }

    // TODO: Envoyer un email de confirmation (Double Opt-In)
    // TODO: Sauvegarder dans une base de données
    // TODO: Envoyer une notification à l'admin

    console.log('Travel Planning Request:', {
      tripType: data.tripType,
      vibe: data.vibe,
      destination: data.destination,
      duration: data.duration,
      budget: data.budget,
      requirements: data.requirements,
      email: data.email,
      phone: data.phone,
      travelMemory: data.travelMemory,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Demande reçue avec succès. Vérifiez votre email.'
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
