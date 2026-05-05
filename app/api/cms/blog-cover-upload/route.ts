import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const BUCKET = 'blog-images';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );
}

export async function POST(req: NextRequest) {
  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const slug = (formData.get('slug') as string) || 'cover';

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const safeSlug = slug.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  const filename = `${safeSlug}-cover.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sb = supabaseAdmin();

    const { error } = await sb.storage.from(BUCKET).upload(filename, buffer, {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl, key: filename });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}