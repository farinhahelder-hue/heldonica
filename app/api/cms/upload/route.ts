import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'media'
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('heldonica-media')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) {
      // Bucket peut ne pas exister encore — retourner erreur claire
      return NextResponse.json({ error: `Storage: ${error.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('heldonica-media').getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl, path: filename, success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
