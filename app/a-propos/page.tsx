import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Notre histoire — Heldonica | Slow travel en couple',
  description: 'L’un vient de Madère, l’autre de Roumanie, et c’est à Paris qu’on s’est trouvés. Découvrez l’histoire atypique derrière Heldonica.',
}

export default function AProposPage() {
  return (
    <>
      <Header />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative h-[55vh] md:h-[65vh] bg-stone-900 flex items-end overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=85"
            alt="Heldonica — duo de voyageurs"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            width={1400} height={900} loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative z-10 px-6 md:px-16 pb-14 md:pb-24 max-w-3xl">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.1] mb-5">
              Une histoire<br />
              <em className="text-amber-300">atypique</em>
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
              Bienvenue chez Heldonica — notre petit coin d&apos;internet à deux, né de notre envie de sortir des sentiers battus et de savourer chaque moment, tout simplement.
            </p>
          </div>
        </section>

        {/* ── INTRO DUO ──────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-5 gap-12 md:gap-20 items-center">
              <div className="md:col-span-3 space-y-5">
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase">Pas vraiment classiques</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                  On s&apos;est rencontrés sur une appli,<br />
                  <span className="italic text-stone-500">sans être du même pays.</span>
                </h2>
                <p className="text-base text-stone-600 leading-relaxed">
                  Et si nos univers diffèrent, c&apos;est justement là que notre aventure a commencé. L&apos;un vient de Madère, l&apos;autre de Roumanie — et c&apos;est à Paris qu&apos;on s&apos;est trouvés.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Deux trajectoires opposées, une même envie d&apos;explorer autrement. Les villes à contre-courant, les chemins qui s&apos;éloignent des flux, les tables où l&apos;on mange vrai, les pépites dénichées loin des sentiers balisés.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Nos itinéraires, on les a vécus — pas seulement planifiés. Nos adresses, on les a testées. Ce qu&apos;on partage ici, c&apos;est un voyage plus lent, plus sensoriel, plus vivant, où chaque détail devient une raison de rester un peu plus longtemps.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=700&q=85"
                    alt="Voyage en couple — silhouettes"
                    className="rounded-2xl w-full aspect-[3/4] object-cover shadow-lg"
                    width={500} height={667} loading="lazy"
                  />
                  <div className="absolute -bottom-5 -left-5 bg-amber-800 text-white px-5 py-4 rounded-xl shadow-lg hidden md:block">
                    <p className="text-xs font-bold tracking-wider uppercase mb-1">Rencontrés</p>
                    <p className="text-2xl font-serif font-light">Paris, 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LUI / ELLE ───────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-12 text-center">Le duo derrière Heldonica</p>
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">

              {/* LUI */}
              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=700&q=80"
                    alt="Madère — falaises et océan"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                    width={600} height={450} loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Lui — Madère</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">
                  L&apos;insulaire de l&apos;âme
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Né à Madère, entre l&apos;Atlantique et les falaises vertigineuses. Il part à l&apos;aventure là où les cartes s&apos;arrêtent, traquant les paysages que les guides ne montrent pas encore.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Spécialiste de la digitalisation et de l&apos;IAification dans l&apos;hôtellerie, il accompagne les établissements indépendants dans leur transformation numérique — avec la rigueur de l&apos;expert et l&apos;œil du voyageur.
                </p>
              </div>

              {/* ELLE */}
              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80"
                    alt="Roumanie — paysages des Carpates"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                    width={600} height={450} loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Elle — Roumanie</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">
                  La lectrice de villes
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Roumaine, une enfance entre les Carpates et l&apos;Europe entière — sept pays habités, sept façons d&apos;apprendre à lire le monde. Elle lit une ville comme un poème.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Plume et regard derrière Heldonica, elle imagine les itinéraires, déniche les pépites et raconte chaque découverte avec l&apos;exactitude de celle qui y était vraiment.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── PHILOSOPHIE ─────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Ce qu&apos;on défend</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                Heldonica, c&apos;est notre manière de raconter<br />
                <em className="text-amber-800">le monde avec sincérité</em>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  titre: 'Vécu, pas planifié',
                  texte: 'Chaque adresse qu&apos;on recommande, on l&apos;a testée. Pas récupérée sur un listicle. Pas inspirée d&apos;un autre blog.',
                },
                {
                  titre: 'Lenteur &amp; profondeur',
                  texte: 'On ne voyage pas pour cocher. On voyage pour ressentir, rencontrer, comprendre. Chaque destination mérite qu&apos;on s&apos;y attarde.',
                },
                {
                  titre: 'Curieux, toujours',
                  texte: 'L&apos;inattendu est notre boussole. Les chemins de traverse, les tables sans enseigne, les paysages que les guides n&apos;ont pas encore trouvés.',
                },
              ].map((item) => (
                <div key={item.titre} className="border-t-2 border-amber-800 pt-6">
                  <h3
                    className="font-semibold text-stone-900 text-base mb-3"
                    dangerouslySetInnerHTML={{ __html: item.titre }}
                  />
                  <p
                    className="text-stone-500 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.texte }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CITATION CENTRALE ───────────────────────────────────── */}
        <section className="py-20 bg-stone-900">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-8">✦ Notre conviction</p>
            <blockquote className="text-2xl md:text-4xl font-serif font-light text-white leading-relaxed">
              &ldquo;Un voyage plus lent, plus sensoriel, plus vivant — où chaque détail devient
              une raison de rester un peu plus longtemps.&rdquo;
            </blockquote>
            <p className="text-stone-500 text-sm mt-8">Heldonica — Paris</p>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-[#f7f6f2]">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-8 text-center">Et maintenant ?</p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/blog"
                className="group block bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-stone-100 hover:border-amber-200 transition-all">
                <p className="text-xs text-amber-800 font-bold tracking-widest uppercase mb-3">Blog Slow Travel</p>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                  Nos carnets de voyage
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">
                  Itinéraires vécus, adresses testées, destinations hors des sentiers balisés. Tout ce qu&apos;on aurait aimé trouver avant de partir.
                </p>
                <span className="text-amber-800 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Explorer le blog →
                </span>
              </Link>
              <Link href="/travel-planning"
                className="group block bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-stone-100 hover:border-amber-200 transition-all">
                <p className="text-xs text-amber-800 font-bold tracking-widest uppercase mb-3">Travel Planning</p>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                  Ton voyage, conçu sur mesure
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">
                  On imagine, on construit, on documente. Un itinéraire qui te ressemble, avec des adresses qu&apos;on a vécues — pas récupérées en ligne.
                </p>
                <span className="text-amber-800 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Découvrir le service →
                </span>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
