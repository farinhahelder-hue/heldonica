interface PageHeroProps {
  title: string
  /** Breadcrumb text, e.g. "Heldonica → Destinations" */
  breadcrumb?: string
  description?: string
  /** Optional URL for a background image (will be overlaid at 20% opacity) */
  backgroundImage?: string
  /** Optional accent line displayed above the title */
  eyebrow?: string
  children?: React.ReactNode
}

/**
 * PageHero — composant hero standardisé pour toutes les pages internes.
 * Usage : /destinations, /contact, /a-propos, /blog, /hotel-consulting
 *
 * <PageHero
 *   title="Nos Destinations Slow Travel"
 *   breadcrumb="Heldonica → Destinations"
 *   description="Des lieux qu'on a vraiment pris le temps de comprendre."
 * />
 */
export function PageHero({
  title,
  breadcrumb,
  description,
  backgroundImage,
  eyebrow,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-charcoal py-16 md:py-24">
      {/* Background image overlay */}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          width={1400}
          height={600}
          loading="eager"
        />
      )}

      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(107,42,26,0.35) 0%, transparent 60%)' }}
      />

      <div className="container relative mx-auto px-6">
        {/* Breadcrumb */}
        {breadcrumb && (
          <p className="mb-4 text-xs uppercase tracking-widest text-white/40">
            {breadcrumb}
          </p>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <p className="mb-3 font-serif text-mahogany/80 italic">{eyebrow}</p>
        )}

        {/* Title */}
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-light leading-[1.1] tracking-tight text-white">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            {description}
          </p>
        )}

        {/* Optional slot (e.g. CTA buttons) */}
        {children && (
          <div className="mt-6">{children}</div>
        )}
      </div>
    </section>
  )
}
