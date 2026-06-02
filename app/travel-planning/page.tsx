'use client'

import { useState } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Combien coûte la conception sur mesure ?", "acceptedAnswer": { "@type": "Answer", "text": "Chaque projet est unique. Le tarif est établi selon la complexité de l'itinéraire, la durée et le niveau de personnalisation. En moyenne, compte entre 150€ et 350€ pour un voyage de 7 à 14 jours." }},
    { "@type": "Question", "name": "Dans combien de temps tu reçois ton carnet de route ?", "acceptedAnswer": { "@type": "Answer", "text": "En général sous 7 à 10 jours après validation du brief. Pour les projets urgents (départ dans moins de 3 semaines), on fait de notre mieux." }},
    { "@type": "Question", "name": "Tu ne connais pas ma destination.", "acceptedAnswer": { "@type": "Answer", "text": "On travaille avec un réseau de contacts locaux et on fait des recherches approfondies pour chaque nouvelle destination. La règle : on ne te conseille que ce qu'on est prêts à recommander à nos proches." }},
    { "@type": "Question", "name": "Est-ce que tu fais les réservations à ma place ?", "acceptedAnswer": { "@type": "Answer", "text": "On te fournit les liens, contacts et conseils pour chaque réservation. Pour un accompagnement complet (réservations incluses), c'est possible sur devis." }},
    { "@type": "Question", "name": "Qu'est-ce que tu reçois exactement ?", "acceptedAnswer": { "@type": "Answer", "text": "Un carnet de voyage PDF complet : programme jour par jour, carte interactive, hébergements testés, restaurants, transports, conseils pratiques et contacts locaux." }},
    { "@type": "Question", "name": "Et si le voyage ne correspond pas à ce qu'on avait prévu ?", "acceptedAnswer": { "@type": "Answer", "text": "On reste disponibles avant, pendant et après. Si quelque chose ne te convient pas sur place, tu nous écris et on trouve une solution ensemble." }},
    { "@type": "Question", "name": "C'est quoi la différence avec un guide papier ou un blog ?", "acceptedAnswer": { "@type": "Answer", "text": "Un guide, c'est générique. Un blog, c'est le vécu de quelqu'un d'autre. Nous, on part de TOI : tes envies, ton rythme, tes contraintes. C'est ton voyage, pas le nôtre répété." }}
  ]
}

const faqs = [
  {
    q: 'Combien coûte la conception sur mesure ?',
    a: 'Chaque projet est unique. Le tarif est établi selon la complexité de l\'itinéraire, la durée et le niveau de personnalisation. En moyenne, compte entre 150€ et 350€ pour un voyage de 7 à 14 jours. On commence toujours par un échange gratuit pour comprendre ton projet avant de proposer un chiffrage.'
  },
  {
    q: 'Dans combien de temps tu reçois ton carnet de route ?',
    a: 'En général sous 7 à 10 jours après validation du brief. Pour les projets urgents (départ dans moins de 3 semaines), contacte-nous directement — on fait de notre mieux.'
  },
  {
    q: 'Tu ne connais pas ma destination.',
    a: 'C\'est possible. On travaille avec un réseau de contacts locaux et on fait des recherches approfondies pour chaque nouvelle destination. La règle qu\'on s\'est fixée : on ne te recommande que ce qu\'on serait prêts àconseiller à nos proches. Même si c\'est notre première fois sur place.'
  },
  {
    q: 'Est-ce que tu fais les réservations à ma place ?',
    a: 'On te fournit tous les liens directs, contacts et conseils pour chaque réservation. Tu gardes le contrôle. Pour un accompagnement complet avec réservations incluses, c\'est possible sur devis — précise-le lors de ta demande.'
  },
  {
    q: 'Qu\'est-ce que tu reçois exactement comme livrable ?',
    a: 'Un carnet de voyage PDF complet, pensée pour toi : programme jour par jour avec horaires, carte interactive avec tous les points, hébergements sélectionnés avec liens directs, restaurants testés, transports détaillés, conseils pratiques (le meilleur moment pour y aller, les erreurs à éviter), contacts locaux. Tout reunidos en un seul document cohérent.'
  },
  {
    q: 'Et si le voyage ne correspond pas à ce qu\'on avait prévu ?',
    a: 'On reste disponibles avant, pendant et après. Si quelque chose ne te convient pas sur place — un restau fermé, une route barrée — tu nous écris et on trouve une solution ensemble. Ça fait partie du truc.'
  },
  {
    q: 'C\'est quoi la différence avec un guide papier ou un blog ?',
    a: 'Un guide, c\'est générique. Un blog, c\'est le vécu de quelqu\'un d\'autre qui ne te connaît pas. Nous, on part de TOI : tes envies, ton rythme, tes contraintes, ta façon de voyager. C\'est ton voyage, pas le nôtre répété.'
  },
]

