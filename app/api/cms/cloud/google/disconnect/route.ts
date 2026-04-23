import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/cms/cloud/google/disconnect
// Clears Google tokens
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  
  cookieStore.delete('google_photos_token');
  cookieStore.delete('google_photos_refresh');
  
  return NextResponse.json({ success: true });
}