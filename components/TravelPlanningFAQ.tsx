'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Combien coûte la conception sur mesure ?',
    a: "Chaque projet est différent. On commence par un échange gratuit pour comprendre ce que tu veux vraiment faire, puis on chiffre selon la durée, la complexité et le niveau d'accompagnement.",
  },
  {
    q: 'Dans combien de temps reçoit-on le carnet ?',
    a: 'En général sous 7 à 10 jours après validation du brief. Si le départ est proche, dis-le-nous tout de suite et on te dira franchement ce qui est tenable.',
  },
  {
    q: 'Travaillez-vous seulement sur des destinations déjà vécues ?',
    a: "Notre préférence va au terrain qu'on connaît déjà, parce que c'est là qu'on est les plus justes. Quand on ouvre un nouveau terrain, on le dit clairement et on garde le même niveau d'exigence.",
  },
  {
    q: 'Faites-vous les réservations à notre place ?',
    a: 'On peut fournir les liens, les contacts et le bon ordre. Si tu veux un accompagnement plus complet, on le cadre ensemble au moment du brief.',
  },
  {
    q: 'Qu\'est-ce qu\'on reçoit exactement ?',
    a: 'Un carnet clair et concret : rythme jour par jour, adresses choisies, hébergements, transports, conseils pratiques et ce qu\'il faut éviter pour ne pas casser le voyage.',
  },
]

export default function TravelPlanningFAQ() {
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
            <svg
              className={`w-4 h-4 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
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
