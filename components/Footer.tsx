'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/blog', label: 'Inspirations' },
    { href: '/travel-planning', label: 'Services' },
    { href: '/a-propos', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ]

  const destinationsLinks = [
    { href: '/destinations/madere', label: 'Madère' },
    { href: '/destinations/roumanie', label: 'Roumanie' },
    { href: '/destinations/montenegro', label: 'Monténégro' },
    { href: '/destinations/grece', label: 'Grèce' },
    { href: '/destinations/colombie', label: 'Colombie' },
  ]

  const guidesLinks = [
    { href: '/guides/top-10-pepites-madere', label: 'Guide Madère' },
    { href: '/blog?categorie=Guides Pratiques', label: 'Guides pratiques' },
    { href: '/blog?categorie=Carnets Voyage', label: 'Carnets de voyage' },
  ]

  const legalLinks = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
    { href: '/politique-affiliation', label: 'Programme partenaires' },
  ]

  const socialLinks = [
    { 
      href: 'https://www.instagram.com/heldonica/', 
      label: 'Instagram',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
        </svg>
      ),
    },
    { 
      href: 'https://www.youtube.com/@heldonica', 
      label: 'YouTube',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    { 
      href: 'https://fr.pinterest.com/heldonica', 
      label: 'Pinterest',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
    },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      // TODO: Intégrer l'API Brevo ici
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
                Reçois les pépites avant les autres
              </h3>
              <p className="text-stone-400 leading-relaxed">
                Chaque semaine : un lieu qu&apos;on a aimé, un conseil qu&apos;on aurait aimé avoir avant, et parfois un avant-goût de ce qu&apos;on prépare.
                Pas de spam, jamais.
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="flex items-center gap-3 bg-eucalyptus/10 border border-eucalyptus/30 rounded-2xl px-6 py-4">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-white font-semibold">C&apos;est noté !</p>
                    <p className="text-stone-400 text-sm">Tu recevras ta première pépite très bientôt.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    className="flex-1 px-5 py-3.5 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all whitespace-nowrap"
                  >
                    Je m&apos;inscris
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
              <span className="text-2xl font-serif font-bold text-white">Heldonica</span>
            </Link>
            <p className="text-sm text-amber-200 mb-4">Slow travel vécu, conçu juste.</p>
            <p className="text-sm leading-relaxed text-stone-400 mb-6">
              On voyage lentement, on teste vraiment, on partage ce qui tient sur le terrain.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-800 text-stone-400 transition-all duration-200 hover:bg-eucalyptus hover:text-white"
                  title={social.label}
                  aria-label={`Suivez-nous sur ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Navigation</h4>
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
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Destinations</h4>
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

          {/* Colonne 4 - Guides & Légal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Guides gratuits</h4>
            <ul className="space-y-3 text-sm mb-8" role="list">
              {guidesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Légal</h4>
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
              <p>© {currentYear} Heldonica. Tous droits réservés.</p>
              <span className="hidden md:inline">•</span>
              <a href="mailto:contact@heldonica.fr" className="hover:text-stone-300 transition-colors">
                contact@heldonica.fr
              </a>
            </div>
            <p className="text-xs text-stone-600">
              Photos : Heldonica & Unsplash • Hébergé en France 🇫🇷
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
