'use client'

import { CheckCircle2 } from 'lucide-react'
import { useContentLoader } from '@/hooks/useContentLoader'

interface QuickAnswersBlockProps {
  destinationName: string
  budget: number
  bestSeason: string
  flightTime: string
  language: string
  currency: string
  visa: string
}

const TEMPLATES_DEFAULT = {
  heading: 'Réponses rapides pour voyager à {name}',
  questions: [
    'Quel budget pour {name} en couple ?',
    'Quand partir à {name} ?',
    "Combien d'heures de vol pour {name} ?",
    'Faut-il un visa pour {name} ?',
  ],
  answers: [
    'Environ {budget}€ par semaine pour deux, hors transport.',
    '{bestSeason}',
    '{flightTime}',
    '{visa}',
  ],
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
  const { settings } = useContentLoader()

  let templates = TEMPLATES_DEFAULT
  try {
    const raw = settings?.quickanswers_templates
    if (raw) templates = { ...TEMPLATES_DEFAULT, ...JSON.parse(raw) }
  } catch {}

  const token = (s: string) =>
    s
      .replace(/\{name\}/g, destinationName)
      .replace(/\{budget\}/g, String(budget))
      .replace(/\{bestSeason\}/g, bestSeason)
      .replace(/\{flightTime\}/g, flightTime)
      .replace(/\{language\}/g, language)
      .replace(/\{currency\}/g, currency)
      .replace(/\{visa\}/g, visa)

  const answers = templates.questions.map((q, i) => ({
    q: token(q),
    a: token(templates.answers[i] || ''),
  }))

  return (
    <section className="bg-gradient-to-b from-cloud-dancer to-white py-12 border-b border-stone-100">
      <div className="container max-w-4xl">
        <h2 className="text-lg font-semibold text-charcoal/60 mb-6 text-center">
          {token(templates.heading)}
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
