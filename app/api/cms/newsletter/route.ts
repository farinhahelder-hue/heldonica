import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const supabase = (url && key) ? createClient(url, key) : null

// POST /api/cms/newsletter - Subscribe email (public endpoint, no auth needed)
export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  try {
    const { email, source } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email_required' });
    }
    
    const { data: existing } = await supabase
      .from('cms_newsletter')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (existing) {
      return NextResponse.json({ message: 'already_subscribed' });
    }
    
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

// GET /api/cms/newsletter - List subscribers (admin only)
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;
  
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

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
