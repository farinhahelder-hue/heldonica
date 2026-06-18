import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Santos Madère | Porto da Cruz, village de pêcheurs et vignobles | Heldonica",
    description: "Santos (Porto da Cruz) sur la côte est de Madère : plages de sable noir volcanique, vignobles en terrasses, tavernes de pêcheurs et distillerie de poncha. Authenticité préservée.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/santos' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Côte Est', href: '/destinations/madere/cote-est' },
]

const pepites = [
  { 
    title: 'Porto da Cruz', 
    description: 'Le port de pêche de Santos conserve une activité artisanale vivante. Les fileiras, ces filets coniques traditionnels utilisés depuis des siècles, sont encore fabriqués artisanalement par les pêcheurs locaux. Chaque soir, vers 17h, les retours de pêche animent le port avec des thons, des espadons et des maquereaux. Le marché informel qui s\'installe alors permet d\'acheter du poisson d\'une fraîcheur exceptionnelle, directement des filets aux poêles.', 
    icon: '⚓' 
  },
  { 
    title: 'Plage de sable noir', 
    description: 'La Fajã de Santos constitue l\'une des rares plages de sable noir de Madère. Formée par les coulées volcaniques qui atteignirent l\'océan, elle offre une étendue de galets et de sable volcanique où les amateurs de baignade trouveront leur bonheur. Les vagues de l\'Atlantique peuvent être puissantes, rappelant que cette façade orientale est exposée aux houles atlantiques. Un petit bar de plage sert des rafraîchissements et des sandwiches.', 
    icon: '🏖️' 
  },
  { 
    title: 'Vignobles en terrasses', 
    description: 'Les pentes abruptes au-dessus de Santos portent des vignobles cultivés en terrasses depuis le XVe siècle. Le cépage local, le Verdelho, produit un vin blanc sec qui accompagne parfaitement les poissons grillés. Certaines parcelles, cultivées selon les méthodes ancestrales sur des murets de pierre volcanique, produisent des vins biologiques certifiés. Les domaines proposent des dégustations sur rendez-vous.', 
    icon: '🍷' 
  },
  { 
    title: 'Distillerie de poncha', 
    description: 'La liqueur de poncha, mélange de rhum de canne à sucre local, de miel de bruyère et de jus de citron pressé, constitue la boisson traditionnelle de Madère. La distillerie de Santos, ouverte aux visiteurs, présente la fabrication artisanale de cette liqueur selon une recette inchangée depuis trois générations. Les visiteurs peuvent participer à une dégustation commentée et emporter une bouteille du spiritueux fait maison.', 
    icon: '🍸' 
  },
]

export default function SantosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Santos</h1>
            <p className="text-stone-300">Le village où les pêcheurs rentrent au port et les vignobles descendent vers la mer</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Santos, officiellement Porto da Cruz, représente cette Madère que les brochures touristiques ne montrent jamais. Ce village de 2 000 âmes, blotti au fond d'une baie encaissée sur la côte est, vit toujours au rythme de la mer et de la terre avec une authenticité que peu d'endroits sur l'île ont conservée. Les maisons blanches aux volets bleus, les filets suspendus aux mâts des barques de pêche, et les terrasses de vignobles qui descendent vers la plage de sable noir composent un tableau d'une beauté sobre.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              L'activité portuaire demeure le cœur battant du village. Contrairement aux stations balnéaires de la côte sud où le tourisme a progressivement remplacé les activités traditionnelles, Santos continue de vivre de la pêche au thon et de la culture de la vigne. Chaque soir, les retours de pêche animent le port d'une énergie particulière : les femmes attendent sur le quai, les criées improvisées battent leur plein, et les tavernes du front de mer s'apprêtent à servir le poisson du jour grillé sur les braises.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pepites.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-10 bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-xl border border-amber-100">
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Le secret de Heldonica</h2>
            <p className="text-stone-700">Planifiez votre visite un vendredi soir : c'est le jour du marché hebdomadaire où les producteurs locaux vendent fruits, légumes, fromages et charcuteries. Restez pour le dîner à la tasca do Zé, ouverte uniquement le soir : la patronne, Dona Maria, prépare le thon grillé à la madeira selon une recette transmise par sa grand-mère. Le dessert, un bolo de melancia fait maison, justifie à lui seul le déplacement. Réservation indispensable.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}