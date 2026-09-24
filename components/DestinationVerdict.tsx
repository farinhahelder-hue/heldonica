'use client'

import { ThumbsUp, AlertCircle, Star } from 'lucide-react'
import { useContentLoader } from '@/hooks/useContentLoader'

interface DestinationVerdictProps {
  score: number
  forWho: string
  strengths: string[]
  considerations: string[]
  finalWord: string
  destinationName: string
}

const LABELS_DEFAULT = {
  badge: 'Notre verdict',
  headingTemplate: '{name}, on te le recommande si...',
  subtext: 'Et on te le dit aussi si ce n\'est pas pour toi.',
  scoreLabel: 'Notre note slow travel',
  forWhoLabel: 'Pour qui ?',
  strengthsLabel: 'Ce qu\'on a adoré',
  considerationsLabel: 'Ce qu\'il faut savoir',
}

export default function DestinationVerdict({
  score,
  forWho,
  strengths,
  considerations,
  finalWord,
  destinationName,
}: DestinationVerdictProps) {
  const { settings } = useContentLoader()
  let labels = LABELS_DEFAULT
  try {
    const raw = settings?.verdict_labels
    if (raw) labels = { ...LABELS_DEFAULT, ...JSON.parse(raw) }
  } catch {}
  const t = (s: string) => s.replace(/\{name\}/g, destinationName)
  return (
    <section className="bg-gradient-to-b from-white to-cloud-dancer py-16 md:py-20">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
            <Star size={14} className="fill-current" />
            {labels.badge}
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-2">
            {t(labels.headingTemplate)}
          </h2>
          <p className="text-charcoal/60 text-sm">{labels.subtext}</p>
        </div>

        {/* Score et pour qui */}
        <div className="bg-gradient-to-br from-mahogany to-mahogany/90 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <span className="text-4xl font-bold">{score}/10</span>
              </div>
              <p className="text-sm text-white/60">{labels.scoreLabel}</p>
            </div>

            {/* Pour qui */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold text-amber-300 mb-2">{labels.forWhoLabel}</p>
              <p className="text-white/90 leading-relaxed">{forWho}</p>
            </div>
          </div>
        </div>

        {/* Points forts et considérations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Points forts */}
          <div className="bg-eucalyptus/5 rounded-xl p-6 border border-eucalyptus/10">
            <h3 className="font-semibold text-eucalyptus mb-4 flex items-center gap-2">
              <ThumbsUp size={18} className="fill-current" />
              {labels.strengthsLabel}
            </h3>
            <ul className="space-y-3">
              {strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-charcoal/80">
                  <span className="text-eucalyptus mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Considérations */}
          <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
            <h3 className="font-semibold text-amber-600 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="fill-current" />
              {labels.considerationsLabel}
            </h3>
            <ul className="space-y-3">
              {considerations.map((consideration, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-charcoal/80">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mot de la fin */}
        <div className="bg-white rounded-xl p-6 border border-stone-100 text-center">
          <p className="text-charcoal/70 italic leading-relaxed">
            &ldquo;{finalWord}&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
