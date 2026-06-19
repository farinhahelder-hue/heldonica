import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Medellín Colombie | Ville de l'éternelle primavera, guide slow travel | Heldonica",
    description: "Medellín, ville de l'éternelle printemps : métro câble, Comuna 13, Parque Lleras, jardins botaniques. Guide slow travel pour découvrir la transformation urbaine.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/colombie/medellin' },
  };
}

const pepites = [
  { 
    title: 'Le Métro Câble (Metrocable)', 
    description: 'Ce système de teleférico intégré au réseau de métro, inauguré en 2004, permet de monter dans les comunas perchées sur les collines. La ligne K, longue de 2,07 kilomètres, relie la station Acevedo aux barrios orientaux en 14 minutes. Depuis les cabines panoramiques, la vue sur les quartiers populaires étagés jusqu\'à l\'horizon offre un panorama saisissant de la géographie particulière de Medellín. Le trajet constitue une expérience incontournable pour comprendre la structure sociale de la ville.',
    icon: '🚡' 
  },
  { 
    title: 'Comuna 13', 
    description: 'Ce barrio du nord-ouest de Medellín, autrefois l\'une des zones les plus dangereuses du monde, incarne la transformation remarquable de la ville. Les escaliers mécaniques extérieurs de 385 mètres, inaugurés en 2011, ont facilité l\'accès aux quartiers pentus et réduit l\'isolement. Les murs couverts de graffitis colorés racontent l\'histoire de la comunidad à travers des fresques murales monumentales. Les visites guidées, menées par d\'anciens résidents reconvertis en guides touristiques, offrent un témoignage poignant sur le changement.',
    icon: '🏘️' 
  },
  { 
    title: 'Parque Lleras et El Poblado', 
    description: 'Le Parque Lleras, au cœur du quartier élégant d\'El Poblado, constitue le salon exterior de Medellín. Les restaurants branchés, les bars avec terrasses et les cafés sous les palmiers animent ce lieu de rencontre favori des locales et des expatriés. L\'architecture coloniale restaurée des maisons environnantes, avec leurs patios fleuris et leurs balcons de fer forgé, crée une atmosphère particulière. Les soirées au rythme de la salsa dans les clubs environnants prolongent l\'ambiance festive jusqu\'à l\'aube.',
    icon: '💃' 
  },
  { 
    title: 'Jardín Botánico et Parc Arví', 
    description: 'Le Jardín Botánico de Medellín, créé en 1972 sur 14 hectares, présente plus de 2 000 espèces de plantes tropicales. Le Butterfly Garden, le Orchidarium et le sentier interpretativo permettent de découvrir la biodiversité antioqueña. Le Parc Arví, accessible par le métro câble depuis la station Santo Domingo, s\'étend sur 1 200 hectares de forêt andine. Les marchés campesinas qui s\'y installent le week-end proposent des produits artisanaux et des aliments cultivés par les communautés paysannes environnantes.',
    icon: '🌿' 
  },
]

export default function MedellinPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Medellín</h1>
            <p className="text-stone-300">La ville de l'éternelle printemps qui a reinventé son destin</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Medellín, capitale du département d'Antioquia, occupe une vallée étroite encadrée par deux chaînes de la Cordillera Centrale. Sa situation géographique, à 1 500 mètres d'altitude, lui confère un climat subtropical de moyenne montagne particulièrement agréable, d'où son surnom de « ville de l'éternelle printemps ». Cette particularité climatique, combinée à la créativité de ses habitants et à leur capacité à transformer l'adversité en opportunité, fait de Medellín une destination unique en Amérique latine.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La ville a accompli en deux décennies une metamorphose remarquable. Les políticas publiques d'urbanisme social, initiées sous les mandats municipaux de Sergio Fajardo puis poursuivies par ses successeurs, ont transformé les espaces publics, connecté les quartiers isolés par des systèmes de transport inovadores et investi dans l'éducation. Le métrocable, les bibliothèques Parc, les écoles et les centres communautaires constituent les témoins concrets de cette renaissance urbaine qui inspire désormais les urbanistes du monde entier.
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
            <p className="text-stone-700">Pour comprendre vraiment Medellín, prenez le temps de descendre la carrera 37 à pied depuis El Poblado jusqu'au centre-ville. Ce parcours de 3 kilomètres traverse des quartiers aux réalités contrastées où se mêlent architecture moderne et constructions spontanées. Arrêtez-vous dans une tienda de quartier pour un tintico, ce café serré accompagné de panela râpée, et observez la vie locale. Le marché de la plaza de Flórez le dimanche matin offre une immersion totale dans la culture antioqueña avec ses chants de rancheras et ses danses traditionnelles.</p>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}