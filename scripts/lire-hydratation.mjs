// Ouvre une page du site lancé en mode dev (localhost:3100) et affiche les
// erreurs console non minifiées. Lancé par .github/workflows/erreur-hydratation.yml.
import { chromium } from 'playwright'

const b = await chromium.launch()
const p = await b.newPage()
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[${m.type()}]`, m.text().slice(0, 3000)) })
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 3000)))
await p.goto('http://localhost:3100' + process.env.CHEMIN, { waitUntil: 'networkidle', timeout: 120000 })
await p.waitForTimeout(3000)
await b.close()
