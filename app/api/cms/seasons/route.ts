import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

export interface CmsSeason {
  id: string
  destination_key: string
  name: string
  emoji: string
  months: string[]
  weather: string
  crowd: 'low' | 'medium' | 'high'
  price: 'low' | 'medium' | 'high'
  description: string
  is_active: boolean
  display_order: number
}

export interface CmsSeasonsResponse {
  success: boolean
  seasons?: CmsSeason[]
  error?: string
}

/**
 * GET /api/cms/seasons
 * Fetch seasons for a destination or all seasons
 * Query params: destination (optional) - destination_key to filter by
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const destination = searchParams.get('destination')

    let query = supabase
      .from('cms_seasons')
      .select('id, destination_key, name, emoji, months, weather, crowd, price, description, display_order, is_active')
      .eq('is_active', true)
      .order('destination_key')
      .order('display_order')

    if (destination) {
      query = query.eq('destination_key', destination.toLowerCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('[CMS Seasons API] Fetch error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Parse months JSON if stored as string
    const seasons: CmsSeason[] = (data || []).map((season: any) => ({
      ...season,
      months: typeof season.months === 'string' ? JSON.parse(season.months) : season.months || [],
    }))

    return NextResponse.json(
      { success: true, seasons },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
