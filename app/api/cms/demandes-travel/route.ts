import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

let _cached: ReturnType<typeof createClient> | null = null;
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = (url && key) ? createClient(url, key) : null;
  }
  return _cached;
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const { data, error } = await sb
    .from('demandes_travel')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ demandes: [] })
  return NextResponse.json({ demandes: data })
}

export async function PUT(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const { id, statut } = await req.json()
  const { error } = await sb
    .from('demandes_travel')
    .update({ statut } as any)
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  
  const body = await req.json()
  const { id, statut, notes_internes } = body
  
  const updates: Partial<{
    statut: string;
    notes_internes: string;
    updated_at: string;
  }> = {}
  if (statut !== undefined) updates.statut = statut
  if (notes_internes !== undefined) updates.notes_internes = notes_internes
  updates.updated_at = new Date().toISOString()
  
  if (Object.keys(updates).length === 1 && updates.updated_at) {
    return NextResponse.json({ ok: true }) // nothing to update
  }
  
  const { error } = await sb
    .from('demandes_travel')
    .update(updates as any)
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
