'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const accountHref = !loading && user ? '/dashboard' : '/auth/login'
  const accountLabel = !loading && user ? 'Mon espace' : 'Connexion'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/blog', label: 'Inspirations' },
    { href: '/travel-planning', label: 'Services' },
    { href: '/a-propos', label: 'À propos' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? 'border-stone-200 bg-white shadow-md'
            : 'border-stone-100 bg-white/95 backdrop-blur-sm'
        }`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-amber-900 transition-colors duration-200 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
            aria-label="Heldonica accueil"
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1.2" />
              <line x1="10" y1="9" x2="10" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="24" y1="9" x2="24" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="15.5" x2="24" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 26 Q11 24 14 26 Q17 28 20 26 Q23 24 26 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
            </svg>
            <span className="text-xl font-serif font-bold tracking-tight">Heldonica</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
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
              href="/travel-planning-form"
              className={`ml-3 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2 ${
                scrolled
                  ? 'bg-eucalyptus scale-105 shadow-eucalyptus/30 shadow-md hover:bg-eucalyptus/90'
                  : 'bg-amber-900 hover:bg-amber-800'
              }`}
            >
              {scrolled ? 'Co-créer mon voyage →' : 'Planifier mon voyage'}
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              href="/travel-planning-form"
              className={`rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 ${
                scrolled ? 'bg-eucalyptus' : 'bg-amber-900'
              }`}
            >
              Planifier
            </Link>
            <button
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
            >
              {open ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-700" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-700" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          id="mobile-menu"
          className={`overflow-hidden border-t border-stone-100 bg-white shadow-xl transition-all duration-300 ease-in-out lg:hidden ${
            open ? 'max-h-[50rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-6">
            <div className="mb-3 px-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Navigation</p>
            </div>
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-4 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-inset ${
                  pathname === item.href
                    ? 'bg-amber-50 text-amber-900'
                    : 'text-stone-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {index === 0 && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
                    {index === 1 && <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
                    {index === 2 && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
                    {index === 3 && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
                    {index === 4 && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                  </svg>
                </span>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-stone-100 pt-4">
              <Link
                href="/travel-planning-form"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-eucalyptus px-4 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-eucalyptus/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                Co-créer mon voyage
              </Link>
            </div>
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-4 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-inset"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-eucalyptus/30 bg-eucalyptus/10 text-eucalyptus" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5" />
                </svg>
              </span>
              {accountLabel}
            </Link>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
