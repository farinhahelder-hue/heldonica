import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'

export async function GET(req: NextRequest) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const accessToken = req.headers.get('x-google-access-token')
  const pageToken = searchParams.get('pageToken')

  if (!accessToken) {
    return NextResponse.json({ error: 'Token Google manquant' }, { status: 400 })
  }

  try {
    const url = new URL('https://photoslibrary.googleapis.com/v1/mediaItems')
    url.searchParams.set('pageSize', '50')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Google API error: ' + err }, { status: response.status })
    }

    const data = await response.json()
    
    const photos = (data.mediaItems || []).map((item: any) => ({
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      baseUrl: item.baseUrl + '=d', // Add =d for download
      thumbnail: item.baseUrl + '=w200-h200'
    }))

    return NextResponse.json({
      photos,
      nextPageToken: data.nextPageToken
    })
  } catch (err) {
    console.error('Google Photos error:', err)
    return NextResponse.json({ error: 'Erreur Google Photos' }, { status: 500 })
  }
}