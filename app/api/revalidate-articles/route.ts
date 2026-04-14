import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireCmsAuth } from '@/lib/cms-auth';

const SLUGS = [
  'madere-slow-travel-guide',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo',
  'urbex-paris-safe',
  'madere-quand-partir-sur-lile-de-leternel-printemps',
  'pepites-mystiques-de-madere',
  'prego-no-bolo-do-caco',
];

export async function GET(request: NextRequest) {
  const authError = requireCmsAuth(request);
  if (authError) return authError;

  const revalidated = [];
  for (const slug of SLUGS) {
    revalidatePath(`/blog/${slug}`);
    revalidated.push(slug);
  }
  revalidatePath('/blog');
  return NextResponse.json({ 
    revalidated,
    blog: true,
    timestamp: new Date().toISOString()
  });
}
