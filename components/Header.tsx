'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-eucalyptus rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-serif font-bold text-mahogany text-lg">Heldonica</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-charcoal hover:text-eucalyptus transition">Accueil</Link>
          <Link href="/travel-planning" className="text-charcoal hover:text-eucalyptus transition">Travel Planning</Link>
          <Link href="/hotel-consulting" className="text-charcoal hover:text-eucalyptus transition">Consulting</Link>
          <Link href="/blog" className="text-charcoal hover:text-eucalyptus transition">Blog</Link>
          <button className="px-6 py-2 bg-eucalyptus text-white rounded-lg hover:bg-teal transition">
            Contact
          </button>
        </nav>

        <button 
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container space-y-3">
            <Link href="/" className="block text-charcoal hover:text-eucalyptus transition">Accueil</Link>
            <Link href="/travel-planning" className="block text-charcoal hover:text-eucalyptus transition">Travel Planning</Link>
            <Link href="/hotel-consulting" className="block text-charcoal hover:text-eucalyptus transition">Consulting</Link>
            <Link href="/blog" className="block text-charcoal hover:text-eucalyptus transition">Blog</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
