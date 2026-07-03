import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

export interface CmsHomeDestination {
  id: string
  destination_slug: string
  display_order: number
  is_featured: boolean
  custom_title: string | null
  custom_description: string | null
  custom_image_url: string | null
  // Joined data from destinations table
  title?: string
  tagline?: string
  hero_unsplash_url?: string
  country?: string
  flag_emoji?: string
}

export interface CmsHomeDestinationsResponse {
  success: boolean
  destinations?: CmsHomeDestination[]
  error?: string
}

/**
 * GET /api/cms/home-destinations
 * Fetch destinations configured for homepage display
 * Uses cms_home_destinations joined with destinations table
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch home destinations with joined destination data
    const { data: homeDests, error: homeError } = await supabase
      .from('cms_home_destinations')
      .select(`
        id,
        destination_slug,
        display_order,
        is_featured,
        custom_title,
        custom_description,
        custom_image_url
      `)
      .eq('is_active', true)
      .order('display_order')

    if (homeError) {
      console.error('[CMS Home Destinations API] Fetch error:', homeError)
      return NextResponse.json(
        { success: false, error: homeError.message },
        { status: 500 }
      )
    }

    // Get destination details for each home destination
    const destinationSlugs = (homeDests || []).map((d: any) => d.destination_slug)

    let destinationsWithDetails: CmsHomeDestination[] = []

    if (destinationSlugs.length > 0) {
      const { data: destData, error: destError } = await supabase
        .from('destinations')
        .select('slug, title, tagline, hero_unsplash_url, country, flag_emoji')
        .in('slug', destinationSlugs)
        .eq('published', true)

      if (destError) {
        console.error('[CMS Home Destinations API] Destinations fetch error:', destError)
      }

      // Merge home destination config with destination details
      const destMap = new Map((destData || []).map((d: any) => [d.slug, d]))
      
      destinationsWithDetails = (homeDests || []).map((homeDest: any) => {
        const dest = destMap.get(homeDest.destination_slug) as any
        return {
          ...homeDest,
          title: homeDest.custom_title || dest?.title || homeDest.destination_slug,
          tagline: dest?.tagline || null,
          hero_unsplash_url: homeDest.custom_image_url || dest?.hero_unsplash_url || null,
          country: dest?.country || null,
          flag_emoji: dest?.flag_emoji || null,
        }
      })
    }

    return NextResponse.json(
      { success: true, destinations: destinationsWithDetails },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[CMS Home Destinations API] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
