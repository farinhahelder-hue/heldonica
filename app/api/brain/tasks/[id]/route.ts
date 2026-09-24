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

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireBridgeAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { id } = await context.params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('agent_tasks') as any)
    .select('*')
    .eq('id', id)
    .eq('agent', 'heldonica-brain')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ task: data })
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireBridgeAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { id } = await context.params
  const body = await req.json()
  const { status } = body

  if (status === 'in_progress') {
    // Claim operation — conditional WHERE status='sent' prevents double-claiming
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb.from('agent_tasks') as any)
      .update({
        status: 'in_progress',
        claimed_by: body.claimed_by ?? null,
        claimed_at: body.claimed_at ?? new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'sent')
      .select('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, conflict: true }, { status: 409 })
    }

    return NextResponse.json({ success: true })
  }

  if (status === 'done' || status === 'blocked') {
    // Close operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb.from('agent_tasks') as any)
      .update({
        status: body.status,
        actions_done: body.actions_done ?? null,
      })
      .eq('id', id)
      .eq('agent', 'heldonica-brain')
      .select('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
}
