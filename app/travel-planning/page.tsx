'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

const faqs = [
  {
    q: 'Combien coûte la conception sur mesure ?',
    a: "Chaque projet est différent. On commence par un échange gratuit pour comprendre ce que tu veux vraiment faire, puis on chiffre selon la durée, la complexité et le niveau d'accompagnement.",
  },
  {
    q: 'Dans combien de temps reçoit-on le carnet ?',
    a: 'En général sous 7 à 10 jours après validation du brief. Si le départ est proche, dis-le-nous tout de suite et on te dira franchement ce qui est tenable.',
  },
  {
    q: 'Travaillez-vous seulement sur des destinations déjà vécues ?',
    a: 'Notre préférence va au terrain qu’on connaît déjà, parce que c’est là qu’on est les plus justes. Quand on ouvre un nouveau terrain, on le dit clairement et on garde le même niveau d’exigence.',
  },
  {
    q: 'Faites-vous les réservations à notre place ?',
    a: 'On peut fournir les liens, les contacts et le bon ordre. Si tu veux un accompagnement plus complet, on le cadre ensemble au moment du brief.',
  },
  {
    q: 'Qu’est-ce qu’on reçoit exactement ?',
    a: 'Un carnet clair et concret : rythme jour par jour, adresses choisies, hébergements, transports, conseils pratiques et ce qu’il faut éviter pour ne pas casser le voyage.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-stone-900 text-sm hover:bg-stone-50 transition"
          >
            <span>{item.q}</span>
            <svg
              className={`w-4 h-4 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
              <p className="pt-4">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
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
        .service-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.09); }
        .step-line::before { content:''; position:absolute; left:19px; top:44px; bottom:-20px; width:1px; background: linear-gradient(to bottom, #92400e40, transparent); }
      `}</style>

      <Header />
      <Breadcrumb />
      <main>
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
              Slow travel vécu · Contraintes réelles · Hors sentiers
            </p>
            <h1 className="fade-up-2 text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1] mb-6">
              On ne fait pas des itinéraires.
              <br />
              <em className="text-amber-300">On fait le tien.</em>
            </h1>
            <p className="fade-up-3 text-base md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Tu nous envoies tes contraintes réelles — temps, budget, énergie, envie. On transforme ça en séquence concrète, avec les adresses qu&apos;on a testées et l&apos;ordre qui a du sens sur le terrain.
            </p>
            <div className="fade-up-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/travel-planning-form"
                className="px-8 py-4 bg-amber-800 hover:bg-amber-700 text-white rounded font-semibold text-sm tracking-wide transition shadow-lg"
              >
                Nous écrire →
              </Link>
              <p className="text-stone-400 text-xs">Sans engagement · Réponse sous 48h</p>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">
                Notre terrain naturel : les couples qui veulent ralentir sans s&apos;ennuyer, les solos qui cherchent du vrai, les familles qui en ont marre des parcs d&apos;attractions.
              </span>
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
                    'Des adresses “bien notées” mais pas faites pour toi',
                    'La peur de passer à côté de ce qui aurait vraiment compté',
                    'Un voyage qui se remplit plus qu’il ne se vit',
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
                  desc: 'Adresses, ordre, temps de trajet, respirations, jours forts : rien n’est posé au hasard. On compose une séquence qui tient debout sur place.',
                  badge: '7–10 jours',
                },
                {
                  num: '04',
                  title: 'Tu pars avec du concret',
                  desc: 'Carnet clair, hébergements, restaurants, transports, conseils et erreurs à éviter. Tu n’as plus besoin d’improviser ce qui devait être anticipé.',
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
                  desc: 'Pas une suite d’adresses. Une cadence juste, pensée pour ce que tu peux vraiment vivre sans t’épuiser.',
                },
                {
                  num: '02',
                  title: 'Adresses testées',
                  desc: 'Hébergements, restaurants, détours et moments forts qu’on a vécus ou vérifiés avec la même exigence.',
                },
                {
                  num: '03',
                  title: 'Spécialité duo aventurier',
                  desc: 'On sait composer des voyages à deux qui ralentissent sans devenir mous, et qui gardent du relief sans saturation.',
                },
                {
                  num: '04',
                  title: 'Ouvert à ton format',
                  desc: 'Solo, famille curieuse ou groupe d’amis : la logique reste la même, seul le réglage change.',
                },
                {
                  num: '05',
                  title: 'Logistique lisible',
                  desc: 'Le bon ordre, les bons trajets, les bons points d’attention. Ce qui paraît léger à vivre est souvent lourd à préparer.',
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

        <section className="py-20 md:py-24 bg-stone-950 text-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Retours</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-12">Ce qui revient souvent</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'On n’a jamais eu la sensation d’exécuter un plan. On avançait, et tout semblait tomber au bon moment.',
                  name: 'Marie & Théo',
                  dest: 'Madère · 10 jours',
                },
                {
                  quote: 'Le carnet était précis sans être rigide. On sentait qu’il avait été pensé par des gens qui avaient vraiment marché là-bas.',
                  name: 'Sophie & Lucas',
                  dest: 'Colombie · 14 jours',
                },
                {
                  quote: 'Même avec nos contraintes enfants + budget + fatigue, on a eu un voyage qui nous ressemblait. Et ça, c’est rare.',
                  name: 'Camille & Romain',
                  dest: 'Sicile · 8 jours',
                },
              ].map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                  <p className="text-stone-300 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-amber-400 text-xs">{t.dest}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Questions fréquentes</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-10">On répond à tes doutes</h2>
            <FAQ />
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
              Pas besoin d’avoir le voyage déjà écrit dans ta tête. On préfère même quand le vrai arrive brut : c’est là qu’on travaille le mieux.
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
    </>
  )
}
