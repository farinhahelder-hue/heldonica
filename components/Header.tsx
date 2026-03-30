'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-serif font-bold text-amber-900">
          Heldonica
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/blog" className="text-gray-700 hover:text-amber-900 transition font-medium">
            Blog
          </Link>
          <Link href="/destinations" className="text-gray-700 hover:text-amber-900 transition font-medium">
            Destinations
          </Link>
          <Link href="/travel-planning-form" className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition">
            Planifier
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/blog" 
              className="block text-gray-700 hover:text-amber-900 transition font-medium py-2"
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link 
              href="/destinations" 
              className="block text-gray-700 hover:text-amber-900 transition font-medium py-2"
              onClick={closeMenu}
            >
              Destinations
            </Link>
            <Link 
              href="/travel-planning-form" 
              className="block w-full px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition text-center font-medium"
              onClick={closeMenu}
            >
              Planifier
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
