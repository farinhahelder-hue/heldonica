'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()

  const accountHref = !loading && user ? '/dashboard' : '/auth/login'
  const accountLabel = !loading && user ? 'Mon espace' : 'Connexion'

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-stone-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-amber-900 transition-colors duration-200 hover:text-amber-700"
            aria-label="Heldonica accueil"
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1.2" />
              <line x1="10" y1="9" x2="10" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="24" y1="9" x2="24" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line
                x1="10"
                y1="15.5"
                x2="24"
                y2="15.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M8 26 Q11 24 14 26 Q17 28 20 26 Q23 24 26 26"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </svg>
            <span className="text-xl font-serif font-bold tracking-tight">Heldonica</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/a-propos" className="text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-amber-900">
              À propos
            </Link>
            <Link href="/blog" className="text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-amber-900">
              Blog
            </Link>
            <Link href="/destinations" className="text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-amber-900">
              Destinations
            </Link>
            <Link href="/contact" className="text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-amber-900">
              Contact
            </Link>
            <Link href={accountHref} className="text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-amber-900">
              {accountLabel}
            </Link>
            <Link
              href="/planifier"
              className="rounded-full bg-amber-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-amber-800"
            >
              Planifier
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link href="/planifier" className="rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold text-white shadow-sm">
              Planifier
            </Link>
            <button
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-stone-100"
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-700">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-700">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-stone-100 bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden ${
            open ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-6">
            <div className="mb-3 px-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Navigation</p>
            </div>

            <Link
              href="/a-propos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              À propos
            </Link>

            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </span>
              Blog
            </Link>

            <Link
              href="/destinations"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              Destinations
            </Link>

            <Link
              href="/hotel-consulting"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                  <path d="M10 6h4" />
                  <path d="M10 10h4" />
                  <path d="M10 14h4" />
                  <path d="M10 18h4" />
                </svg>
              </span>
              Consulting hôtelier
            </Link>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </span>
              Contact
            </Link>

            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-stone-700 transition-colors duration-200 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-eucalyptus/30 bg-eucalyptus/10 text-eucalyptus">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5" />
                </svg>
              </span>
              {accountLabel}
            </Link>

            <div className="mt-2 border-t border-stone-100 pt-4">
              <Link
                href="/planifier"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-900 px-4 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-amber-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                Planifier mon voyage
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