const personas = [
  {
    title: 'Couples aventuriers',
    desc: 'Vous voulez ralentir sans vousennuyer, garder le hors-sentiers sans perdre le fil. Vous cherchez des adresses qu\'on ne trouve pas sur TripAdvisor. On vous comprend.',
    icon: '🌿',
  },
  {
    title: 'Solos en quête de vrai',
    desc: 'Tu voyages seul mais tu ne veux pas tomber dans le piège du tourisme de groupe. Tu veux des conseils qui marchent, pas des généralités. Et parfois, tu veux qu\'on te dise où manger ce soir.',
    icon: '✈️',
  },
  {
    title: 'Familles vers autre chose',
    desc: 'Vous avez des enfants et vous voulez leur montrer autre chose que des écrans et des files d\'attente. Un voyage qui les marque autant que vous. Ça existe, on peut t\'aider à le construire.',
    icon: '🏔️',
  },
]

const steps = [
  {
    num: '01',
    title: 'Brief — Tu nous racontes',
    desc: 'Tu nous écris ou tu remplis le formulaire. Tu nous parles de ton voyage rêvé, de tes contraintes, de ce qui te tient à cœur. Pas de case à cocher. Un vrai échange.',
    detail: 'Durée : 15-30 min. Résultat : on comprend ce qui compte pour toi.',
  },
  {
    num: '02',
    title: 'Conception — On bosse pour toi',
    desc: 'On vérifie tout. Les horaires de bus qui ne marchent pas le dimanche. Le restaurant fermé en basse saison. L\'hébergementsans WiFi là où t\'en as besoin. On te propose un premier jet sous 7-10 jours.',
    detail: 'Durée : 7-10 jours. Résultat : ton carnet de route en PDF.',
  },
  {
    num: '03',
    title: 'Livraison & ajustements',
    desc: 'Tu reçois ton carnet. Tu le lis, tu nous dis ce qui ne va pas. On ajuste ensemble. Quand c\'est bon, tu pars — et on reste dispo si besoin sur place.',
    detail: 'Durée : aussi longtemps qu\'il faut. Résultat : tu pars serein.',
  },
]

