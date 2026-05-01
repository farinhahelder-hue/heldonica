import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// POST /api/cms/newsletter - Subscribe email
export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email_required' });
    }
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('cms_newsletter')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (existing) {
      return NextResponse.json({ message: 'already_subscribed' });
    }
    
    // Insert new subscriber
    const { error } = await supabase
      .from('cms_newsletter')
      .insert({
        email: email.toLowerCase(),
        source: source || 'website',
        subscribed: true,
      });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Newsletter error:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

// GET /api/cms/newsletter - List subscribers (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get('key');
  
  if (adminKey !== process.env.CMS_ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  
  try {
    const { data, error } = await supabase
      .from('cms_newsletter')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return NextResponse.json({ subscribers: data || [] });
  } catch (e) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
