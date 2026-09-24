import { NextResponse } from 'next/server';
import { getRecentMedia, getInstagramProfile, getInstagramStats, isInstagramConfigured } from '@/lib/instagram';

export async function GET() {
  if (!isInstagramConfigured()) {
    return NextResponse.json(
      { configured: false, error: 'Instagram not configured' },
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
      profile,
      stats,
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
