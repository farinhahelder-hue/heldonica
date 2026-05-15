import { NextRequest, NextResponse } from 'next/server'
import { getPageContent, updatePageContent } from '@/lib/cms-pages'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Paramètre slug manquant' }, { status: 400 })
  }

  const content = await getPageContent(slug)
  if (!content) {
    return NextResponse.json({ page_key: slug, section_data: {} })
  }
  return NextResponse.json(content)
}

export async function PUT(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { page_key, section_data, ...otherFields } = body

    if (!page_key) {
      return NextResponse.json(
        { error: 'page_key est requis' },
        { status: 400 }
      )
    }

    const updates = { ...otherFields }
    if (section_data) updates.section_data = section_data

    const result = await updatePageContent(page_key, updates)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, page_key })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
