import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import TravelPlanningFAQ from '@/components/TravelPlanningFAQ'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Travel Planning Sur Mesure Écoresponsable — Conception de Voyage | Heldonica',
  description:
    'On conçoit ton voyage sur mesure : itinéraire personnalisé, adresses authentiques, rythme slow travel. 100% écoresponsable, pensé pour toi.',
  keywords: [
    'travel planning sur mesure',
    'travel planner francophone',
    'voyage sur mesure écoresponsable',
    'itinéraire personnalisé',
    'conception voyage',
    'voyage hors sentiers battus',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/travel-planning',
  },
}

export default function TravelPlanning() {
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-1 { opacity:0; animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-2 { opacity:0; animation: fadeUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-3 { opacity:0; animation: fadeUp 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-4 { opacity:0; animation: fadeUp 0.7s 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-5 { opacity:0; animation: fadeUp 0.7s 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .service-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.09); }
        .step-line::before { content:''; position:absolute; left:19px; top:44px; bottom:-20px; width:1px; background: linear-gradient(to bottom, #92400e40, transparent); }
      `}</style>

      <Header />
      <Breadcrumb />
      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-stone-950">
          <img
            src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1600&q=85"
            alt="Couple en slow travel, vue panoramique sur la nature"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            width="1600"
            height="900"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950" />
          <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-28 md:py-40 text-center">

            <p className="fade-up-1 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-5">
              Travel Planning · Terrain vécu
            </p>

            <h1 className="fade-up-2 text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1] mb-6">
              On ne fait pas des itinéraires.
              <br />
              <em className="text-amber-300">On fait le tien.</em>
            </h1>

            <p className="fade-up-3 text-base md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Tu nous envoies tes contraintes réelles — temps, budget, énergie, envie.
              On transforme ça en séquence concrète, avec les adresses qu&apos;on a testées
              et l&apos;ordre qui a du sens sur le terrain.
            </p>

            <div className="fade-up-4 flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/travel-planning-form"
                className="px-8 py-4 bg-amber-800 hover:bg-amber-700 text-white rounded font-semibold text-sm tracking-wide transition shadow-lg"
              >
                Nous écrire →
              </Link>
              <Link
                href="/blog"
                className="px-8 py-4 border border-white/30 hover:border-white/60 text-white/80 hover:text-white rounded font-semibold text-sm tracking-wide transition"
              >
                Lire le carnet →
              </Link>
            </div>

            <div className="fade-up-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-4 text-left">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Couples aventuriers</p>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Ralentir sans s&apos;ennuyer, garder le hors-sentiers sans perdre le fil. Notre terrain naturel.
                </p>
              </div>
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-4 text-left">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Solos &amp; familles</p>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Solo qui cherche du vrai, famille en quête d&apos;autre chose — même exigence, rythme adapté.
                </p>
              </div>
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-4 text-left">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Vécu sur le terrain</p>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Cartes, adresses, pépites dénichées. Tout part d&apos;expériences testées, pas inventées.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
                <p className="text-stone-500 text-xs font-bold tracking-[0.15em] uppercase mb-5">Sans nous</p>
                <ul className="space-y-4">
                  {[
                    'Des onglets ouverts partout et aucun fil clair',
                    'Un rythme pensé à J0 qui casse à J2',
                    'Des adresses "bien notées" mais pas faites pour toi',
                    'La peur de passer à côté de ce qui aurait vraiment compté',
                    'Un voyage qui se remplit plus qu\'il ne se vit',
                  ].map((txt) => (
                    <li key={txt} className="flex gap-3 items-start text-stone-600 text-sm">
                      <span className="text-stone-300 mt-0.5 shrink-0">✕</span>
                      {txt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
                <p className="text-amber-800 text-xs font-bold tracking-[0.15em] uppercase mb-5">Avec Heldonica</p>
                <ul className="space-y-4">
                  {[
                    'Une séquence qui respecte ton énergie, pas seulement ton rêve',
                    'Des adresses testées, pas repêchées à la dernière minute',
                    'Un voyage qui respire au bon moment',
                    'Des choix concrets qui tiennent sur place, pas juste sur écran',
                    'La sensation de partir léger parce que tout a déjà été pensé juste',
                  ].map((txt) => (
                    <li key={txt} className="flex gap-3 items-start text-stone-800 text-sm">
                      <span className="text-amber-600 mt-0.5 shrink-0 font-bold">✓</span>
                      {txt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-14">
              Tu nous dis le vrai.
              <br />
              On construit le reste.
            </h2>
            <div className="space-y-10">
              {[
                {
                  num: '01',
                  title: 'Tu poses le cadre',
                  desc: 'Temps, budget, énergie, style de voyage, degré de fatigue, envies contradictoires : on préfère le vrai à la carte postale.',
                  badge: 'Gratuit',
                },
                {
                  num: '02',
                  title: 'On clarifie ensemble',
                  desc: 'On échange pour comprendre ce que tu veux vivre, ce que tu veux éviter et ce qui ferait vraiment basculer le voyage du bon côté.',
                  badge: 'Humain',
                },
                {
                  num: '03',
                  title: 'On assemble ton rythme',
                  desc: 'Adresses, ordre, temps de trajet, respirations, jours forts : rien n\'est posé au hasard. On compose une séquence qui tient debout sur place.',
                  badge: '7–10 jours',
                },
                {
                  num: '04',
                  title: 'Tu pars avec du concret',
                  desc: 'Carnet clair, hébergements, restaurants, transports, conseils et erreurs à éviter. Tu n\'as plus besoin d\'improviser ce qui devait être anticipé.',
                  badge: 'Clé en main',
                },
              ].map((step, i) => (
                <div key={i} className="relative flex gap-6 items-start step-line last:before:hidden">
                  <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    {step.num}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-stone-900">{step.title}</h3>
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{step.badge}</span>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Ce qu&apos;on conçoit</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12">Ce qu&apos;on met dans ton départ</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  num: '01',
                  title: 'Rythme sur mesure',
                  desc: 'Pas une suite d\'adresses. Une cadence juste, pensée pour ce que tu peux vraiment vivre sans t\'épuiser.',
                },
                {
                  num: '02',
                  title: 'Adresses testées',
                  desc: 'Hébergements, restaurants, détours et moments forts qu\'on a vécus ou vérifiés avec la même exigence.',
                },
                {
                  num: '03',
                  title: 'Spécialité duo aventurier',
                  desc: 'On sait composer des voyages à deux qui ralentissent sans devenir mous, et qui gardent du relief sans saturation.',
                },
                {
                  num: '04',
                  title: 'Ouvert à ton format',
                  desc: 'Solo, famille curieuse ou groupe d\'amis : la logique reste la même, seul le réglage change.',
                },
                {
                  num: '05',
                  title: 'Logistique lisible',
                  desc: 'Le bon ordre, les bons trajets, les bons points d\'attention. Ce qui paraît léger à vivre est souvent lourd à préparer.',
                },
                {
                  num: '06',
                  title: 'Erreurs évitées',
                  desc: 'On te signale aussi ce qui casse un séjour : horaires trompeurs, zones mal calibrées, enchaînements trop ambitieux.',
                },
              ].map((s, i) => (
                <div key={i} className="service-card bg-stone-50 rounded-xl p-6 border border-stone-100">
                  <span className="text-xs font-bold tracking-[0.2em] text-amber-700 uppercase mb-3 block">{s.num}</span>
                  <h3 className="font-semibold text-stone-900 mb-2 text-base">{s.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RETOURS — placeholder honnête jusqu'aux vrais témoignages ── */}
        <section className="py-20 md:py-24 bg-stone-50">
          <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Retours</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6">
              Ce que les gens retiennent
            </h2>
            <p className="text-stone-600 leading-relaxed max-w-xl mx-auto mb-4">
              On reçoit régulièrement des retours qui convergent sur deux points : le rythme était juste,
              et les adresses tenaient vraiment sur place. Ce sont ces deux promesses qu&apos;on met au centre
              de chaque conception — pas une carte postale, mais un voyage qui tient debout.
            </p>
            <p className="text-stone-400 text-sm italic">
              ✦ Les premiers carnets clients arrivent bientôt ici.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Questions fréquentes</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-10">On répond à tes doutes</h2>
            <TravelPlanningFAQ />
          </div>
        </section>

        <section className="py-24 md:py-32 bg-amber-900 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=60)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <p className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-4">Prêt à partir juste ?</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Dis-nous ce qui est vrai.
              <br />
              <em>On s&apos;occupe du reste.</em>
            </h2>
            <p className="text-amber-200 leading-relaxed mb-10">
              Pas besoin d&apos;avoir le voyage déjà écrit dans ta tête. On préfère même quand le vrai arrive brut : c&apos;est là qu&apos;on travaille le mieux.
            </p>
            <Link
              href="/travel-planning-form"
              className="inline-block px-10 py-4 bg-white text-amber-900 font-bold rounded shadow-xl hover:bg-amber-50 transition text-sm tracking-wide"
            >
              Nous écrire →
            </Link>
            <p className="mt-4 text-amber-300/70 text-xs">Sans engagement · Réponse sous 48h · 100 % humain</p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-amber-900 border-t border-amber-800 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-white text-xs font-bold">On fait le tien.</p>
          <p className="text-amber-300 text-xs">Places limitées · 100 % humain</p>
        </div>
        <Link
          href="/travel-planning-form"
          className="px-4 py-2 bg-white text-amber-900 rounded font-bold text-xs whitespace-nowrap shadow"
        >
          Nous écrire →
        </Link>
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Travel Planning Sur Mesure',
            provider: {
              '@type': 'Organization',
              name: 'Heldonica',
              url: 'https://www.heldonica.fr',
              description: 'Travel planning slow travel écoresponsable pour couples, solos et familles. Itinéraires sur mesure hors des sentiers battus.',
              areaServed: 'FR',
              knowsAbout: ['slow travel', 'voyage écoresponsable', 'voyage sur mesure', 'travel planning'],
            },
            description: 'Conception sur mesure d\'itinéraires slow travel écoresponsables. Adresses testées, rythme personnalisé, carnets de voyage concrets.',
            url: 'https://www.heldonica.fr/travel-planning',
            mainEntityOfPage: {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: "Qu'est-ce qu'un travel planning sur mesure ?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Un travel planning sur mesure, c'est la conception complète de ton itinéraire de voyage selon tes envies, ton rythme et tes valeurs. Heldonica crée des voyages écoresponsables hors des sentiers battus, avec des adresses authentiques testées sur le terrain.",
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Combien coûte un travel planning sur mesure ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Le tarif varie selon la durée et la complexité du voyage. Contacte-nous via le formulaire pour recevoir un devis personnalisé.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Pour quels types de voyages proposez-vous du travel planning ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "On conçoit des voyages slow travel écoresponsables en Europe et à l'international : road trips, city breaks lents, immersions locales, destinations hors des sentiers battus comme Madère, la Roumanie ou la Sicile.",
                  },
                },
              ],
            },
          }),
        }}
      />
    </>
  )
}
