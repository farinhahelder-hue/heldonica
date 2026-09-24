import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireCmsAuth(req)
  if (auth) return auth

  const voyagePath = join(process.cwd(), 'imports', 'roumanie-2026', 'voyage.md')
  let voyage = 'voyage.md introuvable — lance reconstituer_voyage.py'
  let moments: { heure: string; count: number; files: string[] }[] = []

  if (existsSync(voyagePath)) {
    voyage = readFileSync(voyagePath, 'utf8')
    // Parse moments : lignes "- HH:MM → HH:MM — N photos"
    const re = /-\s*(\d{2}:\d{2})\s*→\s*\d{2}:\d{2}\s*—\s*(\d+)\s*photos?/g
    let m: RegExpExecArray | null
    while ((m = re.exec(voyage))) {
      moments.push({ heure: m[1], count: parseInt(m[2], 10), files: [] })
    }
    // Fallback : si pas de moments, compte les fichiers
    if (moments.length === 0) {
      const mediaDir = join(process.cwd(), 'public', 'images', 'destinations', 'roumanie')
      try {
        const files = readdirSync(mediaDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
        moments = [{ heure: 'tout', count: files.length, files: files.slice(0, 6) }]
      } catch {}
    }
  }

  return NextResponse.json({ voyage: voyage.slice(0, 4000), moments, total: moments.reduce((s, x) => s + x.count, 0) })
}
