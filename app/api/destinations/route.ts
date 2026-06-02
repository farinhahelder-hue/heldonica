import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Destinations fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch destinations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destinations: data || [],
    })
  } catch (err) {
    console.error('Destinations API error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}