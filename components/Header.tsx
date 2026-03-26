'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-amber-900">
          Heldonica
        </Link>
        <div className="flex gap-8 items-center">
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
      </div>
    </nav>
  );
}
