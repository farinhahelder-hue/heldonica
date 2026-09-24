export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireBridgeAuth } from '@/lib/bridge-auth'

const ALLOWED_TASK_TYPES = [
  'generate_carousel',
  'generate_itinerary',
  'run_task',
  'chat',
  'status',
] as const

const PAYLOAD_MAX_BYTES = 65536

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
  const authResponse = await requireBridgeAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const body = await req.json()
  const { task_type, payload, description } = body

  if (!task_type || !(ALLOWED_TASK_TYPES as readonly string[]).includes(task_type)) {
    return NextResponse.json(
      { error: 'Invalid task_type', valid: [...ALLOWED_TASK_TYPES] },
      { status: 400 }
    )
  }

  if (payload !== undefined && payload !== null) {
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload)).byteLength
    if (payloadBytes > PAYLOAD_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('agent_tasks') as any)
    .insert([{
      agent: 'heldonica-brain',
      status: 'sent',
      task_type,
      payload: payload ?? null,
      task: description ?? task_type,
      created_at: new Date().toISOString(),
      claimed_by: null,
    }])
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function GET(req: Request) {
  const authResponse = await requireBridgeAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

  const from = (page - 1) * limit
  const to = from + limit - 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (sb.from('agent_tasks') as any)
    .select('*', { count: 'exact' })
    .eq('agent', 'heldonica-brain')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tasks: data, total: count ?? 0, page, limit })
}
