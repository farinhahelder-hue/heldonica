import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

const CMS_PASSWORD = process.env.CMS_PASSWORD || 'heldonica2024';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-cms-auth');
  return auth === CMS_PASSWORD;
}

// ─── Client iDrive e2 S3-compatible ───────────────────────────
function getS3Client() {
  return new S3Client({
    region: process.env.IDRIVE_REGION || 'us-east-1',
    endpoint: process.env.IDRIVE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  });
}

// ─── GET : lister les fichiers iDrive ─────────────────────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const bucket = process.env.IDRIVE_BUCKET || 'heldonica-media';
  const prefix = req.nextUrl.searchParams.get('prefix') || 'articles/';

  try {
    const s3 = getS3Client();
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 100,
    });
    const res = await s3.send(cmd);

    const files = (res.Contents || [])
      .filter(obj => obj.Key && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(obj.Key))
      .map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        url: `${process.env.IDRIVE_PUBLIC_URL}/${obj.Key}`,
        name: obj.Key!.split('/').pop(),
      }));

    return NextResponse.json({ files, source: 'idrive' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST : importer depuis URL (Google Photos) vers iDrive ──
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { imageUrl, filename } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl requis' }, { status: 400 });

  const bucket = process.env.IDRIVE_BUCKET || 'heldonica-media';
  const safeFilename = filename || `import-${Date.now()}.jpg`;
  const key = `articles/${safeFilename}`;

  try {
    // 1. Télécharger l'image depuis l'URL source
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Impossible de télécharger l'image : ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    // 2. Uploader vers iDrive e2
    const s3 = getS3Client();
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    }));

    const publicUrl = `${process.env.IDRIVE_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url: publicUrl, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
