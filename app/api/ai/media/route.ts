import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/ai/media - Get optimized media URLs (images, videos)
// Query params: type, article_id, limit

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('article_id')
  const type = searchParams.get('type') || 'image' // image | video
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!articleId) {
    return NextResponse.json({ error: 'article_id required' }, { status: 400 })
  }

  // Get article to find media
  const { data: article, error } = await supabase
    .from('cms_blog_posts')
    .select('id,title,featured_image,content')
    .eq('id', articleId)
    .single()

  if (error || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const media: any[] = []

  // Featured image
  if (article.featured_image) {
    media.push({
      type: 'image',
      url: article.featured_image,
      role: 'featured',
      optimized: optimizeUrl(article.featured_image),
    })
  }

  // Extract images from content
  const imgMatches = article.content?.match(/<img[^>]+src="([^"]+)"/g) || []
  for (const match of imgMatches) {
    const url = match.match(/src="([^"]+)"/)?.[1]
    if (url) {
      media.push({
        type: 'image',
        url,
        role: 'content',
        optimized: optimizeUrl(url),
      })
    }
  }

  // Extract video embeds
  const videoMatches = article.content?.match(/<iframe[^>]+src="([^"]+(youtube|vimeo)[^"]+)"/g) || []
  for (const match of videoMatches) {
    const url = match.match(/src="([^"]+)"/)?.[1]
    if (url) {
      media.push({
        type: 'video',
        url,
        role: 'embed',
        thumbnail: getVideoThumbnail(url),
        platform: url.includes('youtube') ? 'youtube' : 'vimeo',
      })
    }
  }

  return NextResponse.json({
    article_id: articleId,
    title: article.title,
    media: media.slice(0, limit),
  })
}

// POST /api/ai/media - Upload media (image/video)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, url, article_id, role } = body

    if (action === 'analyze') {
      // Analyze image/video and get metadata
      const metadata = await analyzeMedia(url)
      return NextResponse.json({ url, metadata })
    }

    if (action === 'optimize') {
      // Return optimized URLs for different contexts
      return NextResponse.json({
        original: url,
        optimized: {
          thumbnail: optimizeUrl(url, 400),
          card: optimizeUrl(url, 800),
          full: optimizeUrl(url, 1200),
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Helpers
function optimizeUrl(url: string, width: number = 800): string {
  if (!url) return url
  
  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0]
    return `${base}?w=${width}&q=80&fm=webp`
  }
  
  // Cloudinary (if used)
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
  }
  
  // Add width param for other services
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}w=${width}`
}

function getVideoThumbnail(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`
  }
  
  return null
}

async function analyzeMedia(url: string): Promise<any> {
  // Basic analysis - in production this could call AI vision API
  const metadata: any = {
    url,
    analyzed_at: new Date().toISOString(),
  }
  
  // Check if image
  if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i)) {
    metadata.type = 'image'
    metadata.dimensions = 'unknown' // Could use AI to detect
    metadata.alt_suggestion = 'Image for article'
  }
  
  // Check if video
  if (url.includes('youtube') || url.includes('vimeo')) {
    metadata.type = 'video'
    metadata.platform = url.includes('youtube') ? 'youtube' : 'vimeo'
  }
  
  return metadata
}