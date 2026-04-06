import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Créer le bucket 'media' s'il n'existe pas
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

    // 2. Ajouter une policy SELECT publique
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Public read media"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'media');
      `,
    }).catch(() => {
      // La policy SQL via rpc n'est pas toujours dispo — on ignore
    });

    return NextResponse.json({ ok: true, created: true, message: 'Bucket "media" créé avec succès !' });
  }

  return NextResponse.json({ ok: true, created: false, message: 'Bucket "media" existe déjà ✅' });
}
