import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prenom, nom, email, telephone,
      destination, style_voyage, duree_jours,
      budget_fourchette, nb_voyageurs,
      mois_depart, notes
    } = body;

    if (!prenom || !nom || !email) {
      return NextResponse.json(
        { error: 'Prénom, nom et email sont obligatoires' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('demandes_travel')
      .insert([{
        prenom,
        nom,
        email,
        telephone: telephone || null,
        destination: destination || null,
        style_voyage: style_voyage || null,
        duree_jours: duree_jours ? parseInt(duree_jours) : null,
        budget_fourchette: budget_fourchette || null,
        nb_voyageurs: nb_voyageurs ? parseInt(nb_voyageurs) : 2,
        mois_depart: mois_depart || null,
        notes: notes || null,
        statut: 'nouvelle'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Appel direct à l'Edge Function pour garantir l'envoi email
    // (double sécurité en plus du trigger Postgres)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-travel-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ record: data })
        }
      );
    } catch (emailErr) {
      // Ne pas bloquer la réponse si l'email échoue
      console.error('Email notification failed:', emailErr);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Erreur inattendue' }, { status: 500 });
  }
}
