import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { requireCmsAuth } from '@/lib/cms-auth';

const BUCKET = 'public';

let _cached: ReturnType<typeof createClient> | null = null;
function supabaseAdmin() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = (url && key) ? createClient(url, key) : null;
  }
  return _cached;
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = 'images';

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  try {
    let buffer = Buffer.from(await file.arrayBuffer());
    let contentType = file.type || 'image/jpeg';
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    if (contentType.startsWith('image/')) {
       // Convert to WebP and resize to max 1200px width
       buffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = 'image/webp';
      ext = 'webp';
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_').split('.')[0]}.${ext}`;
    const path = `${folder}/${safeName}`;

    const sb = supabaseAdmin();
    if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

    const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    });

    if (error) throw new Error(error.message);

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl, key: path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
