import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function withoutVoiceNotes(payload: Record<string, unknown>) {
  const { voice_notes, ...rest } = payload
  return rest
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const { data, error } = await sb
    .from('cms_blog_posts')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ article: data })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const body = await req.json()
  const payload = { ...body, updated_at: new Date().toISOString() }

  let { data, error } = await sb
    .from('cms_blog_posts')
    .update(payload)
    .eq('id', params.id)
    .select()
    .single()

  if (error?.message?.includes('voice_notes') && error.message.includes('does not exist')) {
    ;({ data, error } = await sb
      .from('cms_blog_posts')
      .update(withoutVoiceNotes(payload))
      .eq('id', params.id)
      .select()
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const { error } = await sb.from('cms_blog_posts').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
