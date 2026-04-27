import { NextRequest, NextResponse } from 'next/server';

// POST /api/cms/cloud/google/callback
// Exchanges OAuth code for tokens
export async function POST(req: NextRequest) {
  const { code, state } = await req.json();
  
  if (!code) {
    return NextResponse.json({ error: 'no_code' });
  }
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const siteUrl = state || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr';
  const redirectUri = `${siteUrl}/cms/cloud/google-callback`;
  
  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json({ error: 'no_credentials' });
  }
  
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.access_token) {
      return NextResponse.json({ 
        success: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      });
    } else {
      console.error('Token exchange failed:', tokens);
      return NextResponse.json({ error: tokens.error || 'token_failed' });
    }
  } catch (e) {
    console.error('OAuth callback error:', e);
    return NextResponse.json({ error: 'exchange_failed' });
  }
}