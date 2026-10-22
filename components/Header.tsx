'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useContentLoader, getCmsOrSetting, getZoneLinks } from '@/hooks/useContentLoader'
import type { CmsZone } from '@/lib/content-loader'

// Même borne que buildLinkKeys('nav_item', …) dans lib/site-content.ts.
const NAV_MAX_ITEMS = 5

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
    'header_cta_label', 'primary_cta_label', 'Préparer un voyage',
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
  // Cinq entrées au plus : le logo ramène à l'accueil, Contact et Connexion
  // vivent dans le pied de page et le menu mobile.
  const safeNavItems = getZoneLinks(
    'nav_item',
    [
      { label: 'Carnets', url: '/blog' },
      { label: 'Destinations', url: '/destinations' },
      { label: 'Voyager avec nous', url: '/travel-planning' },
      { label: 'Le duo', url: '/a-propos' },
      { label: 'Hôteliers', url: '/expert-hotelier' },
    ],
    zones as Record<string, CmsZone>,
    NAV_MAX_ITEMS
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:py-3.5">
          {/* Logo : ne rétrécit jamais, l'écart avec le menu est porté par gap-8 */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-mahogany transition-all duration-200 hover:text-eucalyptus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2"
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
              <svg width="32" height="32" viewBox="-69.5 0 341 341" fill="none" aria-hidden="true" className="h-7 w-7 flex-shrink-0 text-eucalyptus transition-colors duration-200">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="currentColor"
                  d="M 69.0,0.0 L 72.0,1.0 L 98.0,33.0 L 108.0,48.0 L 120.0,69.0 L 120.0,71.0 L 125.0,80.0 L 125.0,82.0 L 128.0,87.0 L 133.0,101.0 L 133.0,104.0 L 136.0,113.0 L 136.0,117.0 L 137.0,118.0 L 137.0,123.0 L 138.0,124.0 L 139.0,144.0 L 140.0,145.0 L 142.0,143.0 L 149.0,133.0 L 157.0,125.0 L 167.0,136.0 L 181.0,155.0 L 191.0,173.0 L 198.0,192.0 L 198.0,195.0 L 200.0,200.0 L 200.0,205.0 L 201.0,206.0 L 201.0,237.0 L 200.0,238.0 L 200.0,243.0 L 198.0,247.0 L 197.0,254.0 L 191.0,267.0 L 191.0,269.0 L 189.0,271.0 L 183.0,283.0 L 175.0,294.0 L 161.0,309.0 L 157.0,340.0 L 149.0,340.0 L 149.0,334.0 L 150.0,333.0 L 151.0,324.0 L 153.0,319.0 L 154.0,309.0 L 152.0,308.0 L 140.0,295.0 L 127.0,275.0 L 119.0,257.0 L 116.0,247.0 L 116.0,243.0 L 114.0,240.0 L 98.0,264.0 L 89.0,275.0 L 76.0,288.0 L 75.0,298.0 L 74.0,299.0 L 74.0,306.0 L 73.0,307.0 L 73.0,314.0 L 72.0,315.0 L 71.0,327.0 L 70.0,328.0 L 69.0,336.0 L 67.0,338.0 L 60.0,338.0 L 58.0,337.0 L 57.0,336.0 L 57.0,332.0 L 58.0,331.0 L 58.0,327.0 L 61.0,317.0 L 61.0,313.0 L 62.0,312.0 L 64.0,298.0 L 65.0,297.0 L 65.0,292.0 L 66.0,291.0 L 46.0,270.0 L 29.0,246.0 L 15.0,220.0 L 5.0,190.0 L 4.0,182.0 L 3.0,181.0 L 3.0,176.0 L 2.0,175.0 L 2.0,169.0 L 1.0,168.0 L 0.0,140.0 L 1.0,139.0 L 2.0,122.0 L 3.0,121.0 L 3.0,117.0 L 5.0,112.0 L 5.0,108.0 L 8.0,100.0 L 8.0,97.0 L 10.0,94.0 L 14.0,81.0 L 31.0,49.0 L 53.0,18.0 L 68.0,1.0 Z M 70.0,9.0 L 69.0,8.0 L 64.0,13.0 L 44.0,40.0 L 45.0,52.0 L 49.0,66.0 L 51.0,69.0 L 53.0,76.0 L 71.0,110.0 L 75.0,124.0 L 76.0,125.0 L 77.0,124.0 L 76.0,78.0 L 75.0,77.0 L 75.0,65.0 L 74.0,64.0 L 74.0,53.0 L 73.0,52.0 L 73.0,41.0 L 72.0,40.0 L 72.0,28.0 L 71.0,27.0 L 70.0,10.0 Z M 72.0,9.0 L 71.0,8.0 L 70.0,9.0 L 70.0,14.0 L 71.0,15.0 L 71.0,21.0 L 72.0,22.0 L 74.0,42.0 L 75.0,43.0 L 80.0,93.0 L 81.0,94.0 L 82.0,93.0 L 84.0,84.0 L 90.0,71.0 L 86.0,82.0 L 84.0,97.0 L 83.0,98.0 L 83.0,104.0 L 82.0,105.0 L 82.0,125.0 L 83.0,126.0 L 83.0,143.0 L 84.0,144.0 L 84.0,179.0 L 83.0,180.0 L 83.0,189.0 L 84.0,190.0 L 85.0,189.0 L 91.0,176.0 L 91.0,174.0 L 94.0,170.0 L 99.0,159.0 L 101.0,157.0 L 109.0,139.0 L 114.0,124.0 L 114.0,120.0 L 116.0,115.0 L 116.0,110.0 L 117.0,109.0 L 117.0,101.0 L 118.0,100.0 L 118.0,81.0 L 109.0,62.0 L 93.0,36.0 L 78.0,16.0 L 72.0,10.0 Z M 43.0,45.0 L 42.0,44.0 L 39.0,48.0 L 23.0,78.0 L 23.0,90.0 L 24.0,91.0 L 25.0,103.0 L 29.0,117.0 L 36.0,131.0 L 54.0,159.0 L 65.0,179.0 L 67.0,186.0 L 69.0,189.0 L 69.0,192.0 L 72.0,198.0 L 73.0,204.0 L 75.0,206.0 L 76.0,205.0 L 76.0,189.0 L 77.0,188.0 L 77.0,151.0 L 76.0,150.0 L 75.0,137.0 L 74.0,136.0 L 72.0,125.0 L 64.0,103.0 L 49.0,73.0 L 47.0,64.0 L 45.0,60.0 L 44.0,48.0 L 43.0,46.0 Z M 22.0,86.0 L 21.0,85.0 L 20.0,86.0 L 17.0,93.0 L 13.0,105.0 L 11.0,118.0 L 10.0,119.0 L 10.0,124.0 L 9.0,125.0 L 8.0,141.0 L 7.0,142.0 L 7.0,153.0 L 10.0,163.0 L 24.0,189.0 L 53.0,224.0 L 59.0,233.0 L 64.0,242.0 L 68.0,254.0 L 69.0,255.0 L 70.0,254.0 L 71.0,242.0 L 72.0,241.0 L 72.0,233.0 L 73.0,232.0 L 72.0,219.0 L 71.0,218.0 L 70.0,209.0 L 65.0,192.0 L 57.0,176.0 L 57.0,174.0 L 53.0,168.0 L 53.0,166.0 L 41.0,147.0 L 30.0,126.0 L 28.0,119.0 L 26.0,116.0 L 23.0,106.0 L 23.0,101.0 L 22.0,100.0 L 22.0,87.0 Z M 121.0,88.0 L 120.0,87.0 L 119.0,88.0 L 118.0,117.0 L 117.0,118.0 L 117.0,123.0 L 115.0,128.0 L 115.0,131.0 L 108.0,150.0 L 99.0,167.0 L 99.0,169.0 L 91.0,184.0 L 91.0,186.0 L 88.0,192.0 L 88.0,195.0 L 85.0,202.0 L 83.0,214.0 L 82.0,215.0 L 82.0,226.0 L 81.0,227.0 L 81.0,237.0 L 80.0,238.0 L 81.0,241.0 L 83.0,239.0 L 90.0,228.0 L 109.0,206.0 L 123.0,185.0 L 131.0,167.0 L 131.0,164.0 L 132.0,163.0 L 132.0,134.0 L 131.0,133.0 L 131.0,126.0 L 130.0,125.0 L 130.0,119.0 L 128.0,114.0 L 127.0,106.0 L 121.0,89.0 Z M 157.0,132.0 L 156.0,131.0 L 154.0,133.0 L 139.0,154.0 L 139.0,166.0 L 138.0,167.0 L 138.0,173.0 L 137.0,174.0 L 137.0,179.0 L 134.0,189.0 L 133.0,197.0 L 127.0,215.0 L 120.0,228.0 L 121.0,234.0 L 124.0,240.0 L 148.0,270.0 L 152.0,276.0 L 155.0,282.0 L 155.0,284.0 L 156.0,285.0 L 157.0,284.0 L 157.0,281.0 L 158.0,280.0 L 158.0,270.0 L 159.0,269.0 L 158.0,268.0 L 158.0,261.0 L 156.0,256.0 L 156.0,253.0 L 147.0,232.0 L 135.0,212.0 L 136.0,209.0 L 143.0,222.0 L 149.0,230.0 L 156.0,244.0 L 159.0,254.0 L 160.0,255.0 L 161.0,254.0 L 161.0,235.0 L 162.0,234.0 L 161.0,215.0 L 155.0,195.0 L 146.0,176.0 L 146.0,174.0 L 147.0,174.0 L 156.0,192.0 L 159.0,202.0 L 161.0,205.0 L 162.0,204.0 L 160.0,159.0 L 159.0,158.0 L 159.0,148.0 L 158.0,147.0 L 157.0,133.0 Z M 159.0,132.0 L 158.0,131.0 L 157.0,134.0 L 158.0,135.0 L 158.0,141.0 L 159.0,142.0 L 162.0,172.0 L 163.0,173.0 L 164.0,197.0 L 165.0,198.0 L 165.0,218.0 L 166.0,219.0 L 166.0,237.0 L 165.0,238.0 L 165.0,244.0 L 166.0,245.0 L 168.0,243.0 L 184.0,209.0 L 184.0,206.0 L 186.0,202.0 L 187.0,194.0 L 188.0,193.0 L 188.0,177.0 L 173.0,150.0 L 160.0,133.0 Z M 10.0,165.0 L 9.0,164.0 L 8.0,165.0 L 8.0,168.0 L 9.0,169.0 L 9.0,174.0 L 10.0,175.0 L 10.0,180.0 L 11.0,181.0 L 11.0,186.0 L 13.0,191.0 L 14.0,199.0 L 23.0,224.0 L 32.0,242.0 L 46.0,264.0 L 65.0,287.0 L 67.0,284.0 L 67.0,278.0 L 68.0,277.0 L 67.0,265.0 L 65.0,260.0 L 65.0,257.0 L 56.0,237.0 L 45.0,220.0 L 30.0,202.0 L 17.0,183.0 L 12.0,173.0 L 10.0,166.0 Z M 130.0,176.0 L 129.0,175.0 L 128.0,176.0 L 126.0,183.0 L 121.0,193.0 L 112.0,207.0 L 88.0,238.0 L 79.0,257.0 L 78.0,274.0 L 77.0,275.0 L 77.0,281.0 L 78.0,282.0 L 82.0,278.0 L 98.0,257.0 L 108.0,241.0 L 121.0,213.0 L 122.0,207.0 L 127.0,193.0 L 130.0,177.0 Z M 191.0,185.0 L 190.0,184.0 L 189.0,185.0 L 189.0,195.0 L 188.0,196.0 L 188.0,201.0 L 186.0,206.0 L 186.0,209.0 L 183.0,218.0 L 180.0,223.0 L 180.0,225.0 L 167.0,252.0 L 165.0,259.0 L 165.0,268.0 L 164.0,269.0 L 164.0,276.0 L 165.0,277.0 L 167.0,275.0 L 170.0,270.0 L 187.0,250.0 L 191.0,244.0 L 197.0,231.0 L 197.0,212.0 L 196.0,211.0 L 196.0,205.0 L 194.0,199.0 L 194.0,195.0 L 191.0,186.0 Z M 121.0,236.0 L 120.0,235.0 L 119.0,236.0 L 119.0,242.0 L 126.0,265.0 L 135.0,283.0 L 141.0,292.0 L 146.0,297.0 L 150.0,303.0 L 154.0,307.0 L 155.0,306.0 L 155.0,293.0 L 151.0,281.0 L 146.0,272.0 L 127.0,248.0 L 121.0,237.0 Z M 195.0,242.0 L 194.0,241.0 L 193.0,242.0 L 188.0,252.0 L 168.0,278.0 L 164.0,286.0 L 163.0,294.0 L 162.0,295.0 L 162.0,303.0 L 163.0,304.0 L 171.0,295.0 L 180.0,282.0 L 191.0,258.0 L 195.0,243.0 Z"
                />
              </svg>
            )}
            <span className="text-xl font-serif font-normal tracking-tight lg:text-2xl">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 items-center gap-6 lg:flex">
            {safeNavItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                aria-current={pathname === item.url ? 'page' : undefined}
                className={`whitespace-nowrap py-1 text-sm transition-colors duration-200 border-b focus-visible:outline-none ${
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
          <div className="hidden shrink-0 items-center lg:flex">
            <Link
              href={ctaUrl}
              className="whitespace-nowrap rounded-sm bg-action hover:bg-action-fonce px-4 py-2 text-sm font-medium text-[#F7F3EC] transition-colors duration-200"
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
              {safeNavItems.map((item) => (
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
                  {item.label}
                </Link>
              ))}

              {/* Séparateur */}
              <div className="my-3 border-t border-[#DED5C6]" />

              {/* CTA principal */}
              <Link
                href={ctaUrl}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-sm bg-action px-4 py-3.5 text-sm font-medium text-[#FAF7F2] transition-colors duration-200 hover:bg-action-fonce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
              >
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
