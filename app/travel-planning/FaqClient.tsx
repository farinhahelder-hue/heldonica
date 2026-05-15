'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Combien coûte la conception sur mesure ?',
    a: 'Chaque projet est unique. On commence par un échange gratuit pour comprendre tes envies. Le tarif est établi selon la complexité de l\'itinéraire, la durée et le niveau de personnalisation souhaité. Compte en moyenne entre 150€ et 350€ pour un voyage de 7 à 14 jours.'
  },
  {
    q: 'Dans combien de temps reçois-tu ton carnet de route ?',
    a: 'En général sous 7 à 10 jours après ta validation du brief. Pour les projets urgents (départ dans moins de 3 semaines), contacte-nous directement — on fait de notre mieux.'
  },
  {
    q: 'Et si la destination, tu ne l\'as jamais faite ?',
    a: 'Oui. On travaille avec un réseau de contacts locaux et on fait des recherches approfondies pour chaque nouvelle destination. La différence : on ne te conseille que ce qu\'on est prêts à recommander à nos proches.'
  },
  {
    q: 'Tu veux qu\'on fasse les réservations à ta place ?',
    a: 'On peut te fournir les liens, contacts et conseils pour chaque réservation. Pour un accompagnement complet (réservations incluses), c\'est possible sur devis — précise-le lors de ta demande.'
  },
  {
    q: 'Qu\'est-ce que tu reçois exactement comme livrable ?',
    a: 'Un carnet de voyage PDF complet : programme jour par jour, carte interactive, hébergements sélectionnés, restaurants, transports, conseils pratiques et contacts locaux. Tout réuni en un seul document pensé pour toi.'
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-stone-900 text-sm hover:bg-stone-50 transition"
          >
            <span>{item.q}</span>
            <svg className={`w-4 h-4 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
              <p className="pt-4">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
