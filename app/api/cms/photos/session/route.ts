export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { createPickerSession, isPickerConfigured } from '@/lib/google-photos-picker';

/**
 * POST /api/cms/photos/session
 * Ouvre une session Google Photos Picker et renvoie le lien de sélection.
 *
 * Google impose que ce soit l'utilisateur qui coche ses médias dans son
 * interface : aucune API ne permet de s'en passer depuis mars 2025. Le CMS
 * supprime le terminal, pas ce clic.
 */
export async function POST(req: NextRequest) {
  const refus = await requireCmsAuth(req);
  if (refus) return refus;

  if (!isPickerConfigured()) {
    return NextResponse.json(
      {
        error: 'Google Photos non connecté.',
        detail:
          'Définis GOOGLE_PHOTOS_CLIENT_ID, GOOGLE_PHOTOS_CLIENT_SECRET et ' +
          'GOOGLE_PHOTOS_REFRESH_TOKEN dans Vercel. Le refresh token s\'obtient ' +
          'une seule fois avec scripts/auth_google_picker.py.',
      },
      { status: 503 }
    );
  }

  try {
    const session = await createPickerSession();
    return NextResponse.json({
      id: session.id,
      pickerUri: session.pickerUri,
      mediaItemsSet: Boolean(session.mediaItemsSet),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur Picker' }, { status: 502 });
  }
}
