import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Porto slow travel | Guide Heldonica',
  description: 'Guide Porto: vin de Porto, Ribeira, Douro.',
  robots: { index: false, follow: false },
}

const navLinks = [
  { label: 'Portugal', href: '/destinations/portugal' },
  { label: 'Madere', href: '/destinations/madere' },
]

const pepites = [
  { title: 'Ribeira', description: 'Quartier riverside, UNESCO.', icon: '🌉' },
  { title: 'Caves de Porto', description: 'Degustation vin de Porto.', icon: '🍷' },
  { title: 'Mercado do Bolhao', description: 'Marche couverts.', icon: '🍊' },
]

const faqPortoSchema = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Que faire a Porto?","acceptedAnswer":{"@type":"Answer","text":"Ribeira, pont Luis I, cave a vin."}},{"@type":"Question","name":"Ou loger Porto?","acceptedAnswer":{"@type":"Answer","text":"Centre historique, Ribeira."}},{"@type":"Question","name":"Transport Porto?","acceptedAnswer":{"@type":"Answer","text":"Metro depuis aeroport. Bus STCP."}}]}; export default function PortoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPortoSchema) }} /> <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Portugal</span>
            <h1 className="text-4xl text-white font-serif">Porto</h1>
            <p className="text-stone-300">Vin de Porto, Douro, et l Atlantique.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Porto, c'est le nord. Le vin, le fleuve, les couleurs.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            {pepites.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <div className="text-xl mb-2">{p.icon}</div>
                <h3 className="font-serif">{p.title}</h3>
                <p className="text-sm text-stone-600">{p.description}</p>
              </div>
            ))}
          </section>
          <Link href="/destinations/portugal" className="text-amber-700">← Retour Portugal</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}