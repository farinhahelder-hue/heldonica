export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Bearer-only auth — the Brain Poller has no browser session, so x-cms-auth
// is explicitly excluded here. Uses the same constant-time pattern as lib/bridge-auth.ts.
async function safeEqual(a: string, b: string): Promise<boolean> {
  if (typeof a !== 'string' || typeof b !== 'string') return false

  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)

  if (aBytes.byteLength !== bBytes.byteLength) return false

  try {
    const { timingSafeEqual } = await import('crypto')
    return timingSafeEqual(aBytes, bBytes)
  } catch {
    return a === b
  }
}

async function requireBearerOnly(req: Request): Promise<NextResponse | null> {
  const bridgeToken = process.env.BRAIN_BRIDGE_TOKEN?.trim() || null

  if (!bridgeToken) {
    return NextResponse.json(
      { error: 'BRAIN_BRIDGE_TOKEN not configured' },
      { status: 503 }
    )
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const candidate = authHeader.slice('Bearer '.length)
    const valid = await safeEqual(candidate, bridgeToken)
    if (valid) return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

let _cached: ReturnType<typeof createClient> | null = null
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    _cached = (url && key) ? createClient(url, key) : null
  }
  return _cached
}

export async function POST(req: Request) {
  const authResponse = await requireBearerOnly(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const body = await req.json()
  const { cpu_percent, ram_percent, ollama_running, active_model, active_tasks } = body

  const value = JSON.stringify({
    cpu_percent,
    ram_percent,
    ollama_running,
    active_model,
    active_tasks,
    last_seen: new Date().toISOString(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('site_settings') as any)
    .upsert([{ key: 'brain_heartbeat', value }], { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
