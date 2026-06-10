import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const JULES_API_KEY = process.env.JULES_API_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Initialize Supabase admin client
const getSupabaseAdmin = () => {
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false }
  });
};

// POST - Create a new Jules session
export async function POST(request: NextRequest) {
  if (!JULES_API_KEY) {
    return NextResponse.json({ error: 'JULES_API_KEY not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { prompt, title, source = 'sources/github/farinhahelder-hue/heldonica', automationMode = 'MANUAL' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Create session with Jules API
    const julesResponse = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': JULES_API_KEY
      },
      body: JSON.stringify({
        prompt,
        title: title || prompt.slice(0, 50),
        sourceContext: {
          source: `sources/github/${body.repo || 'farinhahelder-hue/heldonica'}`,
          ...(body.branch && { githubRepoContext: { startingBranch: body.branch } })
        },
        automationMode: body.automationMode || 'MANUAL'
      })
    });

    const julesData = await julesResponse.json();

    if (!julesResponse.ok) {
      return NextResponse.json({ error: julesData.error || 'Failed to create Jules session' }, { status: 500 });
    }

    // Store session in Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from('jules_sessions').insert({
        id: julesData.id || String(julesData.name)?.split('/').pop(),
        title: title || prompt.slice(0, 50),
        prompt,
        state: 'pending',
        source,
        url: julesData.url
      });

      await supabase.from('jules_memory').insert({
        action_type: 'session_created',
        description: title || prompt.slice(0, 50),
        session_id: julesData.id || String(julesData.name)?.split('/').pop()
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: julesData.id,
      url: julesData.url
    });
  } catch (error) {
    console.error('Jules API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET - List Jules sessions from Supabase
export async function GET() {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Fetch from Supabase
    const { data: sessions } = await supabase
      .from('jules_sessions')
      .select('*')
      .order('create_time', { ascending: false })
      .limit(50);

    // Also sync with Jules API for latest status
    try {
      const julesResponse = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
        headers: { 'X-Goog-Api-Key': JULES_API_KEY || '' }
      });

      if (julesResponse.ok) {
        const julesData = await julesResponse.json();
        
        // Update local cache - ⚡ Bolt: Optimizing N+1 upsert loop into a single batched upsert query
        const sessionsToUpsert = (julesData.sessions || []).map((session: any) => ({
          id: String(session.name).split('/').pop(),
          title: session.title,
          state: session.state.toLowerCase(),
          update_time: session.updateTime,
          pr_url: session.outputs?.[0]?.pullRequest?.url,
          pr_title: session.outputs?.[0]?.pullRequest?.title,
          pr_description: session.outputs?.[0]?.pullRequest?.description
        }));

        if (sessionsToUpsert.length > 0) {
          await supabase.from('jules_sessions').upsert(sessionsToUpsert, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.warn('Could not sync with Jules API:', e);
    }

    const { data: updatedSessions } = await supabase
      .from('jules_sessions')
      .select('*')
      .order('create_time', { ascending: false })
      .limit(50);

    return NextResponse.json({ sessions: updatedSessions || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}