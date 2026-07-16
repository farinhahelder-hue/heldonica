'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const QUESTIONS = [
  {
    id: 1,
    question: 'Comment tu choisis ta destination ?',
    options: [
      { value: 'aventure', label: 'Tu cherches l\'aventure, les émotions fortes et la nature sauvage', emoji: '🏔️' },
      { value: 'culture', label: 'Histoire, art, architecture et rencontres locales', emoji: '🏛️' },
      { value: 'nature', label: 'Calme, paysages, déconnexion totale', emoji: '🌿' },
      { value: 'bien-etre', label: 'Tu veux te faire dorloter, spa, yoga, douceur', emoji: '🧘' },
    ],
  },
  {
    id: 2,
    question: 'Ton rythme idéal en voyage ?',
    options: [
      { value: 'aventure', label: 'Tu te lèves à l\'aube pour maximiser chaque journée', emoji: '⏰' },
      { value: 'culture', label: '2-3 activités par jour, avec du temps pour flâner', emoji: '🚶' },
      { value: 'nature', label: 'Lent, contemplatif, un seul lieu par jour', emoji: '🐢' },
      { value: 'bien-etre', label: 'Au rythme du soleil et de mes envies', emoji: '☀️' },
    ],
  },
  {
    id: 3,
    question: 'Ton approche de l\'hébergement ?',
    options: [
      { value: 'aventure', label: 'Pragmatique : dortoirs, guesthouse, chez l\'habitant', emoji: '🏕️' },
      { value: 'culture', label: 'Hôtel de caractère avec histoire, quartier authentique', emoji: '🏰' },
      { value: 'nature', label: 'Éco-lodge, cabane, yourte ou maison isolée', emoji: '🏡' },
      { value: 'bien-etre', label: 'Spa, piscine, vue panoramique, confort total', emoji: '🛁' },
    ],
  },
  {
    id: 4,
    question: 'Qu\'est-ce qui te fait vibrer en voyage ?',
    options: [
      { value: 'aventure', label: 'Le sommet atteint, le trek réussi, l\'adrénaline', emoji: '🎯' },
      { value: 'culture', label: 'Le marché local, le petit resto caché, la discussion avec un artisan', emoji: '💬' },
      { value: 'nature', label: 'Le silence d\'une forêt, le bruit des vagues, une aurore boréale', emoji: '✨' },
      { value: 'bien-etre', label: 'Un massage, un coucher de soleil parfait, le repos profond', emoji: '🌅' },
    ],
  },
  {
    id: 5,
    question: 'Ta philosophie de voyage en une phrase ?',
    options: [
      { value: 'aventure', label: '"Vivre des histoires à raconter toute ma vie"', emoji: '📖' },
      { value: 'culture', label: '"Comprendre le monde à travers ceux qui y vivent"', emoji: '🌍' },
      { value: 'nature', label: '"Retourner à l\'essentiel, loin du bruit du monde"', emoji: '🍃' },
      { value: 'bien-etre', label: '"Prendre soin de soi, c\'est aussi voyager autrement"', emoji: '💝' },
    ],
  },
]

