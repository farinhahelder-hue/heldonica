import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

// Brevo subscription helper — non-blocking
async function subscribeToBrevo(email: string, destinationSlug: string): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY
  if (!brevoApiKey) return

  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [2], // "Newsletter Heldonica"
        updateEnabled: true,
        attributes: {
          GUIDE_TELECHARGE: destinationSlug,
        },
      }),
    })
  } catch (err) {
    // Non-blocking: log but don't fail the download
    console.error('Brevo subscription failed:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { destinationSlug, email } = await request.json()

    if (!destinationSlug || typeof destinationSlug !== 'string') {
      return NextResponse.json({ error: 'destinationSlug requis' }, { status: 400 })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email valide requis' }, { status: 400 })
    }

    let destData: Record<string, any> | null = null
    let articles: Record<string, any>[] = []

    if (supabase) {
      const { data: d } = await (supabase as any)
        .from('destinations_public')
        .select('*')
        .eq('slug', destinationSlug)
        .single()
      destData = d || null

      const { data: a } = await (supabase as any)
        .from('articles')
        .select('title, excerpt, slug')
        .eq('published', true)
        .eq('archived', false)
        .contains('tags', [destinationSlug])
        .limit(5)
      if (a) articles = a

      await (supabase as any)
        .from('guide_downloads')
        .insert({
          guide_slug: destinationSlug,
          email,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
          user_agent: request.headers.get('user-agent') || '',
        })
        .then(() => {}).catch(() => {})
    }

    // Subscribe to Brevo — non-blocking
    await subscribeToBrevo(email, destinationSlug)

    const { TravelGuidePDF } = await import('@/lib/pdf-generator')
    const React = await import('react')
    const { renderToStream } = await import('@react-pdf/renderer')

    const guideData = {
      title: destData?.title || destinationSlug,
      subtitle: destData?.teaser || undefined,
      destinationSlug,
      country: destData?.country || undefined,
      flagEmoji: destData?.flag_emoji || undefined,
      travelStyle: destData?.travel_style || undefined,
      bestSeason: destData?.best_season || undefined,
      avgBudget: destData?.avg_budget_couple_week || undefined,
      heroImage: destData?.hero_unsplash_url || destData?.featured_image || undefined,
      articles: articles.map((a: any) => ({
        title: a.title,
        excerpt: a.excerpt || '',
        slug: a.slug,
      })),
    }

    const pdfElement = React.createElement(TravelGuidePDF, { data: guideData }) as unknown as React.ReactElement<import('@react-pdf/renderer').DocumentProps>
    const pdfStream = await renderToStream(pdfElement)

    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="guide-${destinationSlug}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Guide download error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 })
  }
}
