import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'

export interface BlogCategory {
  key: string
  label: string
  icon?: string
}

const DEFAULT_CATEGORIES: BlogCategory[] = [
  { key: 'Tous', label: 'Tous' },
  { key: 'Carnets Voyage', label: 'Carnets Voyage', icon: 'map' },
  { key: 'Découvertes Locales', label: 'Découvertes Locales', icon: 'compass' },
  { key: 'Guides Pratiques', label: 'Guides Pratiques', icon: 'book' },
  { key: 'Coulisses de marque', label: 'Coulisses de marque', icon: 'camera' },
]

/**
 * GET /api/cms/blog-categories
 * Fetch blog categories from site_settings
 * Falls back to defaults if not configured
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'blog_category_%')

    if (error) {
      console.error('[CMS Blog Categories API] Fetch error:', error)
      // Return defaults on error
      return NextResponse.json({
        success: true,
        categories: DEFAULT_CATEGORIES,
        source: 'defaults',
      })
    }

    // If no custom categories found, return defaults
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        categories: DEFAULT_CATEGORIES,
        source: 'defaults',
      })
    }

    // Build categories from site_settings
    const categoryMap = new Map<string, string>()
    data.forEach((setting: any) => {
      const key = setting.key.replace('blog_category_', '')
      categoryMap.set(key, setting.value)
    })

    // Always include "Tous" first
    const categories: BlogCategory[] = [
      { key: 'Tous', label: categoryMap.get('tous') || 'Tous' },
      ...Array.from(categoryMap.entries())
        .filter(([key]) => key !== 'tous')
        .map(([key, label]) => ({
          key: label, // Use label as key for filtering
          label,
          icon: key,
        })),
    ]

    return NextResponse.json(
      {
        success: true,
        categories,
        source: 'settings',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (err) {
    console.error('[CMS Blog Categories API] Error:', err)
    return NextResponse.json({
      success: true,
      categories: DEFAULT_CATEGORIES,
      source: 'defaults',
    })
  }
}
