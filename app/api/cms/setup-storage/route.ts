import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes dans Vercel.' },
      { status: 500 }
    );
  }

  // Vérifier si le bucket 'media' existe déjà
  const { data: existing } = await supabase.storage.getBucket('media');

  if (!existing) {
    const { error } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime'],
      fileSizeLimit: 52428800, // 50 MB (videos can be larger)
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true, message: 'Bucket "media" créé avec succès ✅' });
  }

  return NextResponse.json({ ok: true, created: false, message: 'Bucket "media" existe déjà ✅' });
}
