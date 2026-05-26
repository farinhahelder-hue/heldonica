import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// POST /api/cms/cloud/google/disconnect
// Clears Google tokens
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;
  
  const cookieStore = await cookies()
  
  cookieStore.delete('google_photos_token');
  cookieStore.delete('google_photos_refresh');
  
  return NextResponse.json({ success: true });
}