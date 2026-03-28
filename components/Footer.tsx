'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cloud-dancer">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-white font-serif text-2xl font-bold mb-2">Heldonica</h3>
              <p className="text-sm text-cloud-dancer">Curated Escapes</p>
            </div>
            <p className="text-sm text-cloud-dancer leading-relaxed">
              Expert en slow travel et consulting hôtelier. Découvrez des voyages authentiques et des itinéraires hors sentiers.
            </p>
            {/* Instagram Link */}
            <div className="mt-6">
              <a
                href="https://www.instagram.com/heldonica/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cloud-dancer hover:text-white transition"
                title="Suivez-nous sur Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
                <span className="text-sm font-medium">@heldonica</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-serif font-bold mb-6 text-lg">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-cloud-dancer hover:text-white transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-cloud-dancer hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-cloud-dancer hover:text-white transition">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/travel-planning-form" className="text-cloud-dancer hover:text-white transition">
                  Planifier un voyage
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-serif font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/travel-planning" className="text-cloud-dancer hover:text-white transition">
                  Slow Travel
                </Link>
              </li>
              <li>
                <Link href="/hotel-consulting" className="text-cloud-dancer hover:text-white transition">
                  Consulting Hôtelier
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-cloud-dancer hover:text-white transition">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-white font-serif font-bold mb-6 text-lg">Légal & Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-cloud-dancer hover:text-white transition">
                  Mentions légales
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@heldonica.fr"
                  className="text-cloud-dancer hover:text-white transition"
                >
                  info@heldonica.fr
                </a>
              </li>
              <li className="text-cloud-dancer">
                France
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          {/* Copyright & Credits */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-cloud-dancer">
            <p>© {currentYear} Heldonica - Curated Escapes. Tous droits réservés.</p>
            <p className="text-xs">
              Photos © Heldonica. Tous droits d'auteur réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
