'use client'

import { CheckCircle2 } from 'lucide-react'

interface QuickAnswersBlockProps {
  destinationName: string
  budget: number
  bestSeason: string
  flightTime: string
  language: string
  currency: string
  visa: string
}

export default function QuickAnswersBlock({
  destinationName,
  budget,
  bestSeason,
  flightTime,
  language,
  currency,
  visa,
}: QuickAnswersBlockProps) {
  const answers = [
    { q: `Quel budget pour ${destinationName} en couple ?`, a: `Environ ${budget}€ par semaine pour deux, hors transport.` },
    { q: `Quand partir à ${destinationName} ?`, a: bestSeason },
    { q: `Combien d'heures de vol pour ${destinationName} ?`, a: flightTime },
    { q: `Faut-il un visa pour ${destinationName} ?`, a: visa },
  ]

  return (
    <section className="bg-gradient-to-b from-cloud-dancer to-white py-12 border-b border-stone-100">
      <div className="container max-w-4xl">
        <h2 className="text-lg font-semibold text-charcoal/60 mb-6 text-center">
          Réponses rapides pour voyager à {destinationName}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {answers.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
              <CheckCircle2 size={20} className="text-eucalyptus flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-mahogany text-sm">{item.q}</p>
                <p className="text-charcoal/70 text-sm mt-1">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
