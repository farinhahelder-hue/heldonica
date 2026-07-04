'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useContentLoader, getCmsOrSetting } from '@/hooks/useContentLoader'
import type { CmsZone } from '@/lib/content-loader'

const NAV_LABEL_FALLBACKS = ['Accueil', 'Destinations', 'Blog', 'Services', 'Services', 'À propos', 'Contact']
const NAV_URL_FALLBACKS = ['/', '/destinations', '/blog', '/travel-planning', '/nos-services', '/a-propos', '/contact']

function arr<T>(items: number, fn: (i: number) => T): T[] {
  return Array.from({ length: items }, (_, i) => fn(i))
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { zones, settings } = useContentLoader()
  const currentYear = new Date().getFullYear()

  const z = zones as Record<string, CmsZone>
  const cz = (zoneKey: string, settingKey: string, fallback: string) =>
    getCmsOrSetting(zoneKey, settingKey, fallback, z, settings)

  const siteName = cz('header_site_name', 'site_name', 'Heldonica')
  const tagline = cz('footer_tagline', 'site_tagline', 'Slow travel vécu, conçu pour toi.')
  const footerText = cz('footer_copyright', 'footer_text', `© ${currentYear} Heldonica. Tous droits réservés.`)
  const contactEmail = cz('footer_email', 'contact_email', 'contact@heldonica.fr')

  const newsletterTitle = cz('newsletter_title', 'newsletter_title', 'Reçois les pépites avant les autres')
  const newsletterDesc = cz('newsletter_desc', 'newsletter_desc', 'Chaque semaine : un lieu qu\'on a aimé, un conseil qu\'on aurait aimé avoir avant, et parfois un avant-goût de ce qu\'on prépare. Pas de spam, jamais.')
  const newsletterPlaceholder = cz('footer_email_placeholder', 'footer_email_placeholder', 'ton@email.fr')
  const newsletterBtn = cz('newsletter_cta', 'newsletter_cta', "Je m'inscris")
  const newsletterBtnLoading = cz('newsletter_cta_loading', 'newsletter_cta_loading', 'Envoi...')
  const footerCtaLabel = cz('footer_cta_label', 'footer_cta_label', 'Écrire à Heldonica')
  const footerCtaUrl = cz('footer_cta_url', 'footer_cta_url', 'mailto:contact@heldonica.fr')

  const navTitle = cz('nav_footer_title', 'nav_footer_title', 'Navigation')
  const destTitle = cz('destinations_footer_title', 'destinations_footer_title', 'Destinations')
  const guidesTitle = cz('guides_footer_title', 'guides_footer_title', 'Guides gratuits')
  const legalTitle = cz('legal_footer_title', 'legal_footer_title', 'Légal')

  const navLinks = arr(7, (i) => ({
    label: cz(`nav_item_${i + 1}_label`, `nav_item_${i + 1}_label`, NAV_LABEL_FALLBACKS[i]),
    href: cz(`nav_item_${i + 1}_url`, `nav_item_${i + 1}_url`, NAV_URL_FALLBACKS[i]),
  }))

  const destinationsLinks = arr(5, (i) => ({
    label: cz(`footer_dest_item_${i + 1}_label`, `footer_dest_item_${i + 1}_label`, ['Madere', 'Roumanie', 'Montenegro', 'Grece', 'Colombie'][i]),
    href: cz(`footer_dest_item_${i + 1}_url`, `footer_dest_item_${i + 1}_url`, ['/destinations/madere', '/destinations/roumanie', '/destinations/montenegro', '/destinations/grece', '/destinations/colombie'][i]),
  }))

  const guidesLinks = arr(3, (i) => ({
    label: cz(`footer_guide_item_${i + 1}_label`, `footer_guide_item_${i + 1}_label`, ['Guide Madere', 'Guides pratiques', 'Carnets de voyage'][i]),
    href: cz(`footer_guide_item_${i + 1}_url`, `footer_guide_item_${i + 1}_url`, ['/guides/top-10-pepites-madere', '/blog?categorie=Guides Pratiques', '/blog?categorie=Carnets Voyage'][i]),
  }))

  const legalLinks = arr(3, (i) => ({
    label: cz(`footer_legal_item_${i + 1}_label`, `footer_legal_item_${i + 1}_label`, ['Mentions légales', 'Politique de confidentialité', 'Programme partenaires'][i]),
    href: cz(`footer_legal_item_${i + 1}_url`, `footer_legal_item_${i + 1}_url`, ['/mentions-legales', '/politique-confidentialite', '/politique-affiliation'][i]),
  }))

  const soc = (key: string, fallback: string) => settings?.[key] || fallback

  const socialLinks = [
    ...(soc('social_instagram', 'https://www.instagram.com/heldonica/') ? [{ href: soc('social_instagram', ''), label: 'Instagram', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" /></svg> }] : []),
    ...(soc('social_youtube', 'https://www.youtube.com/@heldonica') ? [{ href: soc('social_youtube', ''), label: 'YouTube', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> }] : []),
    ...(soc('social_pinterest', 'https://fr.pinterest.com/heldonica') ? [{ href: soc('social_pinterest', ''), label: 'Pinterest', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg> }] : []),
    ...(soc('social_facebook', '') ? [{ href: soc('social_facebook', ''), label: 'Facebook', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> }] : []),
    ...(soc('social_tiktok', '') ? [{ href: soc('social_tiktok', ''), label: 'TikTok', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg> }] : []),
    ...(soc('social_linkedin', '') ? [{ href: soc('social_linkedin', ''), label: 'LinkedIn', icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> }] : []),
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/brevo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })

      if (res.ok) {
        setSubscribed(true)
      } else {
        console.error('Erreur inscription:', await res.json())
      }
    } catch (err) {
      console.error('Erreur reseau:', err)
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
                    <p className="text-white font-semibold">C'est note !</p>
                    <p className="text-stone-400 text-sm">Tu recevras ta premiere pepite tres vite.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
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
                </form>
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
                    aria-label={`Suivez-nous sur ${social.label}`}
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
                  <Link href={link.href} className="text-stone-400 transition-colors duration-200 hover:text-white">
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
                  <Link href={link.href} className="text-stone-400 transition-colors duration-200 hover:text-white">
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
                  <Link href={link.href} className="text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{legalTitle}</h4>
            <ul className="space-y-3 text-sm" role="list">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 transition-colors duration-200 hover:text-white">
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
