export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { generateAiCompletion } from '@/lib/ai-provider'

function isCron(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET
}

// Génère un alt_text SEO via Gemini/Groq à partir du filename + contexte GPS
async function generateAltText(filename: string, context: string): Promise<string | null> {
  try {
    const result = await generateAiCompletion({
      messages: [
        {
          role: 'system',
          content:
            "Tu es rédacteur SEO Heldonica, slow travel, ton \"on\", voix chaleureuse et précise. Génère un alt_text image (max 125 caractères) descriptif, sans inventer de lieu précis si incertain. Réponds UNIQUEMENT avec l'alt_text.",
        },
        { role: 'user', content: `Fichier: ${filename}\nContexte: ${context}\nGénère l'alt_text :` },
      ],
      temperature: 0.4,
      max_tokens: 100,
    })
    const alt = result.content.trim().replace(/^"|"$/g, '').slice(0, 125)
    return alt || null
  } catch (e) {
    console.warn('[enrich-photos] AI alt fail', e)
    return null
  }
}

export async function GET(req: NextRequest) {
  if (!isCron(req)) {
    const authResponse = await requireCmsAuth(req as any)
    if (authResponse) return authResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  }

  const headers: Record<string, string> = { apikey: supabaseKey, 'Content-Type': 'application/json' }
  if (supabaseKey.startsWith('eyJ')) headers['Authorization'] = `Bearer ${supabaseKey}`

  // 1) Enrichir cms_media sans alt_text (max 10)
  const mediaRes = await fetch(
    `${supabaseUrl}/rest/v1/cms_media?alt_text=is.null&select=id,filename,file_path,latitude,longitude,metadata&limit=10`,
    { headers }
  )
  if (!mediaRes.ok) {
    return NextResponse.json({ error: 'Fetch media failed', details: await mediaRes.text() }, { status: 500 })
  }
  let medias: any[] = await mediaRes.json()

  // 2) Enrichir cms_blog_posts auto_generated sans alt/featured enrichi (optionnel)
  // On priorise cms_media

  if (medias.length === 0) {
    return NextResponse.json({ message: 'Aucun média à enrichir', enriched: 0 })
  }

  let enriched = 0
  const errors: any[] = []

  for (const m of medias) {
    try {
      const ctx = m.latitude ? `GPS ${m.latitude},${m.longitude} • ${m.metadata?.taken_at || ''}` : m.file_path
      const alt = await generateAltText(m.filename, ctx)
      if (!alt) {
        errors.push({ id: m.id, error: 'AI alt null' })
        continue
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/cms_media?id=eq.${m.id}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ alt_text: alt, metadata: { ...m.metadata, alt_generated_at: new Date().toISOString(), alt_source: 'gemini' } }),
      })
      if (patchRes.ok) enriched++
      else errors.push({ id: m.id, error: await patchRes.text() })

      // rate limit AI
      await new Promise((r) => setTimeout(r, 400))
    } catch (e: any) {
      errors.push({ id: m.id, error: e.message })
    }
  }

  return NextResponse.json({ message: `Enrichi ${enriched}/${medias.length} médias`, enriched, total: medias.length, errors: errors.length ? errors : undefined })
}

export async function POST(req: NextRequest) { return GET(req) }
