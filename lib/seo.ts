/**
 * SEO & Geo helpers for generating metadata
 */

// Parse hreflang URLs from setting
export function parseHreflang(hreflangUrls: string): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (!hreflangUrls) return result
  
  const lines = hreflangUrls.split('\n').filter(line => line.trim())
  for (const line of lines) {
    const [url, lang] = line.split('|').map(s => s?.trim())
    if (url && lang) {
      result[lang] = url
    }
  }
  
  return result
}

// Generate alternate URLs for alternates meta
export function generateAlternateUrls(
  baseUrl: string,
  hreflangUrls: Record<string, string>
) {
  // Start with existing x-default
  const urls = [{ url: baseUrl, lang: 'x-default' }]
  
  // Add configured languages
  for (const [lang, url] of Object.entries(hreflangUrls)) {
    urls.push({ url, lang })
  }
  
  return urls
}

// Parse target countries to geo distribution
export function generateGeoDistribution(targetCountries: string[]): string {
  if (!targetCountries || targetCountries.length === 0) {
    return 'global'
  }
  
  // Generate geo:distribute content based on countries
  if (targetCountries.includes('FR') && targetCountries.length === 1) {
    return 'geo:distribute=content:FR'
  }
  
  // Multiple countries
  const distribution = targetCountries
    .map(c => `FR:${c}`) // simplified for demo
    .join(';')
  
  return `geo:distribute=${distribution}`
}

// Generate robots meta
export function generateRobotsMeta(indexSite: boolean, followLinks: boolean): string {
  const index = indexSite ? 'index' : 'noindex';
  const follow = followLinks ? 'follow' : 'nofollow';
  return `${index}, ${follow}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
}

// Build full metadata from SEO settings
export interface SeoSettings {
  title?: string
  description?: string
  defaultLocale?: string
  hreflangUrls?: string
  metaKeywords?: string
  indexSite?: boolean
  followLinks?: boolean
  targetCountries?: string[]
  ogImage?: string
}

export interface PageSeoInput {
  title: string
  description?: string
  path: string
  seo?: Partial<SeoSettings>
  settings: SeoSettings
}

export function buildPageMetadata(input: PageSeoInput) {
  const { title, description, path, settings } = input
  
  // Base metadata
  const siteName = settings.title || 'Heldonica'
  const fullTitle = `${title} | ${siteName}`
  
  // Merge page-specific with site-wide
  const seoDesc = description || settings.description || ''
  const keywords = input.seo?.metaKeywords || settings.metaKeywords || ''
  const locale = input.seo?.defaultLocale || settings.defaultLocale || 'fr-FR'
  const hreflangUrls = parseHreflang(input.seo?.hreflangUrls || settings.hreflangUrls || '')
  const robots = generateRobotsMeta(
    input.seo?.indexSite ?? settings.indexSite ?? true,
    input.seo?.followLinks ?? settings.followLinks ?? true
  )
  const ogImage = input.seo?.ogImage || settings.ogImage || ''
  
  // Generate alternates
  const alternates: { languages?: Record<string, string> } = {}
  if (Object.keys(hreflangUrls).length > 0) {
    alternates.languages = hreflangUrls
  }
  
  return {
    title: fullTitle,
    description: seoDesc,
    keywords,
    robots,
    alternates,
    openGraph: {
      title: fullTitle,
      description: seoDesc,
      locale,
      url: `https://www.heldonica.fr${path}`,
      siteName,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  }
}
export const SITE_URL = 'https://www.heldonica.fr'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`
export const DEFAULT_TITLE = 'Heldonica — Slow Travel & Voyages Authentiques'
export const DEFAULT_DESCRIPTION = 'Blog slow travel et pépites dénichées hors des sentiers battus. Carnets de route, destinations authentiques et travel planning sur mesure écoresponsable en Europe et ailleurs.'
