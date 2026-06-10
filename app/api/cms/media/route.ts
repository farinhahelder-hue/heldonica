export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const BUCKET = 'media';

let _cached: ReturnType<typeof createClient> | null = null;
function supabaseAdmin() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = (url && key) ? createClient(url, key) : null;
  }
  return _cached;
}

// GET : lister les fichiers du bucket Supabase Storage
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const prefix = req.nextUrl.searchParams.get('prefix') || 'articles';
  const folder = prefix.replace(/\/$/, '');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

  try {
    const sb = supabaseAdmin();
    if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
    const { data, error } = await sb.storage.from(BUCKET).list(folder, {
      limit,
      offset,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw new Error(error.message);

    const files = (data || [])
      .filter(f => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(f.name))
      .map(f => {
        const path = `${folder}/${f.name}`;
        const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
        return {
          key: path,
          name: f.name,
          size: f.metadata?.size,
          lastModified: f.created_at,
          url: urlData.publicUrl,
        };
      });

    return NextResponse.json({ files, source: 'supabase', offset, limit, hasMore: files.length === limit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST : importer depuis une URL (Google Photos) vers Supabase Storage
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const { imageUrl, filename, folder: folderParam } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl requis' }, { status: 400 });

  const folder = (folderParam || 'articles').replace(/\/$/, '');
  const safeFilename = filename || `import-${Date.now()}.jpg`;
  const path = `${folder}/${safeFilename}`;


  try {
    const parsedUrl = new URL(imageUrl);
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Seules les URLs HTTPS sont autorisées' }, { status: 400 });
    }

    const allowedDomains = ['images.unsplash.com', 'dropbox.com', 'storage.googleapis.com'];
    const allowedSuffixes = ['.googleusercontent.com', '.supabase.co', '.behold.pictures'];

    const isAllowed = allowedDomains.includes(parsedUrl.hostname) || allowedSuffixes.some(suffix => parsedUrl.hostname.endsWith(suffix));

    if (!isAllowed) {
      return NextResponse.json({ error: 'Domaine non autorisé pour l\'importation d\'images' }, { status: 403 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Impossible de télécharger l'image : ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    const sb = supabaseAdmin();
    if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
    const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl, key: path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE : supprimer un fichier du bucket
export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  const { error } = await sb.storage.from(BUCKET).remove([key]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
