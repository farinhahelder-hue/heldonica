import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

// Colonnes réelles de `cms_seasons` (schéma existant, conservé tel quel —
// voir supabase/migrations/20260805_cms_seasons_extend.sql). La forme JSON
// exposée ici (destination_key/name/months/description/display_order) suit
// en revanche le nommage attendu par SeasonalTable.tsx et components/admin/
// SeasonsManager.tsx, pour ne pas avoir à toucher à ces deux consommateurs.
interface CmsSeasonRow {
  id: number
  destination_slug: string
  season_label: string
  emoji: string | null
  months_array: string[] | null
  weather: string | null
  crowd: 'low' | 'medium' | 'high' | null
  price: 'low' | 'medium' | 'high' | null
  note: string | null
  is_active: boolean
  sort_order: number | null
}

export interface CmsSeason {
  id: string
  destination_key: string
  name: string
  emoji?: string
  months: string[]
  weather?: string
  crowd?: 'low' | 'medium' | 'high'
  price?: 'low' | 'medium' | 'high'
  description?: string
  is_active: boolean
  display_order: number
}

export interface CmsSeasonsResponse {
  success: boolean
  seasons?: CmsSeason[]
  error?: string
}

function mapRow(row: CmsSeasonRow): CmsSeason {
  return {
    id: String(row.id),
    destination_key: row.destination_slug,
    name: row.season_label,
    emoji: row.emoji ?? undefined,
    months: Array.isArray(row.months_array) ? row.months_array : [],
    weather: row.weather ?? undefined,
    crowd: row.crowd ?? undefined,
    price: row.price ?? undefined,
    description: row.note ?? undefined,
    is_active: row.is_active,
    display_order: row.sort_order ?? 0,
  }
}

const SELECT_COLUMNS =
  'id, destination_slug, season_label, emoji, months_array, weather, crowd, price, note, is_active, sort_order'

/**
 * GET /api/cms/seasons
 * - Public (sans auth) : ?slug=madere (ou ?destination=madere, alias historique)
 *   → saisons actives de cette destination uniquement.
 * - Admin (avec auth CMS) : ?all=true → toutes les saisons, actives ou non,
 *   toutes destinations confondues (utilisé par le dashboard CMS).
 */
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'
  const slug = searchParams.get('slug') ?? searchParams.get('destination')

  try {
    if (all) {
      const authResponse = await requireCmsAuth(req)
      if (authResponse) return authResponse

      const { data, error } = await supabase
        .from('cms_seasons')
        .select(SELECT_COLUMNS)
        .order('destination_slug')
        .order('sort_order')

      if (error) {
        console.error('[CMS Seasons API] Fetch error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, seasons: (data ?? []).map(mapRow) })
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Paramètre "slug" requis (ou "all=true" pour la vue admin).' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cms_seasons')
      .select(SELECT_COLUMNS)
      .eq('destination_slug', slug.toLowerCase())
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('[CMS Seasons API] Fetch error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, seasons: (data ?? []).map(mapRow) },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
