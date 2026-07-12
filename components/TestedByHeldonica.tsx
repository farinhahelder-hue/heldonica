'use client'

import { Heart, MapPin, Calendar, Users } from 'lucide-react'

interface TestedByHeldonicaProps {
  when: string
  duration: string
  withWho: string
  highlights: string[]
  keyInsight: string
  destinationName: string
}

export default function TestedByHeldonica({
  when,
  duration,
  withWho,
  highlights,
  keyInsight,
  destinationName,
}: TestedByHeldonicaProps) {
  return (
    <section className="bg-white py-16 md:py-20 border-y border-stone-100">
      <div className="container max-w-3xl">
        {/* Badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus text-xs font-semibold">
            <Heart size={14} className="fill-current" />
            Testé par Heldonica
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
        </div>

        {/* Contenu */}
        <div className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-2xl p-8 border border-stone-100">
          {/* Métadonnées */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-charcoal/60">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-eucalyptus" />
              <span>{when}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-eucalyptus">⏱</span>
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-eucalyptus" />
              <span>{withWho}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-charcoal/50 uppercase tracking-wider mb-4 text-center">
              Ce qu&apos;on a préféré à {destinationName}
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-stone-100">
                  <span className="text-eucalyptus mt-0.5">✨</span>
                  <p className="text-sm text-charcoal/80">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insight clé */}
          <div className="bg-eucalyptus/5 rounded-xl p-6 border border-eucalyptus/10">
            <p className="text-sm font-semibold text-eucalyptus mb-2 flex items-center gap-2">
              <MapPin size={16} className="fill-current" />
              Ce qu&apos;on a appris sur le terrain
            </p>
            <p className="text-charcoal/80 italic leading-relaxed">
              &ldquo;{keyInsight}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
