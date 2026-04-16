import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Notre histoire — Heldonica | Duo slow travel, service ouvert à tous',
  description:
    "Un duo né entre Madère, la Roumanie et Paris. Notre point de vue vient du terrain vécu à deux, et notre exigence sert aujourd'hui les solos, couples, familles et groupes d'amis.",
  alternates: {
    canonical: 'https://heldonica.fr/a-propos',
  },
  openGraph: {
    url: 'https://heldonica.fr/a-propos',
    title: 'Notre histoire — Heldonica | Duo slow travel, service ouvert à tous',
    description:
      "Un duo né entre Madère, la Roumanie et Paris. Notre point de vue vient du terrain vécu à deux, et notre exigence sert aujourd'hui les solos, couples, familles et groupes d'amis.",
    images: [
      {
        url: 'https://heldonica.fr/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow travel, pépites et voyages hors des sentiers battus',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function AProposPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative h-[55vh] md:h-[65vh] bg-stone-900 flex items-end overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=85"
            alt="Heldonica — duo de voyageurs slow travel"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            width={1400}
            height={900}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative z-10 px-6 md:px-16 pb-14 md:pb-24 max-w-3xl">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.1] mb-5">
              Une histoire
              <br />
              <em className="text-amber-300">qui s&apos;écrit sur le terrain</em>
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
              Madère. Roumanie. Paris. Notre point de vue est né en duo ; notre service s&apos;ouvre à tous ceux qui veulent voyager plus lentement, plus sincèrement et plus loin des sentiers balisés.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-5 gap-12 md:gap-20 items-center">
              <div className="md:col-span-3 space-y-5">
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase">Pas vraiment classiques</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                  On s&apos;est rencontrés sur une appli,
                  <br />
                  <span className="italic text-stone-500">sans être du même pays.</span>
                </h2>
                <p className="text-base text-stone-600 leading-relaxed">
                  Et si nos univers diffèrent, c&apos;est précisément là que tout a commencé. L&apos;un vient de Madère, l&apos;autre de Roumanie, et c&apos;est à Paris qu&apos;on s&apos;est trouvés.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Deux trajectoires opposées, une même manie : ralentir, regarder, revenir. On aime les villes à contre-courant, les chemins qui s&apos;écartent, les tables qui sentent vraiment quelque chose.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Ce qu&apos;on partage ici, ce n&apos;est pas une envie de voyage. C&apos;est ce qu&apos;on a vécu. Nos itinéraires, on les a faits. Nos adresses, on les a testées. Et quand on se trompe, on revient jusqu&apos;à comprendre.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Heldonica parle depuis le duo, parce que c&apos;est notre laboratoire et notre filtre. Mais quand on conçoit un voyage, cette même exigence terrain sert aussi les solos, les familles curieuses et les groupes d&apos;amis.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=700&q=85"
                    alt="Voyage en couple — silhouettes Heldonica"
                    className="rounded-2xl w-full aspect-[3/4] object-cover shadow-lg"
                    width={500}
                    height={667}
                    loading="lazy"
                  />
                  <div className="absolute -bottom-5 -left-5 bg-amber-800 text-white px-5 py-4 rounded-xl shadow-lg hidden md:block">
                    <p className="text-xs font-bold tracking-wider uppercase mb-1">Ensemble depuis</p>
                    <p className="text-2xl font-serif font-light">Paris, 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { chiffre: '10+', label: 'ans de terrain en duo' },
                { chiffre: '17+', label: 'carnets publiés' },
                { chiffre: '7', label: 'pays habités' },
                { chiffre: '100+', label: 'adresses vécues' },
              ].map((item) => (
                <div key={item.label} className="py-6">
                  <p className="text-4xl md:text-5xl font-serif font-light text-amber-800 mb-2">{item.chiffre}</p>
                  <p className="text-xs text-stone-500 leading-snug uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-12 text-center">Le duo derrière Heldonica</p>
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=700&q=80"
                    alt="Madère — falaises et océan Atlantique"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                    width={600}
                    height={450}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Lui — Madère</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">L&apos;insulaire de l&apos;âme</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Il est né à Madère, entre l&apos;Atlantique et des falaises que les cartes n&apos;ont pas encore toutes nommées. Il part là où les guides s&apos;arrêtent.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Et quand il rentre, il aide les hôtels à mieux raconter ce qu&apos;ils sont. Pas ce qu&apos;ils aimeraient paraître, ce qu&apos;ils sont vraiment.
                </p>
              </div>

              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80"
                    alt="Roumanie — paysages des Carpates"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                    width={600}
                    height={450}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Elle — Roumanie</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">La lectrice de villes</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Elle lit une ville comme un poème. Sept pays habités. Pas visités — habités. C&apos;est différent.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Elle tient la plume, affine les itinéraires et garde le niveau d&apos;exigence là où beaucoup s&apos;arrêtent à une jolie image.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <div className="mb-14">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Ce qu&apos;on défend</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                Heldonica, c&apos;est notre manière de raconter
                <br />
                <em className="text-amber-800">le monde sans le lisser</em>
              </h2>
            </div>
            <div className="space-y-10">
              {[
                {
                  num: '01',
                  titre: 'Vécu, jamais récupéré',
                  texte: 'Chaque adresse qu\'on recommande, on l\'a testée. Pas récupérée sur un listicle. Pas recopiée ailleurs. Le vrai goût des choses, ça se vérifie.',
                },
                {
                  num: '02',
                  titre: 'Lenteur & profondeur',
                  texte: 'On ne voyage pas pour cocher. On voyage pour ressentir, rencontrer, comprendre et savoir quand il vaut mieux rester une heure de plus.',
                },
                {
                  num: '03',
                  titre: 'Notre POV = duo, notre service = tous',
                  texte: 'Dénicheurs de pépites, même en bas de chez toi, on teste, on affine et on raconte d\'abord à deux. Ensuite, on met cette même obsession du rythme juste au service d\'un solo, d\'une famille ou d\'un groupe d\'amis.',
                },
              ].map((item) => (
                <div key={item.num} className="grid md:grid-cols-[80px_1fr] gap-6 items-start">
                  <span className="text-5xl font-serif font-light text-stone-200 leading-none select-none">{item.num}</span>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-base mb-2">{item.titre}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-stone-900">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-8">Notre conviction</p>
            <blockquote className="text-2xl md:text-4xl font-serif font-light text-white leading-relaxed">
              &ldquo;On ne raconte bien que ce qu&apos;on a vraiment vécu.&rdquo;
            </blockquote>
            <p className="text-stone-500 text-sm mt-8">Heldonica — Paris</p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-[#f7f6f2]">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-8 text-center">Et maintenant ?</p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/blog"
                className="group block bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-stone-100 hover:border-amber-200 transition-all"
              >
                <p className="text-xs text-amber-800 font-bold tracking-widest uppercase mb-3">Blog Slow Travel</p>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                  Nos carnets de voyage
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">
                  Itinéraires vécus, retours de terrain, adresses qu&apos;on aurait aimé trouver avant de partir.
                </p>
                <span className="text-amber-800 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Lire le carnet →
                </span>
              </Link>
              <Link
                href="/travel-planning-form"
                className="group block bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-stone-100 hover:border-amber-200 transition-all"
              >
                <p className="text-xs text-amber-800 font-bold tracking-widest uppercase mb-3">Travel Planning</p>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                  Ton voyage, pensé juste
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">
                  On part de tes vraies contraintes, pas d&apos;un modèle générique. Et on construit à partir du terrain, pas d&apos;un tableau Pinterest.
                </p>
                <span className="text-amber-800 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Nous écrire →
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
