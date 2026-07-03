'use client'

import { useContentLoader } from '@/hooks/useContentLoader'

interface Pillar {
  title: string
  description: string
  icon: string
}

// Fallback pillars for resilience
const FALLBACK_PILLARS: Pillar[] = [
  {
    title: "L'émerveillement",
    description: "Il se cache dans un marché de quartier, une ruelle oubliée, ou un café perdu en Provence. Partout où vous posez les yeux, il y a quelque chose à découvrir.",
    icon: "✨"
  },
  {
    title: "Notre philosophie",
    description: "Nous ne voyageons pas pour cocher des cases. Nous voyageons pour ralentir et nous reconnecter. Bien vivre son temps, c'est voir chaque moment comme une micro-aventure.",
    icon: "🧭"
  },
  {
    title: "Notre promesse",
    description: "Que vous partiez trois semaines en Islande ou flâniez en bas de chez vous, Heldonica vous accompagne pour planifier vos voyages avec âme.",
    icon: "💚"
  }
]

export default function Pillars() {
  const { zones } = useContentLoader()

  // Build pillars from CMS zones
  const pillars: Pillar[] = [1, 2, 3].map((i) => ({
    title: zones?.[`pillar_${i}_title`]?.value || FALLBACK_PILLARS[i - 1]?.title || '',
    description: zones?.[`pillar_${i}_desc`]?.value || FALLBACK_PILLARS[i - 1]?.description || '',
    icon: zones?.[`pillar_${i}_icon`]?.value || FALLBACK_PILLARS[i - 1]?.icon || '✨'
  }))

  return (
    <section id="pillars" className="bg-white section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          Nos Piliers
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
          Ce qui nous guide dans chaque aventure
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <div key={i} className="p-8 bg-gradient-to-br from-cloud-dancer to-white rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">{pillar.icon}</div>
              <h3 className="text-2xl font-serif font-bold text-mahogany mb-4">{pillar.title}</h3>
              <p className="text-charcoal text-lg leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
