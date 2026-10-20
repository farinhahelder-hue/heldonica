import { describe, it, expect } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Un brouillon ou une URL inconnue doit répondre 404. Un loading.tsx au-dessus
 * de la route ouvre un Suspense : le statut 200 part avant notFound(), et la
 * balise noindex injectée ensuite manquait 2 fois sur 3 (relevé du 19/10/2026
 * sur /blog/<brouillon>, navigateur comme Googlebot). app/loading.tsx a été
 * retiré pour cette raison le 20/10.
 */
describe('vrai 404 — pas de loading.tsx au-dessus des routes à notFound()', () => {
  it("ni à la racine de app/, ni sous app/blog, ni sous app/destinations", () => {
    const trouves: string[] = []
    const parcourir = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)
        if (e.isDirectory()) parcourir(p)
        else if (/^loading\.(tsx|jsx|ts|js)$/.test(e.name)) trouves.push(p)
      }
    }
    for (const f of readdirSync('app')) {
      if (/^loading\.(tsx|jsx|ts|js)$/.test(f)) trouves.push(join('app', f))
    }
    parcourir('app/blog')
    parcourir('app/destinations')
    expect(trouves).toEqual([])
  })
})
