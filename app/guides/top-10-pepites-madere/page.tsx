import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import NewsletterPopup from '@/components/NewsletterPopup'
import GuideDownloadForm from '@/components/GuideDownloadForm'
import DestinationMapEmbed from '@/components/DestinationMapEmbed'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import EditableZone from '@/components/inline-edit/EditableZone'
import { createServiceClient } from '@/lib/supabase'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 86400

const PAGE = 'top-10-pepites-madere'

// ─── Métadonnées SEO dynamiques (depuis site_settings si dispo) ──────────────
const metadata: Metadata = {
  title: 'Guide Top 10 Pépites Madère | Heldonica',
  description:
    "Télécharge notre guide des 10 meilleures adresses testées à Madère. Restaurants, sentiers, coins photo — tout ce qu'on a aimé et qu'on te recommande.",
  keywords: [
    'guide Madère',
    'pépites Madère',
    'adresses Madère',
    'restaurants Madère',
    'sentiers Madère',
    'slow travel Madère',
    'Heldonica',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/guides/top-10-pepites-madere',
  },
  openGraph: {
    title: 'Guide Top 10 Pépites Madère | Heldonica',
    description: '10 meilleures adresses testées à Madère. Télécharge gratuitement le guide.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Guide Top 10 Pépites Madère',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('guides-top-10-pepites-madere', metadata)
}

interface GuideItemRow {
  rank: number
  title: string
  type: string
  description: string
  secret: string | null
  image_url: string | null
}

// ─── Fetch Supabase avec repli terrain vérifié ────────────────────────────────
async function getGuideItems(): Promise<Map<number, GuideItemRow>> {
  const map = new Map<number, GuideItemRow>()
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_guide_items')
      .select('rank, title, type, description, secret, image_url')
      .eq('guide_slug', 'top-10-pepites-madere')
      .eq('is_active', true)
      .order('rank', { ascending: true })

    if (!error && data) {
      for (const row of data) {
        map.set(row.rank, row)
      }
    }
  } catch {
    // Repli silencieux sur les fiches vérifiées du Coffre des Savoirs
  }
  return map
}

// ─── Fetch image hero depuis CMS zones ────────────────────────────────────────
async function getHeroImage() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('value')
      .eq('page', 'top-10-pepites-madere')
      .eq('zone_key', 'hero_bg_image')
      .eq('is_active', true)
      .maybeSingle()
    if (error) return '/og-default.jpg'
    return data?.value || '/og-default.jpg'
  } catch {
    return '/og-default.jpg'
  }
}

