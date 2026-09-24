import { NextRequest, NextResponse } from 'next/server';
import { postToInstagram, isInstagramConfigured, lireDerniereErreurInstagram } from '@/lib/instagram';
import { requireCmsAuth } from '@/lib/cms-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * API route to publish content to Instagram
 * 
 * POST body:
 * {
 *   imageUrl: string,  // Required: URL of the image to post
 *   caption: string    // Required: Post caption
 * }
 * 
 * Requires INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID env vars
 */
export async function POST(request: NextRequest) {
  // Cette route publiait sur le compte reel sans verifier son appelant :
  // n'importe qui connaissant l'URL pouvait poster une image et une legende
  // sous le nom d'Heldonica des que le token Meta serait pose.
  const refus = await requireCmsAuth(request);
  if (refus) return refus;
  if (!rateLimit(getClientIp(request), 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  // Check if Instagram is configured
  if (!isInstagramConfigured()) {
    return NextResponse.json(
      { error: 'Instagram not configured. Please set environment variables.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { imageUrl, caption } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    if (!caption) {
      return NextResponse.json(
        { error: 'caption is required' },
        { status: 400 }
      );
    }

    // Post to Instagram
    const result = await postToInstagram(imageUrl, caption);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to publish to Instagram', detail: lireDerniereErreurInstagram() },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      post: result,
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check Instagram configuration status
 */
export async function GET() {
  const configured = isInstagramConfigured();
  
  return NextResponse.json({
    configured,
    message: configured 
      ? 'Instagram is ready to use'
      : 'Instagram requires configuration. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables.',
  });
}