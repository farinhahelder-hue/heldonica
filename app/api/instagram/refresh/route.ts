import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { refreshLongLivedToken } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const result = await refreshLongLivedToken();
  if (!result) {
    return NextResponse.json({ error: 'Échec du rafraîchissement du token Instagram' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    expires_in_days: Math.round(result.expires_in / 86400),
    message: 'Token Instagram rafraîchi pour 60 jours supplémentaires.',
  });
}
