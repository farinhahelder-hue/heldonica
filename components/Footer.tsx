'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEditableContext } from '@/components/inline-edit/InlineEditProvider'
import { useContentLoader } from '@/hooks/useContentLoader'

const NAV_LABEL_FALLBACKS = ['Destinations', 'Blog', 'Sur mesure', 'À propos', 'Consulting', 'Contact']
const NAV_URL_FALLBACKS = ['/destinations', '/blog', '/travel-planning', '/a-propos', '/expert-hotelier', '/contact']

function arr<T>(items: number, fn: (i: number) => T): T[] {
  return Array.from({ length: items }, (_, i) => fn(i))
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subscribeError, setSubscribeError] = useState('')
  const { zones } = useEditableContext()
  const { settings } = useContentLoader()
  const currentYear = new Date().getFullYear()

  const z = zones as Record<string, any>
  const cz = (zoneKey: string, fallback: string) => {
    // InlineEditProvider stores zones as 'page__zoneKey'
    if (z[`global__${zoneKey}`]?.value) return z[`global__${zoneKey}`].value
    for (const key of Object.keys(z)) {
      if (key.endsWith(`__${zoneKey}`) && z[key]?.value) return z[key].value
    }
    return fallback
  }

  const siteName = cz('header_site_name', 'Heldonica')
  const tagline = cz('footer_tagline', 'Slow travel vécu, conçu pour toi.')
  const footerText = cz('footer_copyright', `© ${currentYear} Heldonica. Tous droits réservés.`)
  const contactEmail = cz('footer_email', 'contact@heldonica.fr')

  const newsletterTitle = cz('newsletter_title', 'Reçois les pépites avant les autres')
  const newsletterDesc = cz('newsletter_desc', 'Chaque semaine : un lieu qu\'on a aimé, un conseil qu\'on aurait aimé avoir avant, et parfois un avant-goût de ce qu\'on prépare. Pas de spam, jamais.')
  const newsletterPlaceholder = cz('footer_email_placeholder', 'ton@email.fr')
  const newsletterBtn = cz('newsletter_cta', "Je m'inscris")
  const newsletterBtnLoading = cz('newsletter_cta_loading', 'Envoi...')
  const footerCtaLabel = cz('footer_cta_label', 'Écrire à Heldonica')
  const footerCtaUrl = cz('footer_cta_url', 'mailto:contact@heldonica.fr')

  const newsletterSuccessTitle = cz('newsletter_success_title', "C'est noté !")
  const newsletterSuccessText = cz('newsletter_success_text', "Tu recevras ta première pépite très vite.")
  const newsletterErrorApi = cz('newsletter_error_api', "Une erreur est survenue. Réessaie ou écris-nous directement.")
  const newsletterErrorNet = cz('newsletter_error_net', "Connexion impossible. Réessaie dans quelques instants.")
  const newsletterRgpdHtml = cz('newsletter_rgpd_html', "J'accepte de recevoir les e-mails de slow travel d'Heldonica. Tu peux te désinscrire à tout moment. Voir notre <a href='/politique-confidentialite' class='text-eucalyptus hover:underline'>politique de confidentialité</a>.")

  const navTitle = cz('nav_footer_title', 'Navigation')
  const destTitle = cz('destinations_footer_title', 'Destinations')
  const guidesTitle = cz('guides_footer_title', 'Guides gratuits')
  const legalTitle = cz('legal_footer_title', 'Légal')

  const navLinks = (() => {
    const raw = settings?.footer_nav_json
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as { label: string; href: string }[]
      } catch {}
    }
    return arr(6, (i) => ({
      label: cz(`nav_item_${i + 1}_label`, NAV_LABEL_FALLBACKS[i]),
      href: cz(`nav_item_${i + 1}_url`, NAV_URL_FALLBACKS[i]),
    }))
  })()

  const destinationsLinks = (() => {
    const raw = settings?.footer_destinations_json
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as { label: string; href: string }[]
      } catch {}
    }
    // fallback: 5 individual zone overrides
    return arr(5, (i) => ({
      label: cz(`footer_dest_item_${i + 1}_label`, ['Madère', 'Roumanie', 'Monténégro', 'Grèce', 'Colombie'][i]),
      href: cz(`footer_dest_item_${i + 1}_url`, ['/destinations/madere', '/destinations/roumanie', '/destinations/montenegro', '/destinations/grece', '/destinations/colombie'][i]),
    }))
  })()

  const guidesLinks = (() => {
    const raw = settings?.footer_guides_json
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as { label: string; href: string }[]
      } catch {}
    }
    return arr(4, (i) => ({
      label: cz(`footer_guide_item_${i + 1}_label`, ['Guide Madère', 'Guides pratiques', 'Carnets de voyage', 'Organisateur de voyage'][i]),
      href: cz(`footer_guide_item_${i + 1}_url`, ['/guides/top-10-pepites-madere', '/blog?categorie=Guides Pratiques', '/blog?categorie=Carnets Voyage', '/organisateur'][i]),
    }))
  })()

  const legalLinks = arr(3, (i) => ({
    label: cz(`footer_legal_item_${i + 1}_label`, ['Mentions légales', 'Politique de confidentialité', 'Programme partenaires'][i]),
    href: cz(`footer_legal_item_${i + 1}_url`, ['/mentions-legales', '/politique-confidentialite', '/politique-affiliation'][i]),
  }))

  const soc = (key: string, fallback: string) => settings?.[key] || fallback

  const socialLinks = [
    ...(soc('social_instagram', 'https://www.instagram.com/heldonica/') ? [{ href: soc('social_instagram', 'https://www.instagram.com/heldonica/'), label: 'Instagram', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" /></svg> }] : []),
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setSubscribeError('')
    try {
      const res = await fetch('/api/brevo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })

      if (res.ok) {
        setSubscribed(true)
      } else {
        setSubscribeError(newsletterErrorApi)
      }
    } catch {
      setSubscribeError(newsletterErrorNet)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-stone-950 text-stone-200">
      {/* Newsletter section */}
      <div className="border-b border-stone-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                {newsletterTitle}
              </h3>
              <p className="text-stone-400 leading-relaxed">
                {newsletterDesc}
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="flex items-center gap-3 bg-eucalyptus/10 border border-eucalyptus/30 rounded-2xl px-6 py-4">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-white font-semibold">{newsletterSuccessTitle}</p>
                    <p className="text-stone-400 text-sm">{newsletterSuccessText}</p>
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label htmlFor="footer-newsletter-email" className="sr-only">{newsletterPlaceholder}</label>
                      <input
                        id="footer-newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={newsletterPlaceholder}
                        required
                        disabled={loading}
                        className="flex-1 px-5 py-3.5 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3.5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? newsletterBtnLoading : newsletterBtn}
                      </button>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <input
                        id="footer-newsletter-rgpd"
                        type="checkbox"
                        required
                        className="mt-1 h-4 w-4 rounded border-stone-700 bg-stone-900 text-eucalyptus focus:ring-eucalyptus cursor-pointer"
                      />
                      <label
                        htmlFor="footer-newsletter-rgpd"
                        className="text-xs text-stone-400 leading-normal"
                        dangerouslySetInnerHTML={{ __html: newsletterRgpdHtml }}
                      />
                    </div>
                  </form>
                  {subscribeError && (
                    <p role="alert" className="mt-2 text-red-400 text-sm">{subscribeError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Colonne 1 - Marque */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-serif font-bold text-white">{siteName}</span>
            </Link>
            <p className="text-sm text-teal/80 mb-4">{tagline}</p>
            {settings.site_description && (
              <p className="text-sm leading-relaxed text-stone-400 mb-6">
                {settings.site_description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-700 text-stone-200 transition-all duration-200 hover:bg-eucalyptus hover:text-white"
                    title={social.label}
                    aria-label={`Nous suivre sur ${social.label}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{navTitle}</h4>
            <ul className="space-y-3 text-sm" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 - Destinations */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{destTitle}</h4>
            <ul className="space-y-3 text-sm" role="list">
              {destinationsLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 - Guides & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{guidesTitle}</h4>
            <ul className="space-y-3 text-sm mb-8" role="list">
              {guidesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{legalTitle}</h4>
            <ul className="space-y-3 text-sm" role="list">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
            <div className="flex items-center gap-4">
              <p>{footerText}</p>
              <span className="hidden md:inline">•</span>
              <a href={`mailto:${contactEmail}`} className="hover:text-stone-300 transition-colors">
                {contactEmail}
              </a>
            </div>
            {settings.footer_links && (
              <p className="text-xs text-stone-600">{settings.footer_links}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
