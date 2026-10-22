'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useContentLoader, getCmsOrSetting, getZoneLinks } from '@/hooks/useContentLoader'
import type { CmsZone } from '@/lib/content-loader'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { zones, settings } = useContentLoader()

  const accountHref = !loading && user ? '/dashboard' : '/auth/login'
  const accountLabel = !loading && user ? 'Mon espace' : 'Connexion'
  
  // CMS 3.0: cascade cms_editable_zones > site_settings > hardcoded
  const siteName = getCmsOrSetting(
    'header_site_name', 'site_name', 'Heldonica',
    zones as Record<string, CmsZone>, settings
  )
  const ctaLabel = getCmsOrSetting(
    'header_cta_label', 'primary_cta_label', 'Planifier mon voyage',
    zones as Record<string, CmsZone>, settings
  )
  const ctaUrl = getCmsOrSetting(
    'header_cta_url', 'primary_cta_url', '/travel-planning',
    zones as Record<string, CmsZone>, settings
  )
  const logoUrl = getCmsOrSetting(
    'header_logo_url', 'logo_url', '',
    zones as Record<string, CmsZone>, settings
  )

  // Fermer le menu mobile au changement de route + détection scroll
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Ajout classe shadow au scroll
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      setScrolled(window.scrollY > 10)
      ticking = false;
    }

    // ⚡ Bolt Performance Optimization:
    // What: Throttled scroll event listener using requestAnimationFrame.
    // Why: Scroll events fire rapidly. Updating React state directly on every scroll event
    //      can block the main thread. requestAnimationFrame defers the state update until
    //      the next browser render cycle.
    // Impact: Prevents unnecessary state updates and reduces main thread blocking during scroll.
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll)
        ticking = true;
      }
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

  // Menu principal piloté par le CMS (zones `nav_item_<n>_label` / `_url`).
  const safeNavItems = getZoneLinks(
    'nav_item',
    [
      { label: 'Accueil', url: '/' },
      { label: 'Destinations', url: '/destinations' },
      { label: 'Carnets de route', url: '/blog' },
      { label: 'Travel Planning', url: '/travel-planning' },
      { label: 'À propos', url: '/a-propos' },
    ],
    zones as Record<string, CmsZone>
  )

  return (
    <>
      <nav 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-[#F7F3EC]/98 backdrop-blur-md border-b border-[#DED5C6]' 
            : 'bg-[#F7F3EC]/92 backdrop-blur-sm border-b border-[#E8E0D2]'
        }`} 
        role="navigation" 
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:py-3.5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-mahogany transition-all duration-200 hover:text-eucalyptus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2"
            aria-label={`${siteName} accueil`}
          >
            {logoUrl && logoUrl !== '/logo.svg' ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={140}
                height={32}
                className="h-8 w-auto"
                priority={logoUrl.endsWith('.svg')}
                unoptimized={!logoUrl.endsWith('.svg')}
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="h-7 w-7 flex-shrink-0">
                <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1.1" className="text-mahogany/50" />
                <line x1="12" y1="10.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="24" y1="10.5" x2="24" y2="22.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="12" y1="16.2" x2="24" y2="16.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9.5 26.5 Q12.5 24.8 15.5 26.5 Q18.5 28.2 21.5 26.5 Q24.5 24.8 26.5 26.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" className="text-eucalyptus" />
              </svg>
            )}
            <span className="text-xl font-serif font-normal tracking-tight lg:text-2xl">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {safeNavItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                aria-current={pathname === item.url ? 'page' : undefined}
                className={`py-1 text-sm transition-colors duration-200 border-b focus-visible:outline-none ${
                  pathname === item.url
                    ? 'text-mahogany border-mahogany font-medium'
                    : 'text-charcoal/75 border-transparent hover:text-mahogany hover:border-mahogany/40'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/expert-hotelier"
              className="text-xs text-charcoal/60 hover:text-mahogany transition-colors px-2 py-1"
            >
              Espace Hôteliers
            </Link>
            <Link
              href={ctaUrl}
              className="rounded-sm bg-mahogany hover:bg-eucalyptus px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#F7F3EC] transition-colors duration-200"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-3 lg:hidden">
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
            className={`absolute right-0 top-full z-50 w-full max-w-sm bg-[#F7F3EC] border-b border-l border-[#DED5C6] transition-all duration-300 ease-out ${
              open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            <div className="flex flex-col gap-1 p-5">
              {/* Header du menu avec bouton fermer */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#DED5C6]">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-mahogany">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] text-charcoal/70 transition-colors hover:border-mahogany hover:text-mahogany"
                  aria-label="Fermer le menu"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation items */}
              {safeNavItems.map((item, index) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.url ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-sm px-4 py-3 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mahogany ${
                    pathname === item.url
                      ? 'bg-[#EFE9DF] text-mahogany'
                      : 'text-charcoal hover:bg-[#EFE9DF] hover:text-mahogany'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] text-eucalyptus" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {index === 0 && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
                      {index === 1 && <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
                      {index === 2 && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
                      {index === 3 && <><circle cx="12" cy="12" r="10" /><polygon points="12 2 12 12 18 12" fill="currentColor" /></>}
                      {index === 4 && <><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /></>}
                    </svg>
                  </span>
                  {item.label}
                </Link>
              ))}

              {/* Séparateur */}
              <div className="my-3 border-t border-[#DED5C6]" />

              {/* CTA principal */}
              <Link
                href={ctaUrl}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2.5 rounded-sm bg-mahogany px-4 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#FAF7F2] transition-colors duration-200 hover:bg-eucalyptus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mahogany focus-visible:ring-offset-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
