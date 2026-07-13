'use client'

import { Download } from 'lucide-react'

interface LeadMagnetBlockProps {
  destinationSlug: string
  destinationName: string
}

export default function LeadMagnetBlock({
  destinationSlug,
  destinationName,
}: LeadMagnetBlockProps) {
  return (
    <section className="bg-white py-16 md:py-20 border-y border-stone-100">
      <div className="container max-w-3xl">
        <div className="bg-gradient-to-br from-eucalyptus/5 via-white to-amber-50/30 rounded-2xl p-8 md:p-10 border border-eucalyptus/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-3">
              Télécharge le guide pratique pour garder l&apos;essentiel sous la main
            </h2>
            <p className="text-charcoal/70 leading-relaxed">
              On t&apos;a préparé une version claire et utile à consulter avant de partir.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block">💰</span>
              <p className="text-sm font-semibold text-charcoal">Budget réaliste</p>
              <p className="text-xs text-charcoal/60 mt-1">Les vrais prix qu&apos;on a payés</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block">📍</span>
              <p className="text-sm font-semibold text-charcoal">Nos adresses testées</p>
              <p className="text-xs text-charcoal/60 mt-1">Chaque lieu qu&apos;on recommande, on y est allés</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block">🗺️</span>
              <p className="text-sm font-semibold text-charcoal">Itinéraire clé en main</p>
              <p className="text-xs text-charcoal/60 mt-1">Jour par jour, avec nos tips terrain</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href={`/api/guides/download?destination=${destinationSlug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-all shadow-lg shadow-eucalyptus/20"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'guidepdftelecharge', {
                    destination: destinationSlug,
                    guide_name: `guide-${destinationName.toLowerCase()}`,
                  })
                }
              }}
            >
              <Download size={18} />
              Je veux le guide
            </a>
            <p className="text-xs text-charcoal/50 mt-4">
              Gratuit · Tu restes inscrit·e à la newsletter · Désinscription à tout moment
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
