import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authError = requireCmsAuth(req);
  if (authError) return authError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: 'Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes dans Vercel.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Vérifier si le bucket 'media' existe déjà
  const { data: existing } = await supabase.storage.getBucket('media');

  if (!existing) {
    const { error } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
      fileSizeLimit: 10485760, // 10 MB
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true, message: 'Bucket "media" créé avec succès ✅' });
  }

  return NextResponse.json({ ok: true, created: false, message: 'Bucket "media" existe déjà ✅' });
}
