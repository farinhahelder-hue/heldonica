import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const { data, error } = await sb
    .from('demandes_travel')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ demandes: [] })
  return NextResponse.json({ demandes: data })
}

export async function PUT(req: Request) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const { id, statut } = await req.json()
  const { error } = await sb
    .from('demandes_travel')
    .update({ statut })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
