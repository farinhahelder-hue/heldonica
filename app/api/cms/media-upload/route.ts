import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const BUCKET = 'media';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = ((formData.get('folder') as string) || 'articles').replace(/\/$/, '');

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${folder}/${safeName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sb = supabaseAdmin();

    const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || `image/${ext}`,
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
