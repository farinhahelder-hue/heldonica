import { NextRequest, NextResponse } from 'next/server';

// POST /api/cms/cloud/idrive/initiate
// Initiates iDrive OAuth flow for file access
export async function POST(req: NextRequest) {
  const idriveClientId = process.env.IDRIVE_CLIENT_ID;
  const idriveClientSecret = process.env.IDRIVE_CLIENT_SECRET;
  
  // Check if OAuth credentials are configured
  if (!idriveClientId || !idriveClientSecret) {
    // Demo mode
    return NextResponse.json({ 
      demo: true,
      message: 'OAuth not configured - running in demo mode' 
    });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr'}/api/cms/cloud/idrive/callback`;
  
  const authUrl = `https://IDriveAuth-beta.io/auth?` +
    `client_id=${idriveClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=read`;

  return NextResponse.json({ authUrl });
}