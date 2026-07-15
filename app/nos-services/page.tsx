import type { Metadata } from 'next'
import Link from 'next/link'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import FaqSection from '@/components/FaqSection'
import { FAQJsonLd } from '@/components/JsonLd'
import { supabase } from '@/lib/supabase-client'

// Fallback FAQ questions for resilience
const FALLBACK_FAQ_QUESTIONS = [
  {
    question: 'Comment fonctionne le Travel Planning sur mesure ?',
    answer: "Tu nous décris ton voyage idéal via notre formulaire ou lors d'un échange. On analyse tes envies, tes contraintes et ton budget, puis on te prépare un carnet de route PDF complet avec itinéraire, hébergements, restaurants et conseils pratiques. Le tout en 7-10 jours.",
  },
  {
    question: 'Combien coûte un voyage sur mesure avec Heldonica ?',
    answer: "Le tarif du Travel Planning commence à 149€ pour un voyage de base. Le prix varie selon la complexité de l'itinéraire, la durée du voyage et le niveau de personnalisation. Chaque projet est unique, on te donne un chiffrage précis après notre échange découverte.",
  },
  {
    question: "Heldonica accompagne aussi les voyageurs en solo ?",
    answer: "Absolument. Le Travel Planning fonctionne pour tous les types de voyageurs : couples, solos, familles, groupes d'amis. Pour les voyageurs solo, on peut aussi te mettre en contact avec d'autres voyageurs ou te guider vers des expériences adaptées.",
  },
]

