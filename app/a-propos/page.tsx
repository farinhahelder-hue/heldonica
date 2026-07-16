import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getAllPosts } from '@/lib/blog-supabase'

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
  "url": "https://www.heldonica.fr",
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
    description: 'Ralentir pour mieux voir. Prendre le temps de comprendre un quartier, une culture, une cuisine. Le voyage qui compte vraiment demande de la présence, pas une liste à cocher.',
  },
  {
    emoji: '✨',
    titre: 'Vrai, pas parfait',
    description: 'Le voyage qu\'on te raconte, on l\'a vécu. Les adresses où le patron te reconnaît, les sentiers qui n\'existent sur aucune carte, les erreurs qui deviennent des histoires qu\'on garde.',
  },
  {
    emoji: '🎯',
    titre: 'Sur mesure, pas en série',
    description: "On ne vend pas des destinations. On conçoit des expériences. Chaque voyage est construit avec toi — tes envies, ton rythme, tes contraintes. Pas un copier-coller.",
  },
]

export default async function AProposPage() {
  const posts = await getAllPosts().catch(() => [])
  const carnetCount = posts.length || 25

  const STATS = [
    { valeur: '7+', label: 'Pays habités' },
    { valeur: `${carnetCount}+`, label: 'Carnets publiés' },
    { valeur: '4', label: 'Langues parlées dans ce duo' },
  ]

  return (
    <InlineEditProvider page="a-propos">
      <Header />
      <Breadcrumb />
      <main className="min-h-screen">
        
        {/* ── HERO ── */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <EditableZone page="a-propos" zone="hero_image_url" type="image" fallback="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=70"
            className="absolute inset-0 opacity-15 w-full h-full object-cover"
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              <EditableZone page="a-propos" zone="hero_title_1" fallback="On n'est pas des guides." className="inline" />
              <br />
              <span className="text-teal italic">
                <EditableZone page="a-propos" zone="hero_title_2" fallback="On est des voyageurs." className="inline" />
              </span>
            </h1>
            <EditableZone page="a-propos" zone="hero_text" type="textarea" fallback="Un duo qui a tout quitté pour voyager vrai. Et qui t'aide à en faire autant."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto block"
            />
          </div>
        </section>

        {/* ── NOTRE HISTOIRE ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_story_badge" fallback="Notre histoire"
              className="text-mahogany text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            />
            <EditableZone page="a-propos" zone="section_story_title" fallback="D'où on vient"
              className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8 block"
            />
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              <div className="space-y-5">
                <EditableZone page="a-propos" zone="bio_text_1" type="textarea" fallback="Heldonica est né d'une frustration simple : après Madère, on s'est rendu compte qu'on avait passé plus de temps à planifier notre voyage qu'à le vivre. Et qu'avec les bonnes adresses et le bon rythme, tout aurait été différent."
                  className="text-stone-600 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_2" type="textarea" fallback="L'un est né sur une île au milieu de l'Atlantique, entre levadas et océan. Ses racines insulaires lui ont donné le goût des sentiers qui ne figurent sur aucune carte et des tables familiales dont seuls les locaux connaissent le nom. L'autre a grandi entre deux pays, deux langues, la route comme réflexe naturel. Elle apporte au duo un œil éditorial — l'adresse qui raconte quelque chose, le détail qui fait la différence entre un bon voyage et un voyage dont on parle encore."
                  className="text-stone-600 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_3" type="textarea" fallback="Le voyage le plus précieux n'est pas celui qu'on voit sur Instagram. C'est celui où tu te perds un peu. Où tu reviens avec une adresse que personne dans ton entourage ne connaît. Où tu sais exactement combien de temps il faut marcher pour trouver la meilleure terrasse de la ville."
                  className="text-stone-600 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_4" type="textarea" fallback="Le slow travel, ce n'est pas une stratégie. C'est une évidence. Quand on voyage autrement, on vit autrement. On choisit qualité sur quantité. On revient moins fatigué qu'avant de partir."
                  className="text-stone-600 leading-relaxed block"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {STATS.map((stat, i) => (
                  <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-center">
                    <EditableZone page="a-propos" zone={`stat_${i + 1}_value`} fallback={stat.valeur}
                      className="text-4xl md:text-5xl font-serif font-light text-mahogany mb-1 block"
                    />
                    <EditableZone page="a-propos" zone={`stat_${i + 1}_label`} fallback={stat.label}
                      className="text-stone-500 text-sm block"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── NOTRE PHILOSOPHIE ── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_philo_badge" fallback="Notre philosophie"
              className="text-mahogany text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <EditableZone page="a-propos" zone="section_philo_title" fallback="Trois piliers qu'on ne négocie pas"
              className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center block"
            />
            
            <div className="grid md:grid-cols-3 gap-6">
              {PILLIERS.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                  <div className="w-14 h-14 rounded-full bg-eucalyptus/10 flex items-center justify-center mb-5">
                    <span className="text-2xl">{p.emoji}</span>
                  </div>
                  <EditableZone page="a-propos" zone={`pillar_${i + 1}_title`} fallback={p.titre}
                    className="text-xl font-serif font-light text-stone-900 mb-3 block"
                  />
                  <EditableZone page="a-propos" zone={`pillar_${i + 1}_text`} type="textarea" fallback={p.description}
                    className="text-stone-600 text-sm leading-relaxed block"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CE QU'ON FAIT CONCRÈTEMENT ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_services_badge" fallback="Ce qu'on fait"
              className="text-mahogany text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <EditableZone page="a-propos" zone="section_services_title" fallback="Concrètement, on fait quoi ?"
              className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center block"
            />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center mb-5">
                  <span className="text-2xl">📖</span>
                </div>
                <EditableZone page="a-propos" zone="service_1_title" fallback="Blog & Carnets"
                  className="text-xl font-serif font-light text-stone-900 mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_1_text" type="textarea" fallback="On documente ce qu'on vit vraiment. Pas des listes copiées d'internet, des récits avec les erreurs, les surprises, le vrai — ce qu'on te cache ailleurs."
                  className="text-stone-600 leading-relaxed mb-6 block"
                />
                <Link href="/blog" className="inline-flex items-center gap-2 text-mahogany font-semibold hover:gap-3 transition-all">
                  <EditableZone page="a-propos" zone="service_1_cta" fallback="Lire les carnets →" />
                </Link>
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-mahogany flex items-center justify-center mb-5">
                  <span className="text-2xl">🗺️</span>
                </div>
                <EditableZone page="a-propos" zone="service_2_title" fallback="Travel Planning"
                  className="text-xl font-serif font-light mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_2_text" type="textarea" fallback="On conçoit ton voyage sur mesure. Un brief, un échange humain, un carnet de route pensé pour toi — avec les adresses qu'on a vraiment testées."
                  className="text-stone-300 leading-relaxed mb-6 block"
                />
                <Link href="/travel-planning" className="inline-flex items-center gap-2 text-teal font-semibold hover:gap-3 transition-all">
                  <EditableZone page="a-propos" zone="service_2_cta" fallback="Concevoir mon voyage →" />
                </Link>
              </div>

              <div className="bg-eucalyptus/10 rounded-2xl p-8 border border-eucalyptus/20">
                <div className="w-12 h-12 rounded-full bg-eucalyptus/20 flex items-center justify-center mb-5">
                  <span className="text-2xl">🎁</span>
                </div>
                <EditableZone page="a-propos" zone="service_3_title" fallback="Guides & Pépites Offerts"
                  className="text-xl font-serif font-light text-stone-900 mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_3_text" type="textarea" fallback="On partage gratuitement nos cartes interactives de terrain, nos checklists de voyage et nos guides de voyage thématiques pour t'aider à partir sereinement."
                  className="text-stone-600 leading-relaxed mb-6 block"
                />
                <Link href="/destinations" className="inline-flex items-center gap-2 text-eucalyptus font-semibold hover:gap-3 transition-all">
                  <EditableZone page="a-propos" zone="service_3_cta" fallback="Découvrir les guides →" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÉASSURANCE FINALE ── */}
        <section className="py-20 md:py-28 bg-eucalyptus/5">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <blockquote className="text-2xl md:text-3xl font-serif font-light text-stone-900 leading-relaxed mb-8">
              &ldquo;<EditableZone page="a-propos" zone="quote_text" type="textarea" fallback="On n'a pas de témoignages clients. On a des années de route, des carnets remplis d'adresses dénichées, et une méthode éprouvée sur le terrain. C'est nos preuves." className="inline" />&rdquo;
            </blockquote>
            <p className="text-stone-500 text-sm">
              Des questions ? Écris-nous à{' '}
              <a href="mailto:contact@heldonica.fr" className="text-mahogany hover:underline font-medium">
                contact@heldonica.fr
              </a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }} />
    </InlineEditProvider>
  )
}
