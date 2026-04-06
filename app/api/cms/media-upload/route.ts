import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const CMS_PASSWORD = process.env.CMS_PASSWORD || 'heldonica2024';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-cms-auth');
  return auth === CMS_PASSWORD;
}

// ─── POST : upload direct fichier local vers iDrive e2 ────────
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'articles';

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const bucket = process.env.IDRIVE_BUCKET || 'heldonica-media';
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const s3 = new S3Client({
      region: process.env.IDRIVE_REGION || 'us-east-1',
      endpoint: process.env.IDRIVE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || `image/${ext}`,
      ACL: 'public-read',
    }));

    const publicUrl = `${process.env.IDRIVE_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url: publicUrl, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
