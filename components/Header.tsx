'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-amber-900 hover:text-amber-700 transition-colors" aria-label="Heldonica accueil">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="10" y1="9" x2="10" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="24" y1="9" x2="24" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="15.5" x2="24" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 26 Q11 24 14 26 Q17 28 20 26 Q23 24 26 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
            </svg>
            <span className="text-xl font-serif font-bold tracking-tight">Heldonica</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/a-propos" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">À propos</Link>
            <Link href="/blog" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">Blog</Link>
            <Link href="/destinations" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">Destinations</Link>
            <Link href="/contact" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">Contact</Link>
            <Link href="/travel-planning-form" className="px-5 py-2 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors text-sm font-medium shadow-sm">
              Planifier
            </Link>
          </div>

          {/* Mobile: Planifier CTA + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/travel-planning-form" className="px-4 py-2 bg-amber-900 text-white rounded-full text-xs font-semibold shadow-sm">
              Planifier
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
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

        {/* Mobile menu dropdown */}
        <div
          className={`md:hidden bg-white border-t border-stone-100 overflow-hidden transition-all duration-300 ease-in-out shadow-xl ${
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-6 flex flex-col gap-1">
            <div className="mb-3 px-2">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Navigation</p>
            </div>

            <Link href="/a-propos" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium">
              <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              À propos
            </Link>

            <Link href="/blog" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium">
              <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </span>
              Blog
            </Link>

            <Link href="/destinations" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium">
              <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              Destinations
            </Link>

            <Link href="/hotel-consulting" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium">
              <span className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                </svg>
              </span>
              Consulting hôtelier
            </Link>

            <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium">
              <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z"/>
                  <path d="m22 6-10 7L2 6"/>
                </svg>
              </span>
              Contact
            </Link>

            <div className="pt-4 border-t border-stone-100 mt-2">
              <Link href="/travel-planning-form" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2.5 w-full px-4 py-4 bg-amber-900 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold text-base">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                Planifier mon voyage
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/10 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
