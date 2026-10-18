// Captures d'écran du site en ligne, largeur Poco X6 Pro et ordinateur, pour
// relire l'aspect visuel sans navigateur sur le téléphone. Lancé par
// .github/workflows/captures-visuelles.yml ; sorties dans captures/.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.SITE_URL || 'https://www.heldonica.fr'
const HAUTEUR_MAX = 6000
const pages = (process.env.PAGES || '').split(/\s+/).filter(Boolean)
const formats = [
  { nom: 'poco', viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true },
  { nom: 'pc', viewport: { width: 1366, height: 900 } },
]

mkdirSync('captures', { recursive: true })
const rapport = []
const navigateur = await chromium.launch()
for (const f of formats) {
  const ctx = await navigateur.newContext({ viewport: f.viewport, isMobile: f.isMobile, hasTouch: f.hasTouch, deviceScaleFactor: 1, locale: 'fr-FR' })
  for (const chemin of pages) {
    const page = await ctx.newPage()
    const erreurs = []
    page.on('pageerror', (e) => erreurs.push(String(e).slice(0, 200)))
    const imagesKo = []
    page.on('response', (r) => { if (r.request().resourceType() === 'image' && r.status() >= 400) imagesKo.push(`${r.status()} ${r.url()}`) })
    let statut = 0
    try {
      const rep = await page.goto(BASE + chemin, { waitUntil: 'networkidle', timeout: 60000 })
      statut = rep?.status() ?? 0
      // Les images paresseuses ne chargent qu'en vue : on parcourt la page.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(800)
      const debordement = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      const hauteur = await page.evaluate(() => document.body.scrollHeight)
      const nom = `${f.nom}${chemin === '/' ? '_accueil' : chemin.replaceAll('/', '_')}.jpg`
      await page.screenshot({ path: `captures/${nom}`, type: 'jpeg', quality: 55, fullPage: true, clip: { x: 0, y: 0, width: f.viewport.width, height: Math.min(hauteur, HAUTEUR_MAX) } })
      rapport.push({ format: f.nom, chemin, statut, hauteur, debordement, imagesKo, erreurs })
    } catch (e) {
      rapport.push({ format: f.nom, chemin, statut, echec: String(e).slice(0, 200) })
    }
    await page.close()
  }
  await ctx.close()
}
await navigateur.close()
writeFileSync('captures/rapport.json', JSON.stringify(rapport, null, 2))
console.log(`${rapport.length} captures`)
