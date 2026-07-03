import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('cms_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ testimonials: data });
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, location, quote, destination, rating, avatar_url, source, display_order } = body;

    if (!name || !quote) {
      return NextResponse.json({ error: 'name and quote are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cms_testimonials')
      .insert({
        name,
        location,
        quote,
        destination,
        rating: rating || 5,
        avatar_url,
        source: source || 'manual',
        display_order: display_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ testimonial: data });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cms_testimonials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ testimonial: data });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cms_testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}