'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-white font-serif text-xl mb-4">Heldonica</h3>
            <p className="text-sm">Expert en slow travel et consulting hôtelier</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition">Destinations</Link></li>
              <li><Link href="/travel-planning-form" className="hover:text-white transition">Travel Planning</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/travel-planning" className="hover:text-white transition">Slow Travel</Link></li>
              <li><Link href="/hotel-consulting" className="hover:text-white transition">Consulting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-sm mb-2">hello@heldonica.fr</p>
            <p className="text-sm">+33 (0)6 XX XX XX XX</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2024 Heldonica. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
