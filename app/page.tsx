import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO — vidéo plein écran, texte gauche aligné */}
      <section className="relative h-screen bg-black flex items-end overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4"
        />
        {/* grain overlay subtil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="relative z-20 px-6 md:px-16 pb-16 md:pb-24 max-w-4xl">
          <p className="text-amber-300 text-xs font-semibold tracking-[0.2em] uppercase mb-5">Slow Travel · Voyages en couple · Paris</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1] mb-6">
            Explorateurs émerveillés,<br />
            <em>dénicheurs de pépites.</em>
          </h1>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
            L&apos;aventure ne se trouve pas seulement au bout du monde — elle se cache dans une ruelle oubliée, un café discret, un sentier silencieux qui révèle l&apos;âme d&apos;un lieu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className="px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white rounded font-semibold text-sm tracking-wide transition">
              Nos carnets de voyage
            </Link>
            <Link href="/travel-planning" className="px-6 py-3 border border-white/50 hover:border-white text-white hover:bg-white/10 rounded font-semibold text-sm tracking-wide transition">
              Conception sur mesure
            </Link>
          </div>
        </div>
      </section>

      {/* IDENTITÉ — texte + stats sans placeholder */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
            {/* Texte — 3 colonnes */}
            <div className="md:col-span-3">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-stone-900 leading-tight mb-6">
                Un art du voyage
                <span className="block italic text-amber-800">autrement</span>
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                On est deux, et on se complète à la perfection. Elle, Roumaine — une enfance entre les Carpates et l&apos;Europe entière, sept pays habités, sept façons d&apos;apprendre à lire le monde — lit une ville comme un poème.
              </p>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                Lui, insulaire de Madère dans l&apos;âme — né entre l&apos;Atlantique et les falaises vertigineuses — part à l&apos;aventure là où les cartes s&apos;arrêtent, traquant les paysages que les guides ne montrent pas encore.
              </p>
              <p className="text-base text-stone-600 leading-relaxed mb-8">
                C&apos;est à Paris qu&apos;on s&apos;est trouvés. Ce qu&apos;on partage : un voyage plus lent, plus sensoriel, plus vivant — là où chaque détail devient une raison de rester un peu plus longtemps.
              </p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                Lire nos carnets de voyage →
              </Link>
            </div>
            {/* Stats — 2 colonnes */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              {[
                { nb: "12+", label: "Destinations documentées" },
                { nb: "100%", label: "Adresses testées sur le terrain" },
                { nb: "7", label: "Pays habités entre nous" },
                { nb: "2015", label: "Première aventure commune" },
              ].map((s) => (
                <div key={s.label} className="border-t-2 border-amber-800 pt-4">
                  <p className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-1">{s.nb}</p>
                  <p className="text-xs text-stone-500 leading-snug">{s.label}</p>
                </div>
              ))}
              <div className="col-span-2 mt-2">
                <p className="text-xs text-stone-400 leading-relaxed">
                  <span className="font-semibold text-stone-600">Terrains de jeu :</span><br />
                  Paris · Madère · Normandie · Le Havre · Timișoara · Malte · Sicile · Sardaigne · Tanzanie · Colombie · Afrique du Sud
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ITINÉRAIRES — grille éditoriale asymétrique */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Carnets de voyage</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900">
                Nos itinéraires vécus
              </h2>
            </div>
            <Link href="/blog" className="text-sm text-amber-800 font-semibold hover:underline">Voir tous les articles →</Link>
          </div>

          {/* Featured card */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Link href="/destinations" className="group relative rounded-xl overflow-hidden bg-stone-800 aspect-[4/3] md:aspect-auto">
              <img
                src="https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80"
                alt="Madère — falaises et végétation luxuriante"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
                width="800"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="inline-block bg-amber-800 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-3">Destination</span>
                <h3 className="text-white text-2xl md:text-3xl font-serif font-light leading-tight">Madère, île des pépites cachées</h3>
                <p className="text-gray-300 text-sm mt-2">7–10 jours · Lévadas, falaises &amp; saveurs atlantiques</p>
              </div>
            </Link>

            <div className="grid grid-rows-2 gap-6">
              {[
                {
                  title: "Paris Insolite",
                  sub: "3–5 jours · Passages secrets, ateliers, bistrots authentiques",
                  img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
                  alt: "Paris — ruelle typique",
                },
                {
                  title: "Normandie Poétique",
                  sub: "4–6 jours · Falaises de craie, villages de charme",
                  img: "https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?w=600&q=80",
                  alt: "Normandie — falaises d'Étretat",
                },
              ].map((item) => (
                <Link key={item.title} href="/blog" className="group relative rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                    width="600"
                    height="400"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-white text-xl font-serif font-light">{item.title}</h3>
                    <p className="text-gray-300 text-xs mt-1">{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Row secondaire */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: "Timișoara Méconnue", sub: "Architecture austro-hongroise & gastronomie", img: "https://images.unsplash.com/photo-1563889362097-f3cdfb7e1e65?w=400&q=80", alt: "Timișoara" },
              { title: "Le Havre Contemporain", sub: "Architecture moderniste & port mythique", img: "https://images.unsplash.com/photo-1611768998625-2a2e2f9e2c71?w=400&q=80", alt: "Le Havre" },
              { title: "Île-de-France Cachée", sub: "Châteaux, forêts & villages pittoresques", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", alt: "Île-de-France" },
            ].map((item) => (
              <Link key={item.title} href="/blog" className="group relative rounded-xl overflow-hidden bg-stone-800 aspect-[3/2]">
                <img
                  src={item.img}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  loading="lazy"
                  width="400"
                  height="270"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white text-base font-serif font-semibold">{item.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GASTRONOMIE — split éditorial avec vrai contenu */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=85"
                alt="Table gastronomique — ambiance restaurant"
                className="rounded-xl w-full aspect-[4/3] object-cover"
                loading="lazy"
                width="700"
                height="525"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-800 text-white px-5 py-3 rounded-lg shadow-lg hidden md:block">
                <p className="text-xs font-bold tracking-wider uppercase">Adresses testées</p>
                <p className="text-2xl font-serif font-light mt-0.5">100%</p>
              </div>
            </div>
            <div>
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Food &amp; Lifestyle</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight mb-6">
                Inspirations gourmandes
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                On ne voyage pas seulement pour voir — on voyage pour goûter. Chaque destination révèle ses saveurs authentiques : les recettes portugaises transmises de génération en génération, les brasseries parisiennes que personne ne connaît encore, les restaurants cachés qui font vibrer les cœurs.
              </p>
              <p className="text-base text-stone-600 leading-relaxed mb-8">
                Nos sélections culinaires ne sont jamais des listes touristiques. Ce sont des adresses testées, des rencontres avec des chefs passionnés, des moments de partage autour d&apos;une table où l&apos;on raconte des histoires.
              </p>
              <div className="space-y-4 border-l-2 border-amber-200 pl-5">
                {[
                  { titre: "Recettes locales", desc: "Les secrets culinaires des régions que l'on explore" },
                  { titre: "Accords mets & ambiances", desc: "Les adresses qui subliment chaque moment de voyage" },
                  { titre: "Rencontres culinaires", desc: "Les chefs et restaurateurs qui font la différence" },
                ].map((item) => (
                  <div key={item.titre}>
                    <p className="font-semibold text-stone-800 text-sm">{item.titre}</p>
                    <p className="text-stone-500 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA VOYAGE SUR MESURE — fond sombre sobre */}
      <section className="py-20 md:py-28 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Travel Planning</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-6">
                Votre aventure,<br />
                <em className="text-amber-400">conçue sur mesure</em>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                Confiez-nous les clés de votre prochaine escapade. On imagine, on construit, on documente — un itinéraire qui vous ressemble, avec des adresses qu&apos;on a testées, pas récupérées sur un listicle.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/travel-planning" className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold text-sm transition">
                  Découvrir le service
                </Link>
                <Link href="/travel-planning-form" className="px-6 py-3 border border-white/30 hover:border-white/60 text-white rounded font-semibold text-sm transition">
                  Démarrer un projet
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { titre: "Itinéraires personnalisés", desc: "Basés sur vos envies, votre rythme, vos contraintes. Aucun voyage ne se ressemble." },
                { titre: "Adresses vécues, pas inventées", desc: "Hôtels de charme, restaurants cachés, expériences de terrain — chaque recommandation est vérifiée." },
                { titre: "Carnet de voyage complet", desc: "Cartes, conseils pratiques, adresses et inspirations pour chaque étape de votre aventure." },
              ].map((item) => (
                <div key={item.titre} className="border border-white/10 rounded-lg p-5 hover:border-white/25 transition">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.titre}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTING HÔTELIER — split inversé */}
      <section className="py-20 md:py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Consulting B2B</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight mb-6">
                Expertise hôtelière
                <span className="block italic text-stone-600">au service de vos résultats</span>
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                Revenue Management, SEO local, expérience client — on accompagne les établissements indépendants qui veulent piloter leur activité avec rigueur et ambition.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Revenue Management", "SEO Local", "Expérience client", "Mix canaux", "ROI"].map((tag) => (
                  <span key={tag} className="bg-white border border-stone-300 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <Link href="/hotel-consulting" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                Découvrir l&apos;offre consulting →
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&q=85"
                alt="Hôtel — lobby élégant"
                className="rounded-xl w-full aspect-[4/3] object-cover"
                loading="lazy"
                width="700"
                height="525"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16 md:py-20 bg-amber-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-4">Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-3">
            Les pépites dénichées,<br /> directement dans ta boîte mail
          </h2>
          <p className="text-amber-200 text-sm mb-8">Adresses secrètes, carnets de route, conseils de terrain — 2× par mois, sans spam.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="ton@email.com"
              className="flex-1 px-4 py-3 rounded text-stone-900 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button type="submit" className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold text-sm transition whitespace-nowrap">
              S&apos;abonner
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
