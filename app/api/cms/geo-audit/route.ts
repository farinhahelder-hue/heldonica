import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.heldonica.fr'

const AI_BOTS = [
  { name: 'GPTBot', tier: 'training' },
  { name: 'ClaudeBot', tier: 'training' },
  { name: 'Claude-API', tier: 'training' },
  { name: 'ClaudeWeb', tier: 'training' },
  { name: 'anthropic-ai', tier: 'training' },
  { name: 'OAI-SearchBot', tier: 'search' },
  { name: 'PerplexityBot', tier: 'search' },
  { name: 'Google-Extended', tier: 'training' },
  { name: 'Gemini', tier: 'training' },
  { name: 'cohere-ai', tier: 'training' },
  { name: 'Bytespider', tier: 'training' },
  { name: 'CCBot', tier: 'training' },
  { name: 'FacebookBot', tier: 'training' },
  { name: 'Applebot-Extended', tier: 'training' },
  { name: 'ImagesiftBot', tier: 'training' },
  { name: 'Meltwater', tier: 'training' },
  { name: 'YouBot', tier: 'search' },
  { name: 'PetalBot', tier: 'search' },
]

const CATEGORY_WEIGHTS = {
  robots_txt: 18,
  llms_txt: 18,
  schema: 16,
  meta_tags: 14,
  content: 12,
  brand_entity: 10,
  signals: 6,
  ai_discovery: 6,
}

const MAX_SCORE = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0)

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

interface CheckResult {
  ok: boolean
  detail: string
  fix: string
}

interface CategoryResult {
  score: number
  max: number
  checks: CheckResult[]
}

function calculateGrade(score: number, max: number): string {
  const pct = Math.round((score / max) * 100)
  if (pct >= 90) return 'A'
  if (pct >= 75) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 40) return 'D'
  return 'E'
}

