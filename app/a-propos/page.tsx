import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getSettings } from '@/lib/settings'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Notre histoire — Heldonica | Slow Travel vécu en duo',
  description:
    "On est Heldonica, un duo d'explorateurs passionnés par le slow travel. Madère, Roumanie, Paris : on part, on teste, on revient avec des pépites qu'on te partage. Et quand t'es prêt, on conçoit ton voyage sur mesure.",
  keywords: [
    'heldonica',
    'slow travel',
    'notre histoire',
    'travel planner',
    'voyage authentique',
    'duo voyage',
    'carnets de route',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/a-propos',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/a-propos',
    title: 'Notre histoire — Heldonica | Slow Travel vécu en duo',
    description:
      "On est Heldonica, un duo d'explorateurs passionnés par le slow travel. On part, on teste, on revient avec des pépites.",
    images: [
      {
        url: 'https://www.heldonica.fr/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow travel, pépites et voyages hors des sentiers battus',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export const revalidate = 3600

const schemaPerson = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Heldonica",
  "url": "https://www.heldonica.fr/a-propos",
  "jobTitle": "Travel Planner",
  "description": "Duo d'explorateurs passionnés par le slow travel et les pépites cachées",
  "sameAs": [
    "https://www.instagram.com/heldonica",
    "https://www.linkedin.com/company/heldonicatravel"
  ]
};

export default async function AProposPage() {
  const heroSettings = await getSettings(
    'hero_type',
    'hero_video_url',
    'hero_poster_image',
    'hero_background_image',
    'page_title',
    'intro_text'
  )
  
  const heroType = heroSettings.hero_type || 'image'
  const heroVideo = heroSettings.hero_video_url
  const heroPoster = heroSettings.hero_poster_image || heroSettings.hero_background_image
  const backgroundImage = heroSettings.hero_background_image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=85'
  
  return (
    <>
      <Header />
      <main>
        {/* ─── HERO ─── */}
        <section className="relative h-[55vh] md:h-[65vh] bg-stone-900 flex items-end overflow-hidden">
          {heroType === 'video' && heroVideo && (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={heroPoster}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          )}
          {(heroType === 'image' || !heroVideo) && (
            <Image
              src={backgroundImage}
              alt="Paysage naturel paisible — l'esprit slow travel de Heldonica"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              width={1400}
              height={900}
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative z-10 px-6 md:px-16 pb-14 md:pb-24 max-w-3xl">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.1] mb-5">
              Une histoire
              <br />
              <em className="text-amber-300">qui s'écrit sur le terrain</em>
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
              Madère. Roumanie. Paris. On a grandi entre l'Atlantique et les Carpates, on s'est trouvé à Paris — et ensemble, on adecided que le voyage le plus intéressant, c'est celui qui te change un peu quand tu reviens.
            </p>
          </div>
        </section>

        {/* ─── SLOW TRAVEL — POURQUOI ─── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-5 gap-12 md:gap-20 items-center">
              <div className="md:col-span-3 space-y-5">
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase">Ce qu'on croit</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                  Le slow travel n'est pas une stratégie,
                  <br />
                  <span className="italic text-stone-500">c'est une évidence.</span>
                </h2>
                <p className="text-base text-stone-600 leading-relaxed">
                  <strong>Le voyage le plus précieux n'est pas celui qu'on voit sur Instagram.</strong> C'est celui où tu te perds un peu dans les venelles de Lisbonne sans Google Maps. Où tu reviens avec l'adresse d'un café à Funchal que même le réceptionniste de ton hôtel ne connaissait pas — tu sais, celui avec le carrelage azul qui sent le café torréfié depuis 1972.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  C'est celui où tu sais exactement combien de temps il faut marcher pour trouver le meilleur point de vue de la ville — parce que tu y es allé trois fois, à trois heures différentes. Où tu as ta table favorite dans ce restaurant de Sibiu, et où le propriétaire sait déjà ce que tu vas commander.
                </p>
                <p className="text-base text-stone-600 leading-relaxed">
                  Quand tu voyages autrement, tu vis autrement. Tu choisis la qualité sur la quantité. Tu reviens moins fatigué qu'avant de partir — et avec des histoires que personne autour de toi n'a encore.
                </p>
                <p className="text-base text-stone-600 leading-relaxed font-semibold">
                  On ne vend pas des destinations. On conçoit des expériences.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=700&q=85"
                    alt="Voyage en couple — silhouettes Heldonica"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute -bottom-5 -left-5 bg-amber-800 text-white rounded-xl px-5 py-4 shadow-lg">
                    <p className="text-xs font-bold tracking-widest uppercase mb-1">Depuis</p>
                    <p className="text-2xl font-serif">2019</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LE DUO ─── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-12 text-center">Le duo</p>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              
              {/* Lui */}
              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=700&q=80"
                    alt="Madère — falaises et océan Atlantique"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Lui — Madère</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">L'insulaire de l'âme</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Il est né à Madère, entre l'Atlantique et des falaises que les cartes n'ont pas encore toutes nommées. Il part là où les guides s'arrêtent.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Et quand il rentre, il aide les hôtels à mieux raconter ce qu'ils sont. Pas ce qu'ils aimeraient paraître — ce qu'ils sont vraiment, avec leurs petites imperfections attachantes.
                </p>
                <p className="text-stone-500 text-sm leading-relaxed italic mt-3">
                  "Ma Madère préférée, c'est celle que tu trouves quand tu rates ton bus."
                </p>
              </div>

              {/* Elle */}
              <div className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80"
                    alt="Roumanie — paysages des Carpates"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">Elle — Roumanie</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">La lectrice de villes</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-3">
                  Elle lit une ville comme un poème. Sept pays habités. Pas visités — habités. C'est différent.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Elle tient la plume, affine les itinéraires et garde le niveau d'exigence là où beaucoup s'arrêtent à une jolie image. Elle sait que le meilleur moment d'une ville, c'est celui où les touristes dorment.
                </p>
                <p className="text-stone-500 text-sm leading-relaxed italic mt-3">
                  "Un bon voyage, c'est un bon livre : tu ne le finishes pas, tu le refermes en pensant déjà à la prochaine page."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── NOTRE APPROCHE ─── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <div className="mb-14">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Ce qu'on défend</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight">
                Heldonica, c'est notre manière de raconter
                <br />
                <em className="text-amber-800">le monde sans le lisser</em>
              </h2>
            </div>
            <div className="space-y-10">
              {[
                {
                  num: '01',
                  titre: 'Vécu, jamais récupéré',
                  texte: 'Chaque adresse qu\'on te recommande, on l\'a testée. Pas récupérée sur un listicle. Pas recopiée d\'un autre blog. Le vrai goût des choses, ça se vérifie en y revenant deux fois.',
                },
                {
                  num: '02',
                  titre: 'Lenteur & profondeur',
                  texte: 'On ne voyage pas pour cocher des cases. On voyage pour ressentir, rencontrer, comprendre. Et pour savoir quand il vaut mieux rester une heure de plus sur cette terrasse plutôt que courir au prochain point GPS.',
                },
                {
                  num: '03',
                  titre: 'Notre POV = duo, notre service = tous',
                  texte: 'On teste, on affine, on raconte d\'abord à deux — même en bas de chez toi. Ensuite, on met cette même obsession du rythme juste au service d\'un solo, d\'une famille, d\'un groupe d\'amis. Le voyage sur mesure, c\'est pas un luxe, c\'est un bon用药.',
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

        {/* ─── MÉTHODE ─── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-8 text-center">Comment on bosse</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight text-center mb-12">
              Un vrai échange, pas un formulaire
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                <span className="text-4xl font-serif text-amber-300 mb-4 block">1</span>
                <h3 className="text-xl font-serif font-light text-stone-900 mb-3">On t'écoute</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Tu nous racontes tes envies, tes contraintes, ton rythme. Tu peux nous dire que tu détestes les queues, que tu veux voir le lever du soleil depuis un rooftop, ou que tu as besoin d'une pause entre deux villes. On note tout.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                <span className="text-4xl font-serif text-amber-300 mb-4 block">2</span>
                <h3 className="text-xl font-serif font-light text-stone-900 mb-3">On conçoit pour toi</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  On vérifie que le restaurant est ouvert le mardi (parce que oui, ça compte). On vérifie que le WiFi marche là où t'en as besoin. On te propose un itinéraire qui te ressemble, pas un copier-coller.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                <span className="text-4xl font-serif text-amber-300 mb-4 block">3</span>
                <h3 className="text-xl font-serif font-light text-stone-900 mb-3">On t'accompagne</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Avant, pendant, après. On te donne les infos qui font la différence : le mec à côté du marché qui fait le meilleur espresso, le sentier alternatif qui évite la foule du midi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── NOTRE PHILOSOPHIE ─── */}
        <section className="py-20 md:py-28 bg-amber-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Notre philosophie</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight text-center mb-12">
              Trois convictions qu'on ne négocie pas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-8 border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                  <span className="text-2xl">🐢</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-3">Slow &gt; Fast</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  On préfère une terrasse de 3h à 10 musées en 1 jour. Le vrai voyage, c'est pas une checklist.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-3">Vécu &gt; Googled</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  On ne recommande que ce qu'on a testé nous-mêmes. Pas de listicle, pas de plagiat.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-3">Rare &gt; Connu</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Les pépites dénichées, pas les spots Instagram saturés. On cherche ce qui mérite d'être trouvé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ON A VOYAGÉ ICI ─── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Destinations testées</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight text-center mb-10">
              On a voyagé ici
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { emoji: '🇷🇴', name: 'Roumanie', href: '/destinations/roumanie' },
                { emoji: '🇵🇹', name: 'Madère', href: '/destinations/madere' },
                { emoji: '🇫🇷', name: 'Paris', href: '/destinations/paris' },
                { emoji: '🇨🇭', name: 'Suisse', href: '/destinations/suisse' },
                { emoji: '🇮🇹', name: 'Sicile', href: '/destinations/sicile' },
                { emoji: '🇲🇪', name: 'Monténégro', href: '/destinations/montenegro' },
              ].map((dest) => (
                <Link
                  key={dest.name}
                  href={dest.href}
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <span className="text-4xl">{dest.emoji}</span>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-amber-800 transition-colors">{dest.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-20 md:py-28 bg-[#f7f6f2]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-8">Notre conviction</p>
            <blockquote className="text-2xl md:text-4xl font-serif font-light text-white leading-relaxed">
              &ldquo;On ne raconte bien que ce qu'on a vraiment vécu.&rdquo;
            </blockquote>
            <p className="text-stone-500 text-sm mt-8">Heldonica — Paris</p>
          </div>
        </section>

        {/* ─── CTA ─── */}
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
                  Itinéraires vécus, retours de terrain, adresses qu'on aurait aimé trouver avant de partir. Chaque mot est né d'un pas posé.
                </p>
                <span className="text-amber-800 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Lire le carnet →
                </span>
              </Link>
              <Link
                href="/planifier"
                className="group block bg-stone-900 rounded-2xl p-8 shadow-sm hover:shadow-md border border-stone-800 hover:border-amber-700 transition-all"
              >
                <p className="text-xs text-amber-300 font-bold tracking-widest uppercase mb-3">Travel Planning</p>
                <h3 className="text-2xl font-serif font-light text-white mb-3 group-hover:text-amber-300 transition-colors">
                  Tu veux qu'on conçoive ton voyage sur mesure ?
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-5">
                  Raconte-nous. En 48h, tu as un premier piste concrètes, pas un catalogue.
                </p>
                <span className="text-amber-300 font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                  Découvrir le Travel Planning →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }} />
    </>
  )
}