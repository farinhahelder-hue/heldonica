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
  'home': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=85',
  'a-propos': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=85',
  'contact': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85',
  'slow-travel': 'https://images.unsplash.com/photo-1506905925346-21bda4dcddf9?w=1400&q=85',
  'destinations': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=85',
  'travel-planning': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=85',
  'hotel-consulting': 'https://images.unsplash.com/photo-1566073771259-6a8506399945?w=1400&q=85',
  'temoignages': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=85',
  'etudes-de-cas': 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=1400&q=85',
  'ai-hotellerie': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=85',
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
  // Build the key prefix for this page
  const prefix = page === 'home' ? '' : `${page}_`
  
  const heroSettings = await getSettings(
    'hero_type',
    `hero_video_url`,
    `hero_poster_image`,
    `hero_background_image`,
    `${prefix}page_title`,
    `${prefix}hero_title`,
    `${prefix}hero_subtitle`,
    `${prefix}hero_cta`,
    `${prefix}hero_cta_link`,
  )
  
  const heroType = heroSettings.hero_type || 'image'
  const heroVideo = heroSettings.hero_video_url || defaultVideo
  const heroPoster = heroSettings.hero_poster_image || heroSettings.hero_background_image
  const backgroundImage = heroSettings.hero_background_image || defaultImage || DEFAULT_IMAGES[page] || DEFAULT_IMAGES['a-propos']
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
          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
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