export async function GET() {
  const report: Record<string, CategoryResult> = {}
  const recommendations: string[] = []

  // ── 1. Robots.txt ──
  const robotsTxt = await fetchText(`${SITE_URL}/robots.txt`)
  const robotsChecks: CheckResult[] = []

  if (robotsTxt !== null) {
    const allowedBots = AI_BOTS.map(bot => {
      const pattern = new RegExp(`(User-agent:\\s*${bot.name}|User-agent:\\s*\\*)`, 'i')
      const disallowAll = new RegExp(`User-agent:\\s*${bot.name}[\\s\\S]*?Disallow:\\s*/`, 'i')
      const allowAll = new RegExp(`User-agent:\\s*${bot.name}[\\s\\S]*?(Disallow:\\s*$|Allow:\\s*/)`, 'i')

      if (disallowAll.test(robotsTxt)) return { ...bot, allowed: false }
      if (allowAll.test(robotsTxt)) return { ...bot, allowed: true }

      const wildcardBlock = /User-agent:\s*\*[\s\S]*?Disallow:\s*\//.test(robotsTxt)
      return { ...bot, allowed: !wildcardBlock }
    })

    const trainingBotsAllowed = allowedBots.filter(b => b.tier === 'training' && b.allowed).length
    const searchBotsAllowed = allowedBots.filter(b => b.tier === 'search' && b.allowed).length
    const totalBots = AI_BOTS.length
    const allowedCount = allowedBots.filter(b => b.allowed).length

    const blockedBots = allowedBots.filter(b => !b.allowed)
    if (blockedBots.length > 0) {
      recommendations.push(`Debloquer les bots AI: ${blockedBots.map(b => b.name).join(', ')}`)
    }

    let robotScore = 0
    if (robotsTxt.includes('Sitemap:')) { robotScore += 2; robotsChecks.push({ ok: true, detail: 'Sitemap declare dans robots.txt', fix: '' }) }
    else { robotScore += 0; robotsChecks.push({ ok: false, detail: 'Sitemap non declare dans robots.txt', fix: "Ajouter 'Sitemap: https://www.heldonica.fr/sitemap.xml'" }) }

    const botScore = Math.round((allowedCount / totalBots) * 14)
    robotScore += botScore

    const pct = Math.round((allowedCount / totalBots) * 100)
    robotsChecks.push({
      ok: pct >= 80,
      detail: `${allowedCount}/${totalBots} bots AI autorises (${pct}%)`,
      fix: blockedBots.length > 0 ? `Ajouter Disallow pour les bots bloques dans robots.txt` : '',
    })

    report.robots_txt = { score: robotScore, max: 18, checks: robotsChecks }
  } else {
    report.robots_txt = { score: 0, max: 18, checks: [{ ok: false, detail: 'robots.txt introuvable', fix: "Creer /robots.txt a la racine" }] }
    recommendations.push('Creer un fichier robots.txt avec les regles pour les bots AI')
  }

  // ── 2. llms.txt ──
  const llmsTxtContent = await fetchText(`${SITE_URL}/llms.txt`)
  const llmsChecks: CheckResult[] = []

  if (llmsTxtContent !== null) {
    let llmsScore = 0
    const lines = llmsTxtContent.split('\n').filter(l => l.trim())

    const hasH1 = llmsTxtContent.startsWith('# ')
    llmsChecks.push({ ok: hasH1, detail: hasH1 ? 'Titre H1 present' : 'Pas de H1', fix: "Commencer par '# Nom du site'" })
    if (hasH1) llmsScore += 3

    const hasSection = /^##\s/.test(llmsTxtContent)
    llmsChecks.push({ ok: hasSection, detail: hasSection ? 'Sections avec ## trouvees' : 'Pas de sections ##', fix: "Ajouter ## Overview, ## Top Pages, ## Articles" })
    if (hasSection) llmsScore += 4

    const hasLinks = /https?:\/\//.test(llmsTxtContent)
    llmsChecks.push({ ok: hasLinks, detail: hasLinks ? `${(llmsTxtContent.match(/https?:\/\//g) || []).length} URLs trouvees` : 'Aucune URL', fix: "Ajouter des liens vers les pages principales" })
    if (hasLinks) llmsScore += 4

    const lineCount = lines.length
    const hasGoodDepth = lineCount >= 30
    llmsChecks.push({ ok: hasGoodDepth, detail: `${lineCount} lignes (>= 30: bon)`, fix: "Ajouter plus d’articles et sections" })
    if (hasGoodDepth) llmsScore += 4

    const hasArticles = /^###\s/.test(llmsTxtContent)
    llmsChecks.push({ ok: hasArticles, detail: hasArticles ? 'Articles listes avec ###' : 'Pas d\'articles', fix: "Ajouter les articles avec ### Titre et leurs URLs" })
    if (hasArticles) llmsScore += 3

    report.llms_txt = { score: llmsScore, max: 18, checks: llmsChecks }
  } else {
    report.llms_txt = { score: 0, max: 18, checks: [{ ok: false, detail: '/llms.txt introuvable', fix: "Creer une route /llms.txt avec la liste des articles" }] }
    recommendations.push('Creer un fichier /llms.txt dynamique avec les articles')
  }

  // ── 3. Schema JSON-LD ──
  const blogPage = await fetchText(`${SITE_URL}/blog/slow-travel`)
  const homePage = await fetchText(`${SITE_URL}/`)
  const schemaChecks: CheckResult[] = []
  let schemaScore = 0

  const schemaRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let ldCount = 0

  const countSchemas = (html: string | null): number => {
    if (!html) return 0
    const matches = [...html.matchAll(schemaRegex)]
    return matches.length
  }

  const homeSchemas = countSchemas(homePage)
  const blogSchemas = countSchemas(blogPage)

  ldCount = homeSchemas + blogSchemas

  schemaChecks.push({ ok: homeSchemas > 0, detail: homeSchemas > 0 ? `${homeSchemas} schemas sur la homepage` : 'Aucun schema sur la homepage', fix: "Ajouter Organization + WebSite schema sur la page d’accueil" })
  if (homeSchemas > 0) schemaScore += 3

  schemaChecks.push({ ok: blogSchemas > 0, detail: blogSchemas > 0 ? `${blogSchemas} schemas sur l\'article blog` : 'Aucun schema sur l\'article', fix: "Ajouter BlogPosting schema sur les articles" })
  if (blogSchemas > 0) schemaScore += 4

  const hasBlogPosting = blogPage?.includes('BlogPosting') ?? false
  schemaChecks.push({ ok: hasBlogPosting, detail: hasBlogPosting ? 'BlogPosting schema present' : 'BlogPosting manquant', fix: "Ajouter un schema BlogPosting avec headline, description, datePublished, author" })
  if (hasBlogPosting) schemaScore += 3

  const hasOrganization = homePage?.includes('Organization') ?? false
  schemaChecks.push({ ok: hasOrganization, detail: hasOrganization ? 'Organization schema present' : 'Organization manquant', fix: "Ajouter Organization schema avec name, url, logo" })
  if (hasOrganization) schemaScore += 3

  const hasBreadcrumb = blogPage?.includes('BreadcrumbList') ?? false
  schemaChecks.push({ ok: hasBreadcrumb, detail: hasBreadcrumb ? 'BreadcrumbList present' : 'BreadcrumbList manquant', fix: "Ajouter BreadcrumbList sur les articles" })
  if (hasBreadcrumb) schemaScore += 3

  report.schema = { score: schemaScore, max: 16, checks: schemaChecks }

  // ── 4. Meta Tags ──
  const metaChecks: CheckResult[] = []
  let metaScore = 0

  const extractMeta = (html: string | null, name: string, attr: string): string | null => {
    if (!html) return null
    const regex = new RegExp(`${attr}["']\\s+content=["']([^"']+)`, 'i')
    const match = html.match(regex)
    return match ? match[1] : null
  }

  const titleMatch = blogPage?.match(/<title>([^<]*)<\/title>/)
  const hasTitle = titleMatch != null && titleMatch[1].trim().length > 0
  metaChecks.push({ ok: hasTitle, detail: hasTitle && titleMatch ? `Title: "${titleMatch[1].trim().substring(0, 60)}..."` : 'Title manquant', fix: "Ajouter une balise <title> sur chaque page" })
  if (hasTitle) metaScore += 3

  const desc = extractMeta(blogPage, 'description', 'name="description"') || extractMeta(blogPage, 'description', "name='description'")
  const descOk = desc !== null && desc.length >= 50 && desc.length <= 160
  metaChecks.push({ ok: descOk, detail: descOk ? `Meta description: ${desc!.length} car.` : desc ? `Description (${desc.length} car., 70-160 requis)` : 'Meta description manquante', fix: "Ajouter une meta description de 70-160 caracteres" })
  if (descOk) metaScore += 3

  const canonical = extractMeta(blogPage, 'canonical', 'rel="canonical" href=') || blogPage?.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/)?.[1] || null
  metaChecks.push({ ok: canonical !== null, detail: canonical ? `Canonical: ${canonical.substring(0, 50)}...` : 'Canonical manquant', fix: "Ajouter une balise link rel=canonical" })
  if (canonical) metaScore += 3

  const hasOGTitle = blogPage?.includes('og:title') ?? false
  const hasOGDesc = blogPage?.includes('og:description') ?? false
  const hasOGImage = blogPage?.includes('og:image') ?? false
  const ogOk = hasOGTitle && hasOGDesc && hasOGImage
  metaChecks.push({ ok: ogOk, detail: ogOk ? 'OG: title + description + image presents' : `OG manquant: ${!hasOGTitle ? 'title ' : ''}${!hasOGDesc ? 'description ' : ''}${!hasOGImage ? 'image ' : ''}`, fix: "Ajouter les balises Open Graph (og:title, og:description, og:image)" })
  if (ogOk) metaScore += 3

  const hasTwitter = blogPage?.includes('twitter:card') ?? false
  metaChecks.push({ ok: hasTwitter, detail: hasTwitter ? 'Twitter Card presente' : 'Twitter Card manquante', fix: "Ajouter meta twitter:card, twitter:title, twitter:image" })
  if (hasTwitter) metaScore += 2

  report.meta_tags = { score: metaScore, max: 14, checks: metaChecks }

  // ── 5. Content ──
  const contentChecks: CheckResult[] = []
  let contentScore = 0

  const hasH1 = blogPage?.match(/<h1[^>]*>/) !== null
  contentChecks.push({ ok: hasH1, detail: hasH1 ? 'H1 present' : 'H1 manquant', fix: "Ajouter un H1 sur chaque page" })
  if (hasH1) contentScore += 3

  const hasStats = (blogPage?.match(/\d+%/g)?.length ?? 0) >= 2
  contentChecks.push({ ok: hasStats, detail: hasStats ? 'Statistiques trouvees dans le contenu' : 'Peu de donnees chiffrees', fix: "Ajouter des statistiques, pourcentages, dates precises pour la citability" })
  if (hasStats) contentScore += 3

  const hasLists = (blogPage?.match(/<ul[^>]*>|<ol[^>]*>/g)?.length ?? 0) > 0
  contentChecks.push({ ok: hasLists, detail: hasLists ? 'Listes HTML trouvees' : 'Aucune liste', fix: "Utiliser des listes (ul/ol) pour structurer l’information" })
  if (hasLists) contentScore += 3

  const wordCount = (blogPage?.replace(/<[^>]*>/g, '').split(/\s+/).length ?? 0)
  const contentRich = wordCount > 500
  contentChecks.push({ ok: contentRich, detail: contentRich ? `~${wordCount} mots sur la page` : `~${wordCount} mots (trop peu)`, fix: "Ajouter du contenu textuel substantiel (> 500 mots)" })
  if (contentRich) contentScore += 3

  report.content = { score: contentScore, max: 12, checks: contentChecks }

  // ── 6. Brand & Entity ──
  const brandChecks: CheckResult[] = []
  let brandScore = 0

  const brandNameMatch = blogPage?.match(/Heldonica/g)
  const brandOk = (brandNameMatch?.length ?? 0) >= 3
  brandChecks.push({ ok: brandOk, detail: brandOk ? `"Heldonica" mentionne ${brandNameMatch!.length} fois` : 'Marque peu mentionnee', fix: "Repeter le nom de marque dans les titres et contenu" })
  if (brandOk) brandScore += 3

  const hasAbout = await fetchText(`${SITE_URL}/a-propos`)
  brandChecks.push({ ok: hasAbout !== null, detail: hasAbout ? 'Page A propos trouvee' : 'A propos manquante', fix: "Creer une page /a-propos" })
  if (hasAbout) brandScore += 3

  const sameAs = blogPage?.match(/sameAs/g)
  const sameAsOk = (sameAs?.length ?? 0) > 0
  brandChecks.push({ ok: sameAsOk, detail: sameAsOk ? `sameAs trouve ${sameAs!.length}x` : 'sameAs manquant', fix: "Ajouter sameAs dans Organization schema (Instagram, etc.)" })
  if (sameAsOk) brandScore += 2

  const hasLang = blogPage?.match(/lang=["']fr["']/i)
  brandChecks.push({ ok: hasLang !== null, detail: hasLang ? 'Langue FR definie' : 'Langue non definie', fix: "Ajouter lang='fr' sur le tag html" })
  if (hasLang) brandScore += 2

  report.brand_entity = { score: brandScore, max: 10, checks: brandChecks }

  // ── 7. Signals ──
  const signalChecks: CheckResult[] = []
  let signalScore = 0

  signalChecks.push({ ok: true, detail: 'RSS feed: non verifie', fix: "Ajouter un flux RSS" })
  signalScore += 1

  const hasDates = (blogPage?.match(/\d{4}-\d{2}-\d{2}/g)?.length ?? 0) > 0
  signalChecks.push({ ok: hasDates, detail: hasDates ? 'Dates de publication detectees' : 'Pas de dates detectees', fix: "Ajouter datePublished dans les schemas" })
  if (hasDates) signalScore += 2

  const sitemapExists = await fetchText(`${SITE_URL}/sitemap.xml`)
  signalChecks.push({ ok: sitemapExists !== null, detail: sitemapExists ? 'Sitemap.xml accessible' : 'Sitemap.xml introuvable', fix: "Creer un sitemap.xml" })
  if (sitemapExists) signalScore += 3

  report.signals = { score: signalScore, max: 6, checks: signalChecks }

  // ── 8. AI Discovery ──
  const aiDiscoveryChecks: CheckResult[] = []
  let aiDiscoveryScore = 0

  const wellKnownAi = await fetchText(`${SITE_URL}/.well-known/ai.txt`)
  aiDiscoveryChecks.push({ ok: wellKnownAi !== null, detail: wellKnownAi ? '.well-known/ai.txt present' : '.well-known/ai.txt absent', fix: "Creer /.well-known/ai.txt avec les instructions pour les bots AI" })
  if (wellKnownAi) aiDiscoveryScore += 3

  const aiSummary = await fetchText(`${SITE_URL}/ai/summary.json`)
  aiDiscoveryChecks.push({ ok: aiSummary !== null, detail: aiSummary ? '/ai/summary.json present' : '/ai/summary.json absent', fix: "Creer /ai/summary.json avec le resume du site" })
  if (aiSummary) aiDiscoveryScore += 3

  report.ai_discovery = { score: aiDiscoveryScore, max: 6, checks: aiDiscoveryChecks }

  // ── Aggregate ──
  let totalScore = 0
  const breakdown: Record<string, { score: number; max: number; percent: number; grade: string }> = {}

  for (const [key, category] of Object.entries(report)) {
    const max = CATEGORY_WEIGHTS[key as keyof typeof CATEGORY_WEIGHTS]
    totalScore += category.score
    const pct = Math.round((category.score / max) * 100)
    breakdown[key] = {
      score: category.score,
      max,
      percent: pct,
      grade: calculateGrade(category.score, max),
    }
  }

  const overallGrade = calculateGrade(totalScore, MAX_SCORE)

  return NextResponse.json({
    url: SITE_URL,
    score: totalScore,
    maxScore: MAX_SCORE,
    percent: Math.round((totalScore / MAX_SCORE) * 100),
    grade: overallGrade,
    breakdown,
    details: report,
    recommendations,
    timestamp: new Date().toISOString(),
  })
}