const PROFILES: Record<string, {
  title: string
  emoji: string
  description: string
  destinations: string[]
  vibes: string[]
  color: string
}> = {
  aventure: {
    title: 'L\'Aventurier',
    emoji: '🏔️',
    description: 'Tu kiffes l\'adrénaline, les défis et les paysages qui font tourner la tête. Tu veux des trips qui te marquent, pas des vacances lambda.',
    destinations: ['Madère', 'Colombie', 'Monténégro'],
    vibes: ['Trek', 'Randonnée', 'Nature intense'],
    color: '#dc2626',
  },
  culture: {
    title: 'Le Curieux Culturel',
    emoji: '🏛️',
    description: 'Chaque voyage est une découverte. Tu veux comprendre les gens, l\'histoire, les traditions. Un bon resto local te rend plus heureux qu\'un spa.',
    destinations: ['Portugal', 'Roumanie', 'Sicile'],
    vibes: ['Gastronomie', 'Patrimoine', 'Artisanat local'],
    color: '#7c3aed',
  },
  nature: {
    title: 'Le Slow Traveler',
    emoji: '🌿',
    description: 'Tu voyages pour te ressourcer. Un lieu, une atmosphère, du temps. Pas besoin de tout voir — tu veux vivre le lieu.',
    destinations: ['Madère', 'Sardaigne', 'Normandie'],
    vibes: ['Éco-responsable', 'Bord de mer', 'Forêt'],
    color: '#059669',
  },
  'bien-etre': {
    title: 'L\'Amateur de Bien-être',
    emoji: '🧘',
    description: 'Voyager pour se faire du bien. Tu mérites le meilleur, et tu le sais. Un voyage qui nourrit le corps et l\'esprit.',
    destinations: ['Madère', 'Sardaigne', 'Alentejo'],
    vibes: ['Spa', 'Yoga', 'Gastronomie healthy'],
    color: '#0891b2',
  },
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const q = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      calculateResult(newAnswers)
    }
  }

  const calculateResult = (finalAnswers: Record<number, string>) => {
    const counts: Record<string, number> = {}
    Object.values(finalAnswers).forEach((v) => {
      counts[v] = (counts[v] || 0) + 1
    })
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    setResult(dominant)
    setShowResult(true)

    // Store result in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quiz-result', dominant)
    }
  }

  const profile = result ? PROFILES[result] : null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-white">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center px-6">
          <div className="max-w-2xl mx-auto">
            <span className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase">
              Quiz Heldonica
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mt-4 mb-6">
              Quel voyageur es-tu ?
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">
              5 questions pour découvrir ton profil travel et recevoir des recommandations personnalisées.
            </p>
          </div>
        </section>

        {/* Quiz */}
        <section className="pb-24 px-6">
          <div className="max-w-xl mx-auto">
            {!showResult ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-eucalyptus">
                      Question {currentQuestion + 1} / {QUESTIONS.length}
                    </span>
                    <span className="text-sm text-stone-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-eucalyptus h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-xl md:text-2xl font-serif font-light text-stone-900 mb-8 text-center">
                  {q.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left p-4 rounded-xl border-2 border-stone-100 hover:border-eucalyptus/40 transition-all group hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-stone-700 group-hover:text-stone-900 leading-snug">
                          {opt.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Result */
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
                {profile && (
                  <>
                    <div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                      style={{ backgroundColor: `${profile.color}15` }}
                    >
                      <span className="text-4xl">{profile.emoji}</span>
                    </div>

                    <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: profile.color }}>
                      Ton profil voyage
                    </span>
                    <h2 className="text-3xl font-serif font-light text-stone-900 mt-2 mb-4">
                      {profile.title}
                    </h2>
                    <p className="text-stone-600 leading-relaxed mb-8 max-w-md mx-auto">
                      {profile.description}
                    </p>

                    {/* Destinations recommandées */}
                    <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                        Destinations recommandées
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.destinations.map((dest) => (
                          <Link
                            key={dest}
                            href={`/destinations/${slugify(dest)}`}
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-stone-700 border border-stone-200 hover:border-amber-700 hover:text-amber-800 transition-colors"
                          >
                            {dest}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Vibe tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {profile.vibes.map((vibe) => (
                        <span
                          key={vibe}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${profile.color}15`, color: profile.color }}
                        >
                          {vibe}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                      <Link
                        href="/travel-planning#formulaire"
                        className="inline-block w-full py-4 bg-mahogany hover:brightness-110 text-white font-semibold rounded-xl transition-all shadow-lg"
                      >
                        ✈️ Créer mon voyage sur mesure
                      </Link>
                      <button
                        onClick={() => {
                          setCurrentQuestion(0)
                          setAnswers({})
                          setResult(null)
                          setShowResult(false)
                        }}
                        className="text-stone-500 hover:text-stone-700 text-sm underline"
                      >
                        Refaire le quiz
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Trust */}
        <section className="pb-16 px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-stone-500 text-sm">
              +500 voyageurs accompagnés par an · Réponse sous 48h · 100% sur mesure
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}