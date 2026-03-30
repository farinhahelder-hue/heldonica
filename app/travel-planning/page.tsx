import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'Travel Planning sur mesure | Heldonica',
  description: 'On conçoit ton voyage en couple sur mesure : itinéraires slow travel, hébergements éco-responsables, pépites hors sentiers battus. Demande gratuite.',
}

const services = [
  { icon: '🗺️', title: 'Itinéraire 100 % sur mesure', desc: 'On part de tes envies, ton rythme, ta durée. Chaque journée est pensée pour que tu vives un vrai voyage — pas une liste de cases à cocher.' },
  { icon: '🌿', title: 'Hébergements éco & authentiques', desc: "Maisons d'hôtes locales, écolodges, petits hôtels indépendants testés sur le terrain. Zéro chaîne, 100 % immersion." },
  { icon: '💑', title: 'Pensé pour les couples', desc: 'Ni tout-inclus, ni programme chargé. Des moments à deux, des pépites dénichées, une évasion qui vous ressemble.' },
  { icon: '📍', title: 'Logistique clé en main', desc: "Transports, réservations, carnet de route PDF, contacts locaux. Tu n'as plus qu'à partir." },
  { icon: '♻️', title: 'Voyage éco-responsable', desc: 'On intègre dès la conception des choix bas-carbone, des acteurs locaux et des pratiques respectueuses des territoires.' },
  { icon: '💬', title: 'Suivi personnalisé', desc: 'Un échange humain à chaque étape. On répond à tes questions avant, pendant et après le voyage.' },
]

const steps = [
  { num: '01', title: 'Tu remplis le formulaire', desc: 'Destination rêvée, durée, budget, style de voyage — 5 minutes suffisent.' },
  { num: '02', title: 'On échange ensemble', desc: 'Un appel ou échange écrit pour affiner ta vision et te proposer une approche personnalisée.' },
  { num: '03', title: 'On crée ton itinéraire', desc: 'Recherches, tests, sélection rigoureuse. On te livre un carnet de route détaillé.' },
  { num: '04', title: "Tu pars l'esprit libre", desc: "Tout est prêt. Il ne reste plus qu'à vivre l'aventure." },
]

export default function TravelPlanning() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#F8F4EF] via-[#e8f0ec] to-[#2A7A6F]/20 py-24 md:py-40">
          <div className="container max-w-4xl mx-auto text-center px-6">
            <span className="inline-block text-sm font-semibold tracking-widest text-[#2A7A6F] uppercase mb-4">
              Slow Travel · Sur mesure · En couple
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#6B2737] leading-tight mb-6">
              Ton prochain voyage,<br />
              <span className="text-[#2A7A6F]">rien que pour vous deux.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#3D3D3D] max-w-2xl mx-auto mb-10 leading-relaxed">
              On conçoit des escapades lentes et authentiques — des pépites hors sentiers battus, des hébergements qui ont une âme, des instants qu'on n'oublie pas.
            </p>
            <a
              href="https://tally.so/r/heldonica-travel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 bg-[#6B2737] text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-[#5a1f2d] transition-all duration-200"
            >
              ✨ Faire ma demande gratuite
            </a>
            <p className="mt-4 text-sm text-[#3D3D3D]/60">Sans engagement · Réponse sous 48h</p>
          </div>
        </section>

        {/* QUOTE */}
        <section className="bg-white py-20 px-6">
          <div className="container max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-serif text-[#3D3D3D] leading-relaxed italic">
              &ldquo;On voyage depuis des ann&eacute;es en cherchant le vrai go&ucirc;t des endroits &mdash; loin des circuits, proches des gens. Aujourd&apos;hui, on met cette expertise &agrave; votre service.&rdquo;
            </p>
            <span className="block mt-6 text-sm font-semibold tracking-wide text-[#2A7A6F] uppercase">&mdash; Heldonica, L&apos;Expert de l&apos;Aventure</span>
          </div>
        </section>

        {/* SERVICES */}
        <section className="bg-[#F8F4EF] py-20 px-6">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#6B2737] text-center mb-4">Ce qu&apos;on cr&eacute;e pour toi</h2>
            <p className="text-center text-[#3D3D3D]/70 mb-14 text-lg">Un voyage pens&eacute; de A &agrave; Z, avec l&apos;obsession du d&eacute;tail juste.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-[#2A7A6F]/10">
                  <span className="text-4xl mb-4 block">{s.icon}</span>
                  <h3 className="text-xl font-serif font-bold text-[#6B2737] mb-3">{s.title}</h3>
                  <p className="text-[#3D3D3D]/75 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="bg-white py-20 px-6">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#6B2737] text-center mb-14">Comment &ccedil;a marche&nbsp;?</h2>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <span className="text-5xl font-serif font-bold text-[#2A7A6F]/25 leading-none w-16 shrink-0">{step.num}</span>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#6B2737] mb-1">{step.title}</h3>
                    <p className="text-[#3D3D3D]/70 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gradient-to-r from-[#2A7A6F] to-[#1a5c54] py-24 px-6">
          <div className="container max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Pr&ecirc;ts pour l&apos;aventure&nbsp;?</h2>
            <p className="text-white/85 text-xl mb-10 leading-relaxed">Dis-nous o&ugrave; tu r&ecirc;ves d&apos;aller. On s&apos;occupe du reste.</p>
            <a
              href="https://tally.so/r/heldonica-travel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-[#F8F4EF] text-[#6B2737] text-xl font-bold rounded-xl shadow-xl hover:bg-white transition-all duration-200"
            >
              ✨ Faire ma demande gratuite
            </a>
            <p className="mt-5 text-white/60 text-sm">Sans engagement &middot; R&eacute;ponse sous 48h &middot; 100&nbsp;% humain</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
