import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'À propos | Heldonica',
  description:
    "Le duo derrière Heldonica. Notre histoire, notre philosophie du slow travel et pourquoi on conçoit des voyages sur mesure.",
  keywords: [
    'heldonica',
    'slow travel',
    'à propos',
    'duo voyage',
    'travel planner',
    'voyage authentique',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/a-propos',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/a-propos',
    title: 'À propos | Heldonica',
    description: "Le duo derrière Heldonica. Notre histoire et notre philosophie du slow travel.",
    images: [
      {
        url: 'https://www.heldonica.fr/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow travel en couple',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export const revalidate = 3600

const schemaPerson = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Heldonica",
  "url": "https://www.heldonica.fr/a-propos",
  "description": "Duo franco-portugais spécialiste slow travel entre Paris, Madère et Roumanie",
  "sameAs": [
    "https://www.instagram.com/heldonica",
    "https://www.linkedin.com/company/heldonicatravel"
  ]
};

const PILLIERS = [
  {
    emoji: '🐢',
    titre: 'Lent, pas lazy',
    description: 'Ralentir pour mieux voir. Prendre le temps de comprendre un quartier, une culture, une cuisine. Le voyage qui compte vraiment demande de la présence.',
  },
  {
    emoji: '✨',
    titre: 'Vrai, pas parfait',
    description: 'Le voyage testé, pas fantasmé. Les restaurants où le patron te reconnaît, les sentiers qui n\'existent sur aucune carte, les erreurs qui deviennent des histoires.',
  },
  {
    emoji: '🎯',
    titre: 'Sur mesure, pas en série',
    description: "Chaque voyage est unique. On ne copie pas un itinéraire, on construit avec toi — tes envies, ton rythme, tes contraintes.",
  },
]

const STATS = [
  { valeur: '7', label: 'Pays habités' },
  { valeur: '25+', label: 'Carnets publiés' },
  { valeur: '4', label: 'Ans de slow travel' },
]

export default function AProposPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        
        {/* ── HERO ── */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              On n&apos;est pas des guides.<br />
              <span className="text-amber-400 italic">On est des voyageurs.</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Un duo qui a tout quitté pour voyager vrai.<br />
              Et qui t&apos;aide à en faire autant.
            </p>
          </div>
        </section>

        {/* ── NOTRE HISTOIRE ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">D&apos;où on vient</h2>
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              {/* Texte narratif */}
              <div className="space-y-5">
                <p className="text-stone-600 leading-relaxed">
                  Lui est né à Madère, entre l&apos;Atlantique et des falaises que les cartes n&apos;ont pas encore toutes nommées. Elle a grandi entre la Normandie et Paris, avec le voyage dans le sang depuis toujours.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  On s&apos;est rencontrés à Paris. Et très vite, on a compris qu&apos;on avait la même façon de voir un voyage : pas comme une checklist de lieux à cocher, mais comme une expérience à vivre pleinement.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  En 2019, on a décidé de faire autrement. De ralentir. De prendre le temps de comprendre les endroits où on allait, plutôt que de les traverser. De garder les yeux ouverts quand les autres fermaient leur guide.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Aujourd&apos;hui, on documente ce qu&apos;on vit — parce qu&apos;on croit que les meilleures infos sont celles qu&apos;on trouve sur le terrain, pas dans les blogs sponsorisés. Et quand t&apos;es prêt, on conçoit ton voyage sur mesure.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-4">
                {STATS.map((stat, i) => (
                  <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-center">
                    <p className="text-4xl md:text-5xl font-serif font-light text-amber-800 mb-1">{stat.valeur}</p>
                    <p className="text-stone-500 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── NOTRE PHILOSOPHIE ── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Notre philosophie</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Trois piliers qu&apos;on ne négocie pas
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {PILLIERS.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                    <span className="text-2xl">{p.emoji}</span>
                  </div>
                  <h3 className="text-xl font-serif font-light text-stone-900 mb-3">{p.titre}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CE QU&apos;ON FAIT CONCRÈTEMENT ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ce qu&apos;on fait</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Concrètement, on fait quoi ?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Blog & Carnets */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                  <span className="text-2xl">📖</span>
                </div>
                <h3 className="text-xl font-serif font-light text-stone-900 mb-4">Blog & Carnets</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  On documente ce qu&apos;on vit vraiment. Pas des listes copiées d&apos;internet, des récits avec les erreurs, les surprises, le vrai — ce qu&apos;on te cache ailleurs.
                </p>
                <Link href="/blog" className="inline-flex items-center gap-2 text-amber-800 font-semibold hover:gap-3 transition-all">
                  Lire les carnets →
                </Link>
              </div>

              {/* Travel Planning */}
              <div className="bg-stone-900 text-white rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-amber-800 flex items-center justify-center mb-5">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-xl font-serif font-light mb-4">Travel Planning</h3>
                <p className="text-stone-300 leading-relaxed mb-6">
                  On conçoit ton voyage sur mesure. Un brief, un échange humain, un carnet de route pensé pour toi — avec les adresses qu&apos;on a vraiment testées.
                </p>
                <Link href="/travel-planning" className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:gap-3 transition-all">
                  Concevoir mon voyage →
                </Link>
              </div>

              {/* Consulting Hôtelier */}
              <div className="bg-eucalyptus/10 rounded-2xl p-8 border border-eucalyptus/20">
                <div className="w-12 h-12 rounded-full bg-eucalyptus/20 flex items-center justify-center mb-5">
                  <span className="text-2xl">🏨</span>
                </div>
                <h3 className="text-xl font-serif font-light text-stone-900 mb-4">Consulting Hôtelier</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  On accompagne les hôteliers indépendants qui veulent réduire leur dépendance aux OTA. Contenu, stratégie digitale, positionnement — avec le regard du voyageur.
                </p>
                <Link href="/expert-hotelier" className="inline-flex items-center gap-2 text-eucalyptus font-semibold hover:gap-3 transition-all">
                  Voir l&apos;offre B2B →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÉASSURANCE FINALE ── */}
        <section className="py-20 md:py-28 bg-amber-50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <blockquote className="text-2xl md:text-3xl font-serif font-light text-stone-900 leading-relaxed mb-8">
              &ldquo;On ne te recommande que ce qu&apos;on serait prêts<br />à conseiller à nos proches.&rdquo;
            </blockquote>
            <p className="text-stone-500 text-sm">
              Des questions ? Écris-nous à{' '}
              <a href="mailto:contact@heldonica.fr" className="text-amber-800 hover:underline font-medium">
                contact@heldonica.fr
              </a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }} />
    </>
  )
}
