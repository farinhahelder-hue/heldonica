import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SiteContent } from '@/models/SiteContent';

export async function GET() {
  try {
    await connectDB();
    
    let content = await SiteContent.findOne({});
    
    if (!content) {
      // Créer le contenu par défaut
      content = new SiteContent({
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
      });
      await content.save();
    }
    
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    let content = await SiteContent.findOne({});
    
    if (!content) {
      content = new SiteContent(data);
    } else {
      Object.assign(content, data);
    }
    
    await content.save();
    
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
