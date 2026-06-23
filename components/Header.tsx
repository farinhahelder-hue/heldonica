'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

type SiteSettings = Record<string, string>;

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({})
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    fetch('/api/cms/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') setSettings(data);
      })
      .catch(() => {});
  }, []);

  const s = (key: string, fallback = '') => settings[key] || fallback;

  const accountHref = !loading && user ? '/dashboard' : '/auth/login'
  const accountLabel = !loading && user ? 'Mon espace' : 'Connexion'
  const siteName = s('site_name', 'Heldonica')
  const ctaLabel = s('primary_cta_label', 'Planifier mon voyage')
  const ctaUrl = s('primary_cta_url', '/travel-planning')
  const logoUrl = s('logo_url')

  // Fermer le menu mobile au changement de route + détection scroll
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Ajout classe shadow au scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/blog', label: 'Inspirations' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/travel-planning', label: 'Services' },
    { href: '/expert-hotelier', label: 'Consulting hôtelier' },
    { href: '/a-propos', label: 'À propos' },
  ]

  const safeNavItems = Array.isArray(navItems) ? navItems : []

  return (
    <>
      <nav 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-stone-100/50' 
            : 'bg-white/95 backdrop-blur-sm border-b border-stone-100'
        }`} 
        role="navigation" 
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-amber-900 transition-all duration-200 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
            aria-label={`${siteName} accueil`}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-8 w-auto" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1.2" />
                <line x1="10" y1="9" x2="10" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="9" x2="24" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="15.5" x2="24" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 26 Q11 24 14 26 Q17 28 20 26 Q23 24 26 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
              </svg>
            )}
            <span className="text-lg font-serif font-bold tracking-tight lg:text-xl">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {safeNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2 ${
                  pathname === item.href
                    ? 'text-amber-900'
                    : 'text-stone-600 hover:text-amber-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaUrl}
              className="ml-3 rounded-full bg-eucalyptus px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* CTA visible sur mobile */}
            <Link 
              href={ctaUrl} 
              className="rounded-full bg-eucalyptus px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95"
            >
              {ctaLabel}
            </Link>
            
            {/* Hamburger animé */}
            <button
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 transition-all duration-300 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 active:scale-95"
            >
              <span className="flex h-5 w-5 flex-col items-center justify-center">
                {/* Ligne du haut */}
                <span 
                  className={`mb-1 block h-0.5 w-5 transform rounded-full bg-stone-700 transition-all duration-300 ${
                    open ? 'translate-y-1.5 rotate-45 bg-amber-900' : ''
                  }`}
                />
                {/* Ligne du milieu */}
                <span 
                  className={`mb-1 block h-0.5 w-5 rounded-full bg-stone-700 transition-all duration-300 ${
                    open ? 'scale-x-0 opacity-0' : ''
                  }`}
                />
                {/* Ligne du bas */}
                <span 
                  className={`block h-0.5 w-5 transform rounded-full bg-stone-700 transition-all duration-300 ${
                    open ? '-translate-y-1.5 -rotate-45 bg-amber-900' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Menu mobile avec overlay */}
        <div
          id="mobile-menu"
          className={`lg:hidden`}
        >
          {/* Overlay avec backdrop */}
          <div 
            className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
              open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu panel */}
          <div 
            className={`absolute right-0 top-full z-50 w-full max-w-sm bg-white shadow-2xl transition-all duration-300 ease-out ${
              open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            <div className="flex flex-col gap-1 p-5">
              {/* Header du menu avec bouton fermer */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                <span className="text-sm font-semibold text-stone-700">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
                  aria-label="Fermer le menu"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation items */}
              {safeNavItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 ${
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-900'
                      : 'text-stone-700 hover:bg-amber-50 hover:text-amber-900 active:scale-[0.98]'
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {index === 0 && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
                      {index === 1 && <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
                      {index === 2 && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
                      {index === 3 && <><circle cx="12" cy="12" r="10" /><polygon points="12 2 12 12 18 12" fill="currentColor" /></>}
                      {index === 4 && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                      {index === 5 && <><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /></>}
                    </svg>
                  </span>
                  {item.label}
                </Link>
              ))}

              {/* Séparateur */}
              <div className="my-3 border-t border-stone-100" />

              {/* CTA principal */}
              <Link
                href={ctaUrl}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-eucalyptus px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-eucalyptus/20 transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                {ctaLabel}
              </Link>

              {/* Account link */}
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-eucalyptus/20 bg-eucalyptus/10 text-eucalyptus" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5" />
                  </svg>
                </span>
                {accountLabel}
              </Link>

              {/* Liens légaux rapides */}
              <div className="mt-4 flex flex-wrap gap-3 px-1">
                <Link href="/contact" className="text-xs text-stone-500 hover:text-stone-700">Contact</Link>
                <span className="text-xs text-stone-300">•</span>
                <Link href="/mentions-legales" className="text-xs text-stone-500 hover:text-stone-700">Mentions légales</Link>
                <span className="text-xs text-stone-300">•</span>
                <Link href="/politique-confidentialite" className="text-xs text-stone-500 hover:text-stone-700">Confidentialité</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
