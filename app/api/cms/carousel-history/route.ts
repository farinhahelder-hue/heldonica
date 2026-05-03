import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321")!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fake_key"
);

// GET /api/cms/carousel-history - List history
// POST /api/cms/carousel-history - Save to history
export async function GET(req: NextRequest) {
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