export default async function Top10PepitesMaderePage() {
  const zones = await getPageZones(PAGE)

  const [dbItems, heroImage] = await Promise.all([
    getGuideItems(),
    getHeroImage(),
  ])

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html',
    fallback: string,
    className?: string,
    as?: any
  ) => (
    <EditableZone
      page={PAGE}
      zone={zone}
      type={type}
      fallback={fallback}
      className={className}
      as={as}
    />
  )

  const verifiedItems = [
    {
      rank: 1,
      image: dbItems.get(1)?.image_url || '/og-default.jpg',
      typeNode: Z(
        'pepite_1_type',
        'text',
        dbItems.get(1)?.type || 'Forêt primaire UNESCO',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_1_title',
        'text',
        dbItems.get(1)?.title || 'Forêt de Fanal (Paul da Serra, 1 150 m)',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_1_desc',
        'textarea',
        dbItems.get(1)?.description ||
          "Des lauriers centenaires (Ocotea foetens) tordus par les alizés au-dessus du plateau de Paul da Serra. Quand la brume atlantique traverse les clairières vers 10h, le silence est complet.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_1_secret',
        'textarea',
        dbItems.get(1)?.secret ||
          "Monte par l'ER209 dès le matin et éloigne-toi de 300 mètres du parking principal : les plus beaux troncs moussus se trouvent sur le versant nord.",
        undefined,
        'span'
      ),
    },
    {
      rank: 2,
      image: dbItems.get(2)?.image_url || '/og-default.jpg',
      typeNode: Z(
        'pepite_2_type',
        'text',
        dbItems.get(2)?.type || 'Fajã volcanique & Téléphérique',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_2_title',
        'text',
        dbItems.get(2)?.title || "Fajã da Quebrada Nova (Achadas da Cruz)",
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_2_desc',
        'textarea',
        dbItems.get(2)?.description ||
          "Un téléphérique agricole à 98 % d'inclinaison plonge sur 450 mètres de falaise basaltique jusqu'à une langue de terre cultivée au ras du ressac atlantique, sans aucune voiture en bas.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_2_secret',
        'textarea',
        dbItems.get(2)?.secret ||
          "Présente-toi à l'ouverture de la cabine à 8h00 (billet aller-retour à 3 € en espèces) et vérifie l'absence de vent fort avant de rouler jusqu'au promontoire.",
        undefined,
        'span'
      ),
    },
    {
      rank: 3,
      image: dbItems.get(3)?.image_url || '/og-default.jpg',
      typeNode: Z(
        'pepite_3_type',
        'text',
        dbItems.get(3)?.type || 'Vasques de basalte & Baignade',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_3_title',
        'text',
        dbItems.get(3)?.title || 'Vasques volcaniques de Cachalote et Seixal',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_3_desc',
        'textarea',
        dbItems.get(3)?.description ||
          "La houle du nord-ouest franchit les digues naturelles de lave noire pour renouveler l'eau salée des bassins à chaque marée haute, face à l'îlot volcanique de Mole.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_3_secret',
        'textarea',
        dbItems.get(3)?.secret ||
          "Évite le complexe bétonné payant en milieu de journée : privilégie les vasques brutes gratuites de Cachalote avant 9h30 ou la plage de sable noir volcanique du Porto do Seixal.",
        undefined,
        'span'
      ),
    },
    {
      rank: 4,
      image: dbItems.get(4)?.image_url || '/images/destinations/madere/itinerary/etape4_funchal_bananeraies.jpg',
      typeNode: Z(
        'pepite_4_type',
        'text',
        dbItems.get(4)?.type || 'Table de pêcheur à Funchal',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_4_title',
        'text',
        dbItems.get(4)?.title || 'Restaurant O Galo dans la Zona Velha',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_4_desc',
        'textarea',
        dbItems.get(4)?.description ||
          "Dans les ruelles pavées de la vieille ville de Funchal, cette table familiale fonctionne sans carte imprimée : le patron présente directement la pêche du matin et les légumes de son potager de montagne.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_4_secret',
        'textarea',
        dbItems.get(4)?.secret ||
          "Compte 25 à 30 € par personne avec un vin blanc sec de Madère et laisse le patron de quarante ans de métier te conseiller le poisson grillé du jour.",
        undefined,
        'span'
      ),
    },
    {
      rank: 5,
      image: dbItems.get(5)?.image_url || '/og-default.jpg',
      typeNode: Z(
        'pepite_5_type',
        'text',
        dbItems.get(5)?.type || 'Crête alpine & Randonnée PR9',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_5_title',
        'text',
        dbItems.get(5)?.title || 'Pico do Arieiro (1 818 m) & Levada do Caldeirão Verde',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_5_desc',
        'textarea',
        dbItems.get(5)?.description ||
          "L'aube au-dessus de la mer de nuages au Pico do Arieiro, suivie de la marche sous tunnel végétal le long du canal de la Levada do Caldeirão Verde (PR9) où l'eau ruisselle sur le basalte.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_5_secret',
        'textarea',
        dbItems.get(5)?.secret ||
          "Fais le Caldeirão Verde un mardi matin à l'aube avec une lampe frontale et réserve ta taxe d'accès régionale (4,50 € via Simplifica) la veille.",
        undefined,
        'span'
      ),
    },
    {
      rank: 6,
      image: dbItems.get(6)?.image_url || '/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg',
      typeNode: Z(
        'pepite_6_type',
        'text',
        dbItems.get(6)?.type || 'Cave & Poncha traditionnelle',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_6_title',
        'text',
        dbItems.get(6)?.title || 'Câmara de Lobos : poncha au caralhinho & vins de Madère',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_6_desc',
        'textarea',
        dbItems.get(6)?.description ||
          "Le port d'attache des barques colorées xavelhas qui pêchent l'espada preta de nuit, et le berceau historique de la poncha battue à l'aguardente de canne, miel et citron.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_6_secret',
        'textarea',
        dbItems.get(6)?.secret ||
          "Pousse la porte d'une cave viticole du bourg pour la dégustation commentée de 6 vins de Madère (Sercial, Verdelho, Bual, Malmsey) à 5 €.",
        undefined,
        'span'
      ),
    },
    {
      rank: 7,
      image: dbItems.get(7)?.image_url || '/og-default.jpg',
      typeNode: Z(
        'pepite_7_type',
        'text',
        dbItems.get(7)?.type || 'Jetée basaltique & Heure dorée',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_7_title',
        'text',
        dbItems.get(7)?.title || 'Vieux pont de pierre de Ponta do Sol & Anjos',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_7_desc',
        'textarea',
        dbItems.get(7)?.description ||
          "Encaissée entre deux parois basaltiques sur la côte sud, la vieille jetée de Ponta do Sol capte la lumière rasante de fin d'après-midi face à la houle atlantique.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_7_secret',
        'textarea',
        dbItems.get(7)?.secret ||
          "Gare-toi au parking amont avant le tunnel routier dès 17h30 pour descendre à pied sur l'arche de pierre et commander un bolo do caco chaud au beurre d'ail.",
        undefined,
        'span'
      ),
    },
    {
      rank: 8,
      image: dbItems.get(8)?.image_url || '/images/destinations/madere/itinerary/etape5_monte_flore.jpg',
      typeNode: Z(
        'pepite_8_type',
        'text',
        dbItems.get(8)?.type || 'Belvédère en forêt & Truites',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_8_title',
        'text',
        dbItems.get(8)?.title || 'Ribeiro Frio & Vereda dos Balcões (PR11)',
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_8_desc',
        'textarea',
        dbItems.get(8)?.description ||
          "À 860 mètres d'altitude dans la vallée fraîche de Ribeiro Frio, un sentier plat de 1,5 km le long de la Levada da Serra mène à un promontoire rocheux ouvert sur toute la chaîne centrale.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_8_secret',
        'textarea',
        dbItems.get(8)?.secret ||
          "Arrive à 8h00 avant que les nuages d'alizés ne remontent de la côte nord vers 10h30 : les pinsons endémiques de Madère (Fringilla maderensis) se posent sur le parapet.",
        undefined,
        'span'
      ),
    },
    {
      rank: 9,
      image: dbItems.get(9)?.image_url || '/images/destinations/madere/itinerary/etape3_terroir_canico.jpg',
      typeNode: Z(
        'pepite_9_type',
        'text',
        dbItems.get(9)?.type || 'Terroir & Braises de vigne',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_9_title',
        'text',
        dbItems.get(9)?.title || "Estreito de Câmara de Lobos : l'espetada sur branche de laurier",
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_9_desc',
        'textarea',
        dbItems.get(9)?.description ||
          "Entre 400 et 600 mètres d'altitude au milieu des vignes en treilles basses (latadas), les grillardins d'Estreito saisissent le bœuf frotté à l'ail et au gros sel sur une branche de laurier vert.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_9_secret',
        'textarea',
        dbItems.get(9)?.secret ||
          "Accompagne la brochette de cubes de polenta dorés au saindoux (milho frito) après une marche tranquille sur la Levada do Norte.",
        undefined,
        'span'
      ),
    },
    {
      rank: 10,
      image: dbItems.get(10)?.image_url || '/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg',
      typeNode: Z(
        'pepite_10_type',
        'text',
        dbItems.get(10)?.type || 'Village de montagne & Miel de canne',
        undefined,
        'span'
      ),
      titleNode: Z(
        'pepite_10_title',
        'text',
        dbItems.get(10)?.title || "Faial & Santo da Serra : cafés de village et marché du dimanche",
        undefined,
        'span'
      ),
      descNode: Z(
        'pepite_10_desc',
        'textarea',
        dbItems.get(10)?.description ||
          "Au pied du piton basaltique du Penha d'Águia (590 m) à Faial ou sur le plateau boisé de Santo da Serra (700 m), on retrouve la vie agricole insulaire loin des hôtels côtiers.",
        undefined,
        'span'
      ),
      secretNode: Z(
        'pepite_10_secret',
        'textarea',
        dbItems.get(10)?.secret ||
          "Le dimanche matin à Santo da Serra, goûte un Prego no Bolo do Caco avec un verre de cidre fermier (sidra da Madeira) sous les bâches des producteurs.",
        undefined,
        'span'
      ),
    },
  ]

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              <EditableZone page="top-10-pepites-madere" zone="hero_badge" fallback="Guide gratuit" />
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              <EditableZone
                page="top-10-pepites-madere"
                zone="hero_title_line1"
                fallback="Top 10 Pépites"
                className="inline"
              />
              <br />
              <span className="text-amber-400">
                <EditableZone
                  page="top-10-pepites-madere"
                  zone="hero_title_line2"
                  fallback="à Madère"
                  className="inline"
                />
              </span>
            </h1>
            <EditableZone
              page="top-10-pepites-madere"
              zone="hero_text"
              type="textarea"
              fallback="Ce qu'on a testé, aimé, et qu'on te recommande sans hésiter. Restaurants de pêcheurs, levadas, fajãs volcaniques et belvédères — tout ce qu'on aurait aimé savoir avant d'y aller."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 block"
            />

            <div className="bg-[#FAF7F2]/5 backdrop-blur-sm rounded-sm p-6 md:p-8 border border-white/10 max-w-md mx-auto">
              <EditableZone
                page="top-10-pepites-madere"
                zone="hero_download_label"
                fallback="Télécharge gratuitement"
                className="text-amber-400 font-semibold mb-3 block"
              />
              <GuideDownloadForm variant="hero" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-[#FAF7F2]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center">
              <EditableZone
                page="top-10-pepites-madere"
                zone="intro_title"
                fallback="On a arpenté Madère du nord au sud. Voici ce qu'on en a retiré."
                className="inline"
              />
            </h2>
            <EditableZone
              page="top-10-pepites-madere"
              zone="intro_text"
              type="textarea"
              fallback="Madère est l'inverse du tourisme de masse quand on accepte de se lever tôt et de quitter la voie rapide. Ce sont des routes qui serpentent dans la forêt primaire de Laurisilva, des fajãs au pied des falaises basaltiques et des tables où le patron te présente la pêche du matin sans carte imprimée."
              className="text-stone-600 leading-relaxed text-lg block"
            />
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-10 text-center">
              <EditableZone page="top-10-pepites-madere" zone="list_title" fallback="Les 10 pépites" />
            </h2>

            <div className="space-y-6">
              {verifiedItems.map((pep) => (
                <div
                  key={pep.rank}
                  className="bg-[#FAF7F2] rounded-sm p-6 md:p-8 border border-stone-100 transition-shadow"
                >
                  <div className="flex items-start gap-5">
                    {pep.image ? (
                      <img
                        src={pep.image}
                        alt=""
                        className="flex-shrink-0 w-20 h-20 rounded-sm object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex-shrink-0 w-14 h-14 bg-amber-100 rounded-sm flex items-center justify-center text-2xl font-bold text-amber-800">
                        {pep.rank}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold text-eucalyptus uppercase tracking-wider">
                          {pep.typeNode}
                        </span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 rounded-full px-2 py-0.5">
                          #{pep.rank}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                        {pep.titleNode}
                      </h3>
                      <p className="text-stone-600 leading-relaxed mb-4">{pep.descNode}</p>
                      <div className="bg-amber-50 rounded-sm p-4 border-l-4 border-amber-400">
                        <p className="text-sm">
                          <span className="font-semibold text-amber-800">
                            {Z('secret_label', 'text', 'Repère terrain :', undefined, 'span')}
                          </span>{' '}
                          <span className="text-stone-700">{pep.secretNode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-[#FAF7F2]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4 text-center">
              <EditableZone
                page="top-10-pepites-madere"
                zone="map_title"
                fallback="Situe les pépites sur la carte"
              />
            </h2>
            <EditableZone
              page="top-10-pepites-madere"
              zone="map_text"
              type="textarea"
              fallback="Madère fait 57 km de long, et pourtant il faut compter 1h30 pour traverser du sud au nord par les cols. Repère les distances avant de caler ton programme."
              className="text-stone-600 leading-relaxed text-center max-w-2xl mx-auto mb-8 block"
            />
            <DestinationMapEmbed
              query="Madère, Portugal"
              label={zones['top-10-pepites-madere__map_label'] ?? 'Madère'}
              destination="madere"
            />
          </div>
        </section>

        <section className="py-16 md:py-20 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <EditableZone
              page="top-10-pepites-madere"
              zone="cta_title"
              fallback="Tu pars à Madère ?"
              className="text-2xl md:text-3xl font-serif font-bold mb-4 block"
            />
            <EditableZone
              page="top-10-pepites-madere"
              zone="cta_text"
              fallback="Le guide complet avec toutes les adresses, les cartes et les repères horaires pour éviter la foule. Gratuit."
              className="text-stone-400 leading-relaxed mb-8 block"
            />
            <GuideDownloadForm variant="inline" />
            <EditableZone
              page="top-10-pepites-madere"
              zone="cta_footnote"
              fallback="10 pages, PDF, sans engagement."
              className="text-stone-500 text-sm mt-4 block"
            />
          </div>
        </section>

        <section className="py-16 md:py-20 bg-[#FAF7F2]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">
              <EditableZone
                page="top-10-pepites-madere"
                zone="related_title"
                fallback="Continue à explorer"
              />
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/destinations/madere"
                className="bg-[#F7F3EC] rounded-sm p-6 border border-stone-100 transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  <EditableZone
                    page="top-10-pepites-madere"
                    zone="related_1_title"
                    fallback="Guide complet Madère"
                  />
                </h3>
                <EditableZone
                  page="top-10-pepites-madere"
                  zone="related_1_desc"
                  fallback="Tout ce qu'il faut savoir pour préparer ton voyage."
                  className="text-sm text-stone-500 block"
                />
              </Link>
              <Link
                href="/blog"
                className="bg-[#F7F3EC] rounded-sm p-6 border border-stone-100 transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  <EditableZone
                    page="top-10-pepites-madere"
                    zone="related_2_title"
                    fallback="Carnets de voyage"
                  />
                </h3>
                <EditableZone
                  page="top-10-pepites-madere"
                  zone="related_2_desc"
                  fallback="Nos récits depuis le terrain, destinations réelles."
                  className="text-sm text-stone-500 block"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <NewsletterPopup />
    </InlineEditProvider>
  )
}
