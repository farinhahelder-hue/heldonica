import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/cms/cloud/google/photos
// Fetches photos from Google Photos API
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_photos_token')?.value;
  
  if (!accessToken) {
    return NextResponse.json({ 
      error: 'not_connected', 
      message: 'Please connect Google Photos first' 
    });
  }
  
  const body = await req.json().catch(() => ({}));
  const pageSize = body.pageSize || 50;
  const pageToken = body.pageToken;
  
  try {
    // Call Google Photos Library API
    const searchParams = new URLSearchParams({
      pageSize: pageSize.toString(),
    });
    
    if (pageToken) {
      searchParams.append('pageToken', pageToken);
    }
    
    const response = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems:search?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      // If token expired, try to refresh
      if (response.status === 401) {
        return NextResponse.json({ error: 'expired', message: 'Token expired' });
      }
      return NextResponse.json({ error: 'api_error', details: error });
    }
    
    const data = await response.json();
    
    // Transform to our format
    const photos = (data.mediaItems || []).map((item: any) => ({
      id: item.id,
      name: item.filename,
      url: item.baseUrl + '=w1200-h1200',
      thumbnail: item.baseUrl + '=w200-h200',
      createdAt: item.mediaMetadata?.creationTime,
    }));
    
    return NextResponse.json({ 
      photos,
      nextPageToken: data.nextPageToken,
    });
  } catch (e) {
    console.error('Google Photos API error:', e);
    return NextResponse.json({ error: 'fetch_failed' });
  }
}