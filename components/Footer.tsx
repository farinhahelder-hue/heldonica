import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Heldonica</h3>
            <p className="text-white/70 text-sm">L'expert de l'aventure en couple</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Travel</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/travel-planning" className="hover:text-white transition">Travel Planning</Link></li>
              <li><Link href="/destinations/suisse" className="hover:text-white transition">Destinations</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Consulting</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/hotel-consulting" className="hover:text-white transition">Nos Services</Link></li>
              <li><a href="#" className="hover:text-white transition">Cas d'études</a></li>
              <li><a href="#" className="hover:text-white transition">Tarifs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="mailto:hello@heldonica.fr" className="hover:text-white transition">hello@heldonica.fr</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
          <p>&copy; 2026 Heldonica. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Mentions légales</a>
            <a href="#" className="hover:text-white transition">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
