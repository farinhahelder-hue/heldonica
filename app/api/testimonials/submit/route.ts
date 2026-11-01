import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Depot public : l'insertion passe par la cle de service, donc rien ne
  // bornait le nombre de temoignages qu'une seule adresse pouvait deposer.
  // Meme bride que /api/brevo/subscribe : 10 par heure glissante.
  const debit = checkRateLimit(getClientIp(req), { limit: 10, prefix: 'testimonials-submit' });
  if (!debit.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { name, location, destination, quote, rating } = body;

    if (!name || !quote || !destination) {
      return NextResponse.json(
        { error: 'Nom, destination et témoignage sont obligatoires.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('cms_testimonials')
      .insert([
        {
          name: name.trim(),
          location: (location || '').trim(),
          destination: destination.trim(),
          quote: quote.trim(),
          rating: Number(rating) || 5,
          source: 'client_form',
          is_active: false, // Modération manuelle obligatoire avant publication
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[API Testimonials Submit] Error:', error.message);
      return NextResponse.json({ error: 'Erreur lors de l’enregistrement.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Merci infiniment pour votre retour. Il sera relu et validé par notre duo avant publication.',
      id: data.id,
    });
  } catch (err) {
    console.error('[API Testimonials Submit] Exception:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
