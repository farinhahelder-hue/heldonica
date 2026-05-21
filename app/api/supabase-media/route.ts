import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from '@/lib/supabase-storage'

export async function GET(req: NextRequest) {
  // Liste des fichiers (authentifié)
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(req.url)
    const prefix = searchParams.get('prefix') || 'uploads/'
    
    const { listSupabaseMedia } = await import('@/lib/supabase-storage')
    const files = await listSupabaseMedia(prefix)
    
    return NextResponse.json(files)
  } catch (err) {
    console.error('Media list error:', err)
    return NextResponse.json({ error: 'Erreur liste' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file || !file.size) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Limite 50MB
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 50MB)' },
        { status: 400 }
      )
    }

    const result = await uploadToSupabaseStorage(file)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      publicUrl: result.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (err) {
    console.error('Media upload error:', err)
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const { path } = await req.json()

    if (!path) {
      return NextResponse.json({ error: 'Path requis' }, { status: 400 })
    }

    const result = await deleteFromSupabaseStorage(path)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Media delete error:', err)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}