const deliverables = [
  {
    title: 'Carnet de route PDF',
    desc: 'Programme jour par jour avec horaires, liens, et conseils. Format lisible, imprimable, partageable.',
    icon: '📋',
  },
  {
    title: 'Carte interactive',
    desc: 'Tous tes points sur une carte — hébergements, restaurants, spots, sentiers. À ouvrir sur ton téléphone sur place.',
    icon: '🗺️',
  },
  {
    title: 'Hébergements sélectionnés',
    desc: 'Pas juste une liste. Chaque hébergement avec ce qui le rend bien, le prix indicatif, et le lien direct pour réserver.',
    icon: '🏡',
  },
  {
    title: 'Restaurants testés ou validés',
    desc: 'Le meilleur de la місцевоï cuisine locale, pas des chains internationales. Avec horaires, fourchette de prix, réservation conseillée ou pas.',
    icon: '🍽️',
  },
  {
    title: 'Transports détaillés',
    desc: 'Comment aller d\'un point à un autre. Bus, trains, ferry, taxis locaux — avec horaires réels, pas estimés.',
    icon: '🚐',
  },
  {
    title: 'Contacts locaux',
    desc: 'Les gens sur place qui peuvent vraiment t\'aider. Le réceptionniste qui parle français, le guide de montagne recommandé, le restaus où le propriétaire te reconnaît.',
    icon: '🤝',
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
            <svg className={`w-4 h-4 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
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
        .step-card { transition: transform 0.3s ease; }
        .step-card:hover { transform: translateY(-2px); }
      `}</style>

      <Header />
      <Breadcrumb />
      <main>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-stone-950 h-[60vh] md:h-[80vh]">
          <Image
            src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1600&q=85"
            alt="Couple en slow travel, vue panoramique sur la nature"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950" />
          <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-28 md:py-40 text-center">
            <p className="fade-up-1 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-5">
              Slow Travel · Conception sur mesure · En duo
            </p>
            <h1 className="fade-up-2 text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1] mb-6">
              On a appris à voyager vrai.<br />
              <em className="text-amber-300">Maintenant on conçoit le tien.</em>
            </h1>
            <p className="fade-up-3 text-base md:text-xl text-white max-w-2xl mx-auto leading-relaxed mb-10">
              Pas des itinéraires copiés sur des blogs. Des voyages conçus sur mesure — lents, sensoriels, mémorables. Un vrai échange, pas un formulaire.
            </p>
            <div className="fade-up-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/travel-planning-form"
                className="px-8 py-4 bg-amber-800 hover:bg-amber-700 text-white rounded font-semibold text-sm tracking-wide transition shadow-lg">
                Dis-nous où tu veux aller →
              </Link>
              <p className="text-white/70 text-xs">Sans engagement · Réponse sous 48h</p>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">{"On travaille en petit nombre — qualité délibérément limitée"}</span>
            </div>
          </div>
        </section>

        {/* ── POUR QUI ── */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center">Pour qui ?</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Ce n'est pas pour tout le monde.<br />
              <span className="italic text-stone-500">Et c'est ok.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {personas.map((p, i) => (
                <div key={i} className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                  <span className="text-3xl mb-4 block">{p.icon}</span>
                  <h3 className="text-lg font-serif font-light text-stone-900 mb-3">{p.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-stone-500 text-sm mt-8 max-w-xl mx-auto">
              Ce n'est pas pour toi si tu cherches juste une liste de hôtels. Par contre, si tu veux un voyage qui te ressemble — là, on peut parler.
            </p>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className="py-20 md:py-24 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center">Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Trois étapes. Pas de surprise.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="step-card relative">
                  <div className="absolute -top-3 left-6 bg-amber-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {s.num}
                  </div>
                  <div className="bg-white rounded-2xl p-8 pt-10 shadow-sm border border-stone-100 h-full">
                    <h3 className="text-xl font-serif font-light text-stone-900 mb-4">{s.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                    <p className="text-amber-700 text-xs font-semibold italic">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CE QUE TU REÇOIS ── */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center">Livrables</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Ce que tu as entre les mains
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {deliverables.map((d, i) => (
                <div key={i} className="flex gap-4 p-5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl shrink-0">{d.icon}</span>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm mb-1">{d.title}</h3>
                    <p className="text-stone-500 text-xs leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA INTERMÉDIAIRE ── */}
        <section className="py-16 bg-amber-900 text-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4">
              Prêt à construirerson voyage ?
            </h2>
            <p className="text-amber-200 text-sm mb-6">
              Dis-nous où tu veux aller. En 48h, tu as un premier retour, pas un devis froid.
            </p>
            <Link href="/travel-planning-form"
              className="inline-block px-8 py-3 bg-white text-amber-900 font-bold rounded shadow hover:bg-amber-50 transition text-sm">
              Commencer mon voyage →
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-10 text-center">
              Les questions qu'on nous pose vraiment
            </h2>
            <FAQ />
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 md:py-32 bg-stone-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Prêts pour l'aventure ?</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Dis-nous où tu rêves d'aller.<br />
              <em className="text-amber-300">On conçoit ton voyage.</em>
            </h2>
            <p className="text-stone-300 leading-relaxed mb-10">
              Un échange gratuit, sans engagement. On prend le temps de comprendre ton projet avant de proposer quoi que ce soit. Réponse sous 48h.
            </p>
            <Link href="/travel-planning-form"
              className="inline-block px-10 py-4 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded shadow-xl transition text-sm tracking-wide">
              Dis-nous où tu veux aller →
            </Link>
            <p className="mt-4 text-stone-500 text-xs">100% humain · Sans engagement · Réponse sous 48h</p>
          </div>
        </section>

      </main>

      {/* ── CTA MOBILE STICKY ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-stone-950 border-t border-stone-800 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-white text-xs font-bold">Voyage sur mesure</p>
          <p className="text-amber-400 text-xs">100% humain · Réponse 48h</p>
        </div>
        <Link href="/travel-planning-form"
          className="px-4 py-2 bg-amber-800 text-white rounded font-bold text-xs whitespace-nowrap shadow">
          Dis-nous →
        </Link>
      </div>

      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}