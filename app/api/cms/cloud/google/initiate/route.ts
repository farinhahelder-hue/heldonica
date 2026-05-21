import { NextRequest, NextResponse } from 'next/server';

// POST /api/cms/cloud/google/initiate
// Initiates Google OAuth flow for Google Photos API
export async function POST(req: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Check if OAuth credentials are configured
  if (!googleClientId || !googleClientSecret) {
    // Demo mode - return demo flag so UI can show demo
    return NextResponse.json({ 
      demo: true,
      message: 'OAuth not configured - running in demo mode' 
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr';
  const redirectUri = `${siteUrl}/cms/cloud/google-callback`;
  const scope = 'https://www.googleapis.com/auth/photoslibrary.readonly';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(siteUrl)}`;

  return NextResponse.json({ authUrl, redirectUri });
}