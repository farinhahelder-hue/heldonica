import { NextRequest, NextResponse } from 'next/server'

// Rate limiting en mémoire Edge (reset à chaque cold start — suffisant pour un blog)
const rateMap = new Map<string, number[]>()

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Rate limit sur les routes API sensibles
  if (
    pathname.startsWith('/api/instagram') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/travel-planning')
  ) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    const now = Date.now()
    const windowMs = 60_000 // 1 minute
    const maxRequests = 5

    const timestamps = (rateMap.get(ip) ?? []).filter(
      (t) => now - t < windowMs
    )

    if (timestamps.length >= maxRequests) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain',
        },
      })
    }

    rateMap.set(ip, [...timestamps, now])
  }

  // Bloquer l'accès direct à /cms-admin depuis des user-agents bots connus
  if (pathname.startsWith('/cms-admin')) {
    const ua = req.headers.get('user-agent') ?? ''
    const isBot = /bot|crawler|spider|crawling/i.test(ua)
    if (isBot) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/cms-admin/:path*',
  ],
}