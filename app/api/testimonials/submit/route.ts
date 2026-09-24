import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: Request) {
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
