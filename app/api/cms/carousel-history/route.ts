export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = (url && key) ? createClient(url, key) : null;

// GET /api/cms/carousel-history - List history
// POST /api/cms/carousel-history - Save to history
export async function GET(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  try {
    const { data, error } = await supabase
      .from('cms_carousel_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ history: data || [] });
  } catch (e) {
    console.error('Carousel history error:', e);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('cms_carousel_history')
      .insert({
        topic: body.topic,
        title: body.title,
        caption: body.caption,
        hashtags: body.hashtags || [],
        slides: body.slides || [],
        images: body.images || [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    console.error('Carousel save error:', e);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}