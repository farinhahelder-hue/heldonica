export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { validateAlbumPhotoMeta } from '@/lib/photo-albums';
import { extractPhotoExif, detectStockPhoto, type PhotoExifResult } from '@/lib/photo-exif';

const BUCKET = 'photos';

let _cachedClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!_cachedClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      _cachedClient = createClient(url, key);
    }
  }
  return _cachedClient;
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const contentType = req.headers.get('content-type') || '';

  let imageUrl = '';
  let location = '';
  let date = '';
  let anecdote = '';
  let albumId = '';
  let latitude: number | null = null;
  let longitude: number | null = null;
  let exifResult: PhotoExifResult | null = null;

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      location = String(formData.get('location') || '').trim();
      date = String(formData.get('date') || formData.get('takenAt') || '').trim();
      anecdote = String(formData.get('anecdote') || '').trim();
      albumId = String(formData.get('albumId') || 'divers').trim();
      
      const rawLat = formData.get('latitude');
      const rawLng = formData.get('longitude');
      if (rawLat !== null && rawLat !== '') latitude = Number(rawLat);
      if (rawLng !== null && rawLng !== '') longitude = Number(rawLng);

      const existingUrl = formData.get('imageUrl');
      if (existingUrl) {
        imageUrl = String(existingUrl).trim();
      } else if (file) {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `${albumId}/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extraction automatique EXIF réelle (date, coordonnées GPS, appareil)
        exifResult = await extractPhotoExif(buffer, file.name);
        if (!date && exifResult.date) {
          date = exifResult.date;
        }
        if (latitude === null && exifResult.gps?.latitude !== undefined) {
          latitude = exifResult.gps.latitude;
        }
        if (longitude === null && exifResult.gps?.longitude !== undefined) {
          longitude = exifResult.gps.longitude;
        }

        const sb = getSupabaseClient();
        if (!sb) {
          return NextResponse.json(
            { error: 'Supabase non configuré pour le stockage' },
            { status: 503 }
          );
        }

        const { error: uploadError } = await sb.storage
          .from(BUCKET)
          .upload(filePath, buffer, { contentType: file.type || 'image/jpeg', upsert: true });

        if (uploadError) {
          return NextResponse.json(
            { error: `Erreur d'upload bucket : ${uploadError.message}` },
            { status: 500 }
          );
        }

        const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
        imageUrl = urlData?.publicUrl || '';
      }
    } else {
      const body = await req.json();
      imageUrl = String(body.imageUrl || '').trim();
      location = String(body.location || '').trim();
      date = String(body.date || body.takenAt || '').trim();
      anecdote = String(body.anecdote || '').trim();
      albumId = String(body.albumId || 'divers').trim();
      if (body.latitude !== undefined && body.latitude !== null) latitude = Number(body.latitude);
      if (body.longitude !== undefined && body.longitude !== null) longitude = Number(body.longitude);
      if (body.gps && typeof body.gps === 'object') {
        if (body.gps.latitude !== undefined) latitude = Number(body.gps.latitude);
        if (body.gps.longitude !== undefined) longitude = Number(body.gps.longitude);
      }
    }

    // Validation stricte TypeScript (règle n°1 : on n'invente rien)
    const validationPayload = {
      imageUrl,
      location,
      date,
      anecdote,
      albumId,
      gps: (latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude))
        ? { latitude, longitude }
        : undefined,
    };

    const validation = validateAlbumPhotoMeta(validationPayload);
    if (!validation.ok) {
      return NextResponse.json(
        { error: 'Données de photo invalides', issues: validation.issues },
        { status: 422 }
      );
    }

    const validData = validation.data;
    const sb = getSupabaseClient();
    if (!sb) {
      return NextResponse.json(
        { error: 'Supabase non configuré' },
        { status: 503 }
      );
    }

    const recordToInsert = {
      image_url: validData.imageUrl,
      location: validData.location,
      latitude: validData.gps?.latitude ?? null,
      longitude: validData.gps?.longitude ?? null,
      taken_at: validData.date,
      anecdote: validData.anecdote,
      album_id: validData.albumId || albumId,
    };

    const { data: savedRecord, error: insertError } = await (sb as any)
      .from('photo_blocks')
      .insert(recordToInsert)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Erreur d'insertion en base : ${insertError.message}` },
        { status: 500 }
      );
    }

    const stockInfo = exifResult
      ? { isStockCandidate: exifResult.isStockCandidate, reasons: exifResult.stockReasons }
      : detectStockPhoto(validData.imageUrl);

    return NextResponse.json({
      ok: true,
      photoBlock: savedRecord,
      exif: exifResult,
      isStockCandidate: stockInfo.isStockCandidate,
      stockReasons: stockInfo.reasons,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
