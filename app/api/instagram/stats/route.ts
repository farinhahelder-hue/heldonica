import { NextResponse } from 'next/server';
import { getRecentMedia, getInstagramProfile, getInstagramStats, isInstagramConfigured } from '@/lib/instagram';

export async function GET() {
  if (!isInstagramConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        profile: {
          id: 'heldonica-preview',
          username: 'heldonica',
          name: 'Heldonica • Slow Travel',
          account_type: 'BUSINESS',
          media_count: 12,
          followers_count: 1420,
          follows_count: 380,
        },
        stats: {
          reach: 4850,
          impressions: 12400,
          engagement_rate: '4.8%',
        },
        media: [
          {
            id: 'demo-1',
            caption: 'Achadas da Cruz par le téléphérique le plus raide d’Europe. Silence absolu et embruns de l’Atlantique.',
            media_url: '/images/destinations/madere/achadas_da_cruz.jpg',
            like_count: 124,
            comments_count: 18,
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'demo-2',
            caption: 'Fanal dans la brume : laurisylve millénaire classée UNESCO et lumière filtrante au petit matin.',
            media_url: '/images/destinations/madere/fanal_foret.jpg',
            like_count: 186,
            comments_count: 24,
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: 'demo-3',
            caption: 'Pico do Arieiro au lever du soleil : mer de nuages à 1 818 mètres d’altitude.',
            media_url: '/images/destinations/madere/pico_do_arieiro.jpg',
            like_count: 210,
            comments_count: 31,
            timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  }

  try {
    const [media, profile, stats] = await Promise.all([
      getRecentMedia(9),
      getInstagramProfile(),
      getInstagramStats(),
    ]);

    return NextResponse.json({
      configured: true,
      profile: profile || {
        username: 'heldonica',
        media_count: (media || []).length,
      },
      stats: stats || {},
      media: media || [],
    });
  } catch (error) {
    console.error('Instagram stats error:', error);
    return NextResponse.json(
      { configured: true, error: 'Failed to fetch Instagram stats' },
      { status: 500 }
    );
  }
}
