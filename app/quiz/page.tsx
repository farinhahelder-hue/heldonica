'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import EditableIcon from '@/components/inline-edit/EditableIcon'
import { EmojiIcon } from '@/components/ui/Icon'

const PAGE = "quiz";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const QUESTIONS = [
  {
    id: 1,
    question: "Comment tu choisis ta destination ?",
    options: [
      { value: "aventure", label: "Tu cherches l'aventure, les émotions fortes et la nature sauvage", emoji: "🏔️" },
      { value: "culture", label: "Histoire, art, architecture et rencontres locales", emoji: "🏛️" },
      { value: "nature", label: "Calme, paysages, déconnexion totale", emoji: "🌿" },
      { value: "bien-etre", label: "Tu veux te faire dorloter, spa, yoga, douceur", emoji: "🧘" },
    ],
  },
  {
    id: 2,
    question: "Ton rythme idéal en voyage ?",
    options: [
      { value: "aventure", label: "Tu te lèves à l'aube pour maximiser chaque journée", emoji: "⏰" },
      { value: "culture", label: "2-3 activités par jour, avec du temps pour flâner", emoji: "🚶" },
      { value: "nature", label: "Lent, contemplatif, un seul lieu par jour", emoji: "🐢" },
      { value: "bien-etre", label: "Au rythme du soleil et de mes envies", emoji: "☀️" },
    ],
  },
  {
    id: 3,
    question: "Ton approche de l'hébergement ?",
    options: [
      { value: "aventure", label: "Pragmatique : dortoirs, guesthouse, chez l'habitant", emoji: "🏕️" },
      { value: "culture", label: "Hôtel de caractère avec histoire, quartier authentique", emoji: "🏰" },
      { value: "nature", label: "Éco-lodge, cabane, yourte ou maison isolée", emoji: "🏡" },
      { value: "bien-etre", label: "Spa, piscine, vue panoramique, confort total", emoji: "🛁" },
    ],
  },
  {
    id: 4,
    question: "Qu'est-ce qui te fait vibrer en voyage ?",
    options: [
      { value: "aventure", label: "Le sommet atteint, le trek réussi, l'adrénaline", emoji: "🎯" },
      { value: "culture", label: "Le marché local, le petit resto caché, la discussion avec un artisan", emoji: "💬" },
      { value: "nature", label: "Le silence d'une forêt, le bruit des vagues, une aurore boréale", emoji: "✨" },
      { value: "bien-etre", label: "Un massage, un coucher de soleil parfait, le repos profond", emoji: "🌅" },
    ],
  },
  {
    id: 5,
    question: "Ta philosophie de voyage en une phrase ?",
    options: [
      { value: "aventure", label: "\"Vivre des histoires à raconter toute ma vie\"", emoji: "📖" },
      { value: "culture", label: "\"Comprendre le monde à travers ceux qui y vivent\"", emoji: "🌍" },
      { value: "nature", label: "\"Retourner à l'essentiel, loin du bruit du monde\"", emoji: "🍃" },
      { value: "bien-etre", label: "\"Prendre soin de soi, c'est aussi voyager autrement\"", emoji: "💝" },
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
  "aventure": {
    title: "L'Aventurier",
    emoji: "🏔️",
    description: "Tu kiffes l'adrénaline, les défis et les paysages qui font tourner la tête. Tu veux des trips qui te marquent, pas des vacances lambda.",
    destinations: ["Madère", "Colombie", "Monténégro"],
    vibes: ["Trek", "Randonnée", "Nature intense"],
    color: "#dc2626",
  },
  "culture": {
    title: "Le Curieux Culturel",
    emoji: "🏛️",
    description: "Chaque voyage est une découverte. Tu veux comprendre les gens, l'histoire, les traditions. Un bon resto local te rend plus heureux qu'un spa.",
    destinations: ["Portugal", "Roumanie", "Sicile"],
    vibes: ["Gastronomie", "Patrimoine", "Artisanat local"],
    color: "#7c3aed",
  },
  "nature": {
    title: "Le Slow Traveler",
    emoji: "🌿",
    description: "Tu voyages pour te ressourcer. Un lieu, une atmosphère, du temps. Pas besoin de tout voir — tu veux vivre le lieu.",
    destinations: ["Madère", "Sardaigne", "Normandie"],
    vibes: ["Éco-responsable", "Bord de mer", "Forêt"],
    color: "#059669",
  },
  "bien-etre": {
    title: "L'Amateur de Bien-être",
    emoji: "🧘",
    description: "Voyager pour se faire du bien. Tu mérites le meilleur, et tu le sais. Un voyage qui nourrit le corps et l'esprit.",
    destinations: ["Madère", "Sardaigne", "Alentejo"],
    vibes: ["Spa", "Yoga", "Gastronomie healthy"],
    color: "#0891b2",
  },
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Capture email au résultat : micro-conversion, jamais un péage. Le profil
  // s'affiche entier sans adresse ; l'adresse ne fait qu'envoyer ce même profil.
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [capture, setCapture] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

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

  const handleCapture = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (capture === 'sending' || !result) return

    setCapture('sending')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          // Champ piège : le serveur répond « succès » sans rien enregistrer.
          website_url: honeypot,
          source: 'quiz-' + result,
        }),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      setCapture('sent')
      setEmail('')
    } catch {
      // On garde l'adresse saisie : réessayer ne doit pas la faire retaper.
      setCapture('error')
    }
  }

  const profile = result ? PROFILES[result] : null

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE}>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-cloud-dancer/40 to-white">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center px-6">
          <div className="max-w-2xl mx-auto">
            <span className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase">
              {Z('hero_badge', 'text', "Quiz Heldonica", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mt-4 mb-6">
              {Z('hero_title', 'text', "Quel voyageur es-tu ?", undefined, 'span')}
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">
              {Z('hero_description', 'textarea', "5 questions pour découvrir ton profil travel et recevoir des recommandations personnalisées.", undefined, 'span')}
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
                  {Z('question_' + (currentQuestion + 1), 'textarea', q?.question || '', undefined, 'span')}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left p-4 rounded-xl border-2 border-stone-100 hover:border-eucalyptus/40 transition-all group hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          <EditableIcon
                            page="quiz"
                            zone={`question_${currentQuestion + 1}_opt_${j + 1}_emoji`}
                            fallback={opt.emoji}
                            size={26}
                            className="text-eucalyptus"
                          />
                        </span>
                        <span className="text-stone-700 group-hover:text-stone-900 leading-snug">
                          {Z('question_' + (currentQuestion + 1) + '_opt_' + (j + 1) + '_label', 'textarea', opt.label, undefined, 'span')}
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
                      <EmojiIcon emoji={profile.emoji} size={32} />
                    </div>

                    <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: profile.color }}>
                      {Z('result_badge', 'text', "Ton profil voyage", undefined, 'span')}
                    </span>
                    <h2 className="text-3xl font-serif font-light text-stone-900 mt-2 mb-4">
                      {Z('profile_' + result + '_title', 'text', profile.title, undefined, 'span')}
                    </h2>
                    <p className="text-stone-600 leading-relaxed mb-8 max-w-md mx-auto">
                      {Z('profile_' + result + '_description', 'textarea', profile.description, undefined, 'span')}
                    </p>

                    {/* Destinations recommandées */}
                    <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                        {Z('result_destinations_title', 'text', "Destinations recommandées", undefined, 'span')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.destinations.map((dest) => (
                          <Link
                            key={dest}
                            href={'/destinations/' + slugify(dest)}
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-stone-700 border border-stone-200 hover:border-eucalyptus hover:text-eucalyptus transition-colors"
                          >
                            {dest}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Vibe tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {profile.vibes.map((vibe, v) => (
                        <span
                          key={vibe}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${profile.color}15`, color: profile.color }}
                        >
                          {Z('profile_' + result + '_vibe_' + (v + 1), 'text', vibe, undefined, 'span')}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                      <Link
                        href="/travel-planning#formulaire"
                        className="inline-block w-full py-4 bg-mahogany hover:brightness-110 text-white font-semibold rounded-xl transition-all shadow-lg"
                      >
                        <EmojiIcon emoji="✈" size={16} className="inline-block mr-1 -mt-0.5" />
                        {Z('result_cta', 'text', "Créer mon voyage sur mesure", undefined, 'span')}
                      </Link>
                      <button
                        onClick={() => {
                          setCurrentQuestion(0)
                          setAnswers({})
                          setResult(null)
                          setShowResult(false)
                          setEmail('')
                          setCapture('idle')
                        }}
                        className="text-stone-500 hover:text-stone-700 text-sm underline"
                      >
                        {Z('result_retry', 'text', "Refaire le quiz", undefined, 'span')}
                      </button>
                    </div>

                    {/* Capture email — secondaire par rapport au CTA ci-dessus */}
                    <div className="mt-10 pt-8 border-t border-stone-200 text-left">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">
                        {Z('capture_email_title', 'text', "Reçois ton profil par email", undefined, 'span')}
                      </h3>
                      <p className="text-stone-600 text-sm leading-relaxed mb-4">
                        {Z(
                          'capture_email_note',
                          'textarea',
                          "Ton résultat reste consultable sans inscription. Si tu laisses ton adresse, tu recevras ce profil et les adresses qu'on a vraiment testées pour lui — un envoi, pas une liste de diffusion.",
                          undefined,
                          'span'
                        )}
                      </p>

                      {capture === 'sent' ? (
                        <p className="text-sm text-eucalyptus font-medium" role="status">
                          {Z('capture_email_success', 'text', "C'est envoyé. Pense à vérifier tes indésirables.", undefined, 'span')}
                        </p>
                      ) : (
                        <form onSubmit={handleCapture} className="flex flex-col sm:flex-row gap-3">
                          <label htmlFor="quiz-email" className="sr-only">
                            Ton adresse email
                          </label>
                          <input
                            id="quiz-email"
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={capture === 'sending'}
                            placeholder="ton@email.com"
                            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-eucalyptus disabled:opacity-60"
                          />
                          <input
                            type="text"
                            name="website_url"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            className="hidden"
                          />
                          <button
                            type="submit"
                            disabled={capture === 'sending'}
                            className="px-6 py-3 rounded-xl border border-mahogany text-mahogany text-sm font-semibold hover:bg-mahogany hover:text-white transition-colors disabled:opacity-60"
                          >
                            {capture === 'sending'
                              ? Z('capture_email_sending', 'text', "Envoi…", undefined, 'span')
                              : Z('capture_email_cta', 'text', "Recevoir mon profil", undefined, 'span')}
                          </button>
                        </form>
                      )}

                      {capture === 'error' && (
                        <p className="mt-3 text-sm text-stone-600" role="alert">
                          {Z('capture_email_error', 'text', "L'envoi n'a pas abouti. Réessaie dans un instant.", undefined, 'span')}
                        </p>
                      )}
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
              {Z('trust_text', 'textarea', "+500 voyageurs accompagnés par an · Réponse sous 48h · 100% sur mesure", undefined, 'span')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
