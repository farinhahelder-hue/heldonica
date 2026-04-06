import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('demandes_travel')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ demandes: [] })
  return NextResponse.json({ demandes: data })
}

export async function PUT(req: Request) {
  const { id, statut } = await req.json()
  const { error } = await supabase
    .from('demandes_travel')
    .update({ statut })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
