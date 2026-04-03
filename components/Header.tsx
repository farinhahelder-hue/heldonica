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
          <Link href="/" className="flex items-center gap-2 text-amber-900 hover:text-amber-700 transition-colors" aria-label="Heldonica accueil">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 16 C8 10 12 7 16 7 C20 7 24 10 24 16 C24 22 20 25 16 25 C12 25 8 22 8 16Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M11 12 Q16 9 21 12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M11 20 Q16 23 21 20" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <line x1="16" y1="7" x2="16" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
            <span className="text-xl font-serif font-bold tracking-tight">Heldonica</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/a-propos" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">À propos</Link>
            <Link href="/blog" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">Blog</Link>
            <Link href="/destinations" className="text-stone-600 hover:text-amber-900 transition-colors font-medium text-sm">Destinations</Link>
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
          <div className="px-4 py-6 flex flex-col gap-2">
            <div className="mb-2 px-2">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Navigation</p>
            </div>
            <Link
              href="/a-propos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">ℹ️</span>
              À propos
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">✈️</span>
              Blog
            </Link>
            <Link
              href="/destinations"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">🗺️</span>
              Destinations
            </Link>
            <Link
              href="/hotel-consulting"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm">🏨</span>
              Consulting hôtelier
            </Link>
            <div className="pt-4 border-t border-stone-100 mt-2">
              <Link
                href="/travel-planning-form"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-amber-900 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold text-base"
              >
                <span>✨</span>
                Planifier mon voyage
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay pour fermer le menu en cliquant à côté */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
