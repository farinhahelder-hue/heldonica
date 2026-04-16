'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-950 text-stone-200">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <h3 className="mb-2 text-2xl font-serif font-bold text-white">Heldonica</h3>
              <p className="text-sm text-amber-200">Slow travel vécu, conçu juste.</p>
            </div>
            <p className="text-sm leading-relaxed text-stone-300">
              On voyage lentement, on teste vraiment, on partage ce qui tient sur le terrain.
              Dénicheurs de pépites, même en bas de chez toi.
            </p>
            <div className="mt-6">
              <a
                href="https://www.instagram.com/heldonica/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-stone-300 transition-colors duration-200 hover:text-white"
                title="Suivez-nous sur Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
                <span className="text-sm font-medium">@heldonica</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-serif font-bold text-white">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/planifier" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Planifier
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-serif font-bold text-white">Services</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/travel-planning" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Travel planning
                </Link>
              </li>
              <li>
                <Link href="/slow-travel" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Slow travel
                </Link>
              </li>
              <li>
                <Link href="/hotel-consulting" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Consulting hôtelier
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Nous écrire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-serif font-bold text-white">Légal & contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <a href="mailto:info@heldonica.fr" className="text-stone-300 transition-colors duration-200 hover:text-white">
                  info@heldonica.fr
                </a>
              </li>
              <li className="text-stone-400">France</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-stone-400 md:flex-row">
            <p>© {currentYear} Heldonica. Tous droits réservés.</p>
            <p className="text-xs">Photos © Heldonica. Tous droits d&apos;auteur réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
