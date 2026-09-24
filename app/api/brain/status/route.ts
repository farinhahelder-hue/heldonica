export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireBridgeAuth } from '@/lib/bridge-auth'

let _cached: ReturnType<typeof createClient> | null = null
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    _cached = (url && key) ? createClient(url, key) : null
  }
  return _cached
}

export async function GET(req: Request) {
  const authResponse = await requireBridgeAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('site_settings') as any)
    .select('value')
    .eq('key', 'brain_heartbeat')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    return NextResponse.json({ online: false, last_seen: null })
  }

  let parsed: Record<string, unknown>
  try {
    parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
  } catch {
    return NextResponse.json({ online: false, last_seen: null })
  }

  const { last_seen, cpu_percent, ram_percent, ollama_running, active_model, active_tasks } = parsed as {
    last_seen: string
    cpu_percent: number
    ram_percent: number
    ollama_running: boolean
    active_model: string | null
    active_tasks: number
  }

  const online = typeof last_seen === 'string'
    ? (Date.now() - new Date(last_seen).getTime()) < 120_000
    : false

  return NextResponse.json({
    online,
    last_seen: last_seen ?? null,
    cpu_percent: cpu_percent ?? null,
    ram_percent: ram_percent ?? null,
    ollama_running: ollama_running ?? null,
    active_model: active_model ?? null,
    active_tasks: active_tasks ?? null,
  })
}
