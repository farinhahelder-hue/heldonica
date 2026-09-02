export const dynamic = 'force-dynamic';
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import exifr from 'exifr';
import { requireCmsAuth } from '@/lib/cms-auth';
import {
  downloadMedia,
  getPickerSession,
  listPickedMedia,
  type PickedMedia,
} from '@/lib/google-photos-picker';

const BUCKET = 'media';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return url && key ? createClient(url, key) : null;
}

/**
 * GET — état de la session. Le panneau interroge cette route en boucle :
 * `pret` passe à true quand l'utilisateur a validé sa sélection côté Google.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const refus = await requireCmsAuth(req);
  if (refus) return refus;

  const { id } = await ctx.params;
  try {
    const session = await getPickerSession(id);
    return NextResponse.json({
      id: session.id,
      pret: Boolean(session.mediaItemsSet),
      pickerUri: session.pickerUri,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Session introuvable' }, { status: 502 });
  }
}

/**
 * Le GPS et l'horodatage de prise de vue sont les seuls faits de vécu qu'une
 * machine peut établir seule. Tout le reste — ressenti, prix, horaires — reste
 * du ressort de l'auteur : c'est la ligne que trace AGENTS.md, et la raison
 * d'être de ce registre.
 */
async function lireExif(buffer: Buffer) {
  try {
    const d = await exifr.parse(buffer, { gps: true, tiff: true, exif: true });
    if (!d) return { lat: null, lon: null, prise: null, appareil: null };

    const prise: Date | undefined = d.DateTimeOriginal || d.CreateDate || d.ModifyDate;
    return {
      lat: typeof d.latitude === 'number' ? d.latitude : null,
      lon: typeof d.longitude === 'number' ? d.longitude : null,
      prise: prise instanceof Date && !isNaN(prise.valueOf()) ? prise.toISOString() : null,
      appareil: [d.Make, d.Model].filter(Boolean).join(' ').trim() || null,
    };
  } catch {
    return { lat: null, lon: null, prise: null, appareil: null };
  }
}

/**
 * POST — importe la sélection : téléchargement, dépôt dans Supabase Storage,
 * extraction EXIF puis enregistrement dans `cms_media`.
 *
 * Le registre vit en base et non dans un fichier : sur Vercel le système de
 * fichiers est en lecture seule, `content/evidence/*.json` n'y survivrait pas.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const refus = await requireCmsAuth(req);
  if (refus) return refus;

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  const { id } = await ctx.params;
  const { destination = 'roumanie', limite = 200 } = await req.json().catch(() => ({}));
  const dossier = String(destination).replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'divers';

  try {
    const session = await getPickerSession(id);
    if (!session.mediaItemsSet) {
      return NextResponse.json(
        { error: 'Sélection non validée. Termine le choix dans Google Photos puis réessaie.' },
        { status: 409 }
      );
    }

    const items: PickedMedia[] = (await listPickedMedia(id)).slice(0, Number(limite) || 200);

    let importes = 0;
    let ignores = 0;
    const echecs: string[] = [];
    const sansGps: string[] = [];

    for (const item of items) {
      const mf = item.mediaFile;
      if (!mf?.baseUrl) { ignores++; continue; }

      const nom = (mf.filename || `${item.id}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const estVideo = Boolean(mf.mimeType?.startsWith('video/'));
      const chemin = `destinations/${dossier}/${nom}`;

      try {
        const buffer = await downloadMedia(mf.baseUrl, estVideo);

        const { error: erreurUpload } = await sb.storage
          .from(BUCKET)
          .upload(chemin, buffer, {
            contentType: mf.mimeType || (estVideo ? 'video/mp4' : 'image/jpeg'),
            upsert: true,
          });
        if (erreurUpload) throw new Error(erreurUpload.message);

        const url = sb.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;
        // exifr ne lit que les images ; pour une vidéo on retombe sur la date
        // de création fournie par Google, sans coordonnées.
        const meta = estVideo
          ? { lat: null, lon: null, prise: item.createTime ?? null, appareil: null }
          : await lireExif(buffer);

        if (!estVideo && meta.lat === null) sansGps.push(nom);

        const { error: erreurBase } = await (sb as any).from('cms_media').upsert(
          {
            filename: nom,
            url,
            // Noms alignes sur la table reelle : la migration d'origine declare
            // file_path / file_type / file_size, dont la production a diverge.
            path: chemin,
            mime_type: mf.mimeType ?? (estVideo ? 'video/mp4' : 'image/jpeg'),
            size: buffer.length,
            source: 'gphotos',
            google_photo_id: item.id,
            latitude: meta.lat,
            longitude: meta.lon,
            taken_at: meta.prise,
            metadata: {
              appareil: meta.appareil,
              mime: mf.mimeType ?? null,
              largeur: mf.mediaFileMetadata?.width ?? null,
              hauteur: mf.mediaFileMetadata?.height ?? null,
              destination: dossier,
            },
          },
          { onConflict: 'google_photo_id' }
        );
        if (erreurBase) throw new Error(erreurBase.message);

        importes++;
      } catch (e: any) {
        echecs.push(`${nom} : ${e?.message ?? 'erreur'}`);
      }
    }

    return NextResponse.json({
      succes: true,
      destination: dossier,
      selectionnes: items.length,
      importes,
      ignores,
      sans_gps: sansGps.length,
      // Une photo sans GPS ne prouve aucun lieu : elle reste utilisable comme
      // visuel, mais n'alimentera pas le registre.
      sans_gps_exemples: sansGps.slice(0, 5),
      echecs: echecs.slice(0, 10),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Import impossible' }, { status: 502 });
  }
}
