import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cms_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      const defaultContent = {
        site: {
          title: 'Heldonica',
          tagline: 'Expert en slow travel et consulting hôtelier',
          primaryColor: '#8B4513',
          secondaryColor: '#2D5016',
          accentColor: '#D4A574',
        },
        hero: {
          title: 'Découvrez le slow travel',
          subtitle: 'Des voyages authentiques, conçus pour vous',
          ctaText: 'Planifier mon voyage',
          ctaLink: '/travel-planning-form',
          mediaType: 'video',
          videoUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
          overlay: 0.4,
        },
      };
      return NextResponse.json(defaultContent);
    }

    // On restructure pour correspondre au format attendu par le frontend
    return NextResponse.json({
      site: {
        title: data.site_name,
        tagline: data.tagline,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        logo: data.logo_url,
        contactEmail: data.contact_email, // Assumé
      },
      hero: data.hero_content || {
        title: 'Découvrez le slow travel',
        subtitle: 'Des voyages authentiques, conçus pour vous',
        ctaText: 'Planifier mon voyage',
        ctaLink: '/travel-planning-form',
        mediaType: 'video',
        videoUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
        overlay: 0.4,
      }
    });
  } catch (error: any) {
    console.error('Erreur GET /api/cms/content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const content = await request.json();

    const { data: existing } = await supabase
      .from('cms_settings')
      .select('id')
      .single();

    const updateData = {
      site_name: content.site.title,
      tagline: content.site.tagline,
      primary_color: content.site.primaryColor,
      secondary_color: content.site.secondaryColor,
      logo_url: content.site.logo,
      hero_content: content.hero, // On stocke le reste en JSONB
      updated_at: new Date().toISOString()
    };

    let result;
    if (existing) {
      result = await supabase
        .from('cms_settings')
        .update(updateData)
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('cms_settings')
        .insert([updateData]);
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    console.error('Erreur POST /api/cms/content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
