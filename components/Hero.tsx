import Image from 'next/image'
import { getSettings } from '@/lib/settings'

type HeroSectionProps = {
  page: string
  defaultImage?: string
  defaultVideo?: string
  defaultTitle?: string
  defaultSubtitle?: string
  defaultCta?: string
  defaultCtaLink?: string
}

const DEFAULT_IMAGES: Record<string, string> = {
  'home': '/og-default.jpg',
  'a-propos': '/og-default.jpg',
  'contact': '/og-default.jpg',
  'slow-travel': '/og-default.jpg',
  'destinations': '/og-default.jpg',
  'travel-planning': '/og-default.jpg',
  'hotel-consulting': '/og-default.jpg',
  'temoignages': '/og-default.jpg',
  'etudes-de-cas': '/og-default.jpg',
  'ai-hotellerie': '/og-default.jpg',
}

async function getPageImages(): Promise<Record<string, string>> {
  try {
    const settings = await getSettings('hero_page_images')
    if (settings.hero_page_images) {
      const parsed = JSON.parse(settings.hero_page_images)
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...DEFAULT_IMAGES, ...parsed }
      }
    }
  } catch {}
  return DEFAULT_IMAGES
}

export default async function Hero({ 
  page, 
  defaultImage, 
  defaultVideo,
  defaultTitle, 
  defaultSubtitle,
  defaultCta,
  defaultCtaLink,
}: HeroSectionProps) {
  const prefix = page === 'home' ? '' : `${page}_`
  
  const [heroSettings, pageImages] = await Promise.all([
    getSettings(
      'hero_type',
      `hero_video_url`,
      `hero_poster_image`,
      `hero_background_image`,
      `${prefix}page_title`,
      `${prefix}hero_title`,
      `${prefix}hero_subtitle`,
      `${prefix}hero_cta`,
      `${prefix}hero_cta_link`,
    ),
    getPageImages(),
  ])
  
  const heroType = heroSettings.hero_type || 'image'
  const heroVideo = heroSettings.hero_video_url || defaultVideo
  const heroPoster = heroSettings.hero_poster_image || heroSettings.hero_background_image
  const backgroundImage = heroSettings.hero_background_image || defaultImage || pageImages[page] || pageImages['a-propos']
  const title = heroSettings.hero_title || heroSettings[`${prefix}page_title`] || defaultTitle || ''
  const subtitle = heroSettings.hero_subtitle || heroSettings[`${prefix}hero_subtitle`] || defaultSubtitle || ''
  const cta = heroSettings.hero_cta || defaultCta || ''
  const ctaLink = heroSettings.hero_cta_link || defaultCtaLink || ''

  return (
    <section className="relative h-[55vh] md:h-[65vh] bg-stone-900 flex items-end overflow-hidden">
      {/* Hero Video */}
      {heroType === 'video' && heroVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroPoster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: `calc(var(--hero-overlay-opacity, 0.4) * 1)` }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      )}
      {/* Hero Image (default or fallback) */}
      {(heroType === 'image' || !heroVideo) && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ opacity: `calc(var(--hero-overlay-opacity, 0.4) * 1)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="relative z-10 px-6 md:px-16 pb-14 md:pb-24 max-w-3xl">
        {title && (
          <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.1] mb-5">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {cta && ctaLink && (
          <a href={ctaLink} className="inline-block mt-6 px-6 py-3 rounded-lg font-medium transition-colors" style={{ backgroundColor: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}>
            {cta}
          </a>
        )}
      </div>
    </section>
  )
}