export const metadata: Metadata = {
  title: 'Services | Travel Planning sur mesure',
  description:
    "Découvrez les services Heldonica : Travel Planning sur mesure, carnets de voyage personnalisés en duo et guides slow travel de terrain pour vos escapades en couple.",
  keywords: [
    'travel planning',
    'voyage sur mesure',
    'slow travel',
    'heldonica',
    'carnets de voyage',
    'itineraire couple',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/nos-services',
  },
  openGraph: {
    title: 'Nos Services | Heldonica',
    description: "Des services de travel planning sur mesure et des guides de terrain pour les voyageurs en quête d'authenticité et de slow travel.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Nos Services',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

// Fetch FAQ from CMS zones
async function getFaqQuestions(): Promise<{ question: string; answer: string }[]> {
  try {
    // Fetch FAQ zones directly from Supabase using ilike pattern
    const { data: faqZones, error } = await supabase
      .from('cms_editable_zones')
      .select('zone, value')
      .eq('page', 'nos-services')
      .or('zone.ilike.faq_%')
      .eq('is_active', true)
    
    if (error) {
      console.error('[NosServices] Failed to fetch FAQ zones:', error)
      return FALLBACK_FAQ_QUESTIONS
    }
    
    if (!faqZones || faqZones.length === 0) {
      return FALLBACK_FAQ_QUESTIONS
    }
    
    // Organize zones into FAQ items
    const faqItems: { question: string; answer: string }[] = []
    
    // Group zones by FAQ number
    const faqMap = new Map<string, { question?: string; answer?: string }>()
    
    for (const zone of faqZones) {
      const match = zone.zone.match(/^faq_(\d+)_(question|answer)$/)
      if (match) {
        const num = match[1]
        const type = match[2]
        if (!faqMap.has(num)) {
          faqMap.set(num, {})
        }
        const item = faqMap.get(num)!
        if (type === 'question') {
          item.question = zone.value
        } else {
          item.answer = zone.value
        }
      }
    }
    
    // Build FAQ items array
    const sortedKeys = Array.from(faqMap.keys()).sort((a, b) => parseInt(a) - parseInt(b))
    
    for (const key of sortedKeys) {
      const item = faqMap.get(key)!
      if (item.question && item.answer) {
        faqItems.push({ question: item.question, answer: item.answer })
      }
    }
    
    if (faqItems.length === 0) {
      return FALLBACK_FAQ_QUESTIONS
    }
    
    return faqItems
  } catch (error) {
    console.error('[NosServices] Failed to fetch FAQ:', error)
    return FALLBACK_FAQ_QUESTIONS
  }
}

export default async function NosServicesPage() {
  const faqQuestions = await getFaqQuestions()

  return (
    <InlineEditProvider page="nos-services">
      <FAQJsonLd questions={faqQuestions} />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <EditableZone page="nos-services" zone="hero_image_url" type="image"
            fallback="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=70"
            className="absolute inset-0 opacity-20 w-full h-full object-cover"
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <EditableZone page="nos-services" zone="hero_badge" fallback="Ce qu'on propose"
              className="inline-block px-4 py-1.5 bg-eucalyptus/20 text-eucalyptus text-xs font-semibold rounded-full uppercase tracking-wider mb-6"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              <EditableZone page="nos-services" zone="hero_title_line1" fallback="Des services pensés pour"
                className="inline"
              />
              <br />
              <span className="text-eucalyptus">
                <EditableZone page="nos-services" zone="hero_title_line2" fallback="voyager autrement."
                  className="inline"
                />
              </span>
            </h1>
            <EditableZone page="nos-services" zone="hero_text" type="textarea" fallback="Du carnet de route sur mesure aux guides de terrain offerts, on t'accompagne pour créer un voyage qui te ressemble."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto block"
            />
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <EditableZone page="nos-services" zone="section_title" fallback="Nos expertises"
              className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center block"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Travel Planning */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">✈️</div>
                <EditableZone page="nos-services" zone="card_1_title" fallback="Travel Planning"
                  className="text-xl font-serif font-bold text-stone-900 mb-3 block"
                />
                <EditableZone page="nos-services" zone="card_1_text" type="textarea" fallback="On conçoit ton voyage sur mesure. Carnet de route PDF, hébergements triés sur le volet, pépites dénichées, support WhatsApp."
                  className="text-stone-600 leading-relaxed mb-6 block"
                />
                <EditableZone page="nos-services" zone="card_1_price" fallback="À partir de 149€"
                  className="text-eucalyptus font-semibold text-sm mb-4 block"
                />
                <Link href="/travel-planning" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors">
                  <EditableZone page="nos-services" zone="card_1_cta" fallback="Découvrir →" />
                </Link>
              </div>

              {/* Guides de Voyage */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">🎁</div>
                <EditableZone page="nos-services" zone="card_2_title" fallback="Guides & Cartes Offerts"
                  className="text-xl font-serif font-bold text-stone-900 mb-3 block"
                />
                <EditableZone page="nos-services" zone="card_2_text" type="textarea" fallback="Télécharge librement nos cartes de terrain interactives et nos guides top 10 pépites pour préparer tes escapades sereinement."
                  className="text-stone-600 leading-relaxed mb-6 block"
                />
                <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors">
                  <EditableZone page="nos-services" zone="card_2_cta" fallback="Découvrir les guides →" />
                </Link>
              </div>

              {/* Blog */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">📖</div>
                <EditableZone page="nos-services" zone="card_3_title" fallback="Carnets de Voyage"
                  className="text-xl font-serif font-bold text-stone-900 mb-3 block"
                />
                <EditableZone page="nos-services" zone="card_3_text" type="textarea" fallback="Des récits de voyage authentiques, des guides pratiques et des inspirations pour voyager à ton rythme. Sans filtre."
                  className="text-stone-600 leading-relaxed mb-6 block"
                />
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors">
                  <EditableZone page="nos-services" zone="card_3_cta" fallback="Lire le blog →" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section with accordion - from CMS */}
        <FaqSection
          items={faqQuestions}
          title="Tout ce que tu veux savoir"
          subtitle="Les questions qu'on nous pose le plus souvent"
        />

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <EditableZone page="nos-services" zone="cta_title" fallback="Prêt à voyager autrement ?"
              className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6 block"
            />
            <EditableZone page="nos-services" zone="cta_text" fallback="Dis-nous où tu veux aller. On s'occupe du reste."
              className="text-stone-600 mb-8 block"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/travel-planning#formulaire"
                className="px-8 py-4 bg-eucalyptus text-white font-semibold rounded-full hover:bg-eucalyptus/90 transition-colors"
              >
                <EditableZone page="nos-services" zone="cta_primary" fallback="Demander un voyage sur mesure →" />
              </Link>
              <Link
                href="/blog"
                className="px-8 py-4 bg-stone-100 text-stone-900 font-semibold rounded-full hover:bg-stone-200 transition-colors"
              >
                <EditableZone page="nos-services" zone="cta_secondary" fallback="Consulter nos carnets →" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </InlineEditProvider>
  )
}
