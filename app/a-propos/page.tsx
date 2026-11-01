import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import Image from 'next/image'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { getCmsOrSetting } from '@/lib/content-loader'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getAllPosts } from '@/lib/blog-supabase'
import { buildPageMetadata } from '@/lib/page-metadata'
import { Footprints, Feather, PenTool, BookOpen, Map, Gift } from 'lucide-react'

const metadata: Metadata = {
  title: 'À propos | Heldonica',
  description:
    "Le duo derrière Heldonica. Notre histoire, notre philosophie du slow travel et pourquoi on conçoit des voyages sur mesure.",
  keywords: [
    'heldonica',
    'slow travel',
    'à propos',
    'duo voyage',
    'travel planner',
    'voyage authentique',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/a-propos',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/a-propos',
    title: 'À propos | Heldonica',
    description: "Le duo derrière Heldonica. Notre histoire et notre philosophie du slow travel.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow travel en couple',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos | Heldonica',
    description: "Le duo derrière Heldonica. Notre histoire et notre philosophie du slow travel.",
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('a-propos', metadata)
}

export const revalidate = 86400

export default async function AProposPage() {
  const zones = await getPageZones('a-propos')

  const posts = await getAllPosts().catch(() => [])
  const carnetCount = posts.length

  const Z = (
    zone: string,
    fallback: string,
    as?: any,
    className?: string,
    type?: 'text' | 'textarea' | 'html' | 'image'
  ) => (
    <EditableZone
      page="a-propos"
      zone={zone}
      fallback={fallback}
      as={as}
      className={className}
      type={type}
    />
  )

  return (
    <InlineEditProvider page="a-propos" initialZones={zones}>
      <Header />
      <Breadcrumb />
      <main className="min-h-screen">
        
        {/* ── HERO ── */}
        <section className="relative bg-[#241D1A] text-[#F7F3EC] py-24 md:py-32 overflow-hidden border-b border-[#DED5C6]">
          <EditableZone page="a-propos" zone="hero_image_url" type="image" fallback=""
            className="absolute inset-0 opacity-15 w-full h-full object-cover"
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-tight mb-6">
              <EditableZone page="a-propos" zone="hero_title_1" fallback="On n'est pas des guides." className="inline" />
              <br />
              <span className="italic text-[#E6DEC8]">
                <EditableZone page="a-propos" zone="hero_title_2" fallback="On est des voyageurs." className="inline" />
              </span>
            </h1>
            <EditableZone page="a-propos" zone="hero_text" type="textarea" fallback="Un duo qui a tout quitté pour voyager vrai. Et qui t'aide à en faire autant."
              className="text-[#E6DEC8]/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto block"
            />
          </div>
        </section>

        {/* ── NOTRE HISTOIRE ── */}
        <section className="py-20 md:py-28 bg-[#F7F3EC] border-b border-[#E2D9C8]">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_story_badge" fallback="Notre histoire"
              className="text-eucalyptus text-[11px] font-medium tracking-[0.22em] uppercase mb-4 block"
            />
            <EditableZone page="a-propos" zone="section_story_title" fallback="D'où on vient"
              className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-8 block"
            />
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              <div className="space-y-5">
                <EditableZone page="a-propos" zone="bio_text_1" type="textarea" fallback="Heldonica est né d'une frustration simple : après Madère, on s'est rendu compte qu'on avait passé plus de temps à planifier notre voyage qu'à le vivre. Et qu'avec les bonnes adresses et le bon rythme, tout aurait été différent."
                  className="text-charcoal/75 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_2" type="textarea" fallback="L'un est né sur une île au milieu de l'Atlantique, entre levadas et océan. Ses racines insulaires lui ont donné le goût des sentiers qui ne figurent sur aucune carte et des tables familiales dont seuls les locaux connaissent le nom. L'autre a grandi entre deux pays, deux langues, la route comme réflexe naturel. Elle apporte au duo un œil éditorial — l'adresse qui raconte quelque chose, le détail qui fait la différence entre un bon voyage et un voyage dont on parle encore."
                  className="text-charcoal/75 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_3" type="textarea" fallback="Le voyage le plus précieux n'est pas celui qu'on voit sur Instagram. C'est celui où tu te perds un peu. Où tu reviens avec une adresse que personne dans ton entourage ne connaît. Où tu sais exactement combien de temps il faut marcher pour trouver la meilleure terrasse de la ville."
                  className="text-charcoal/75 leading-relaxed block"
                />
                <EditableZone page="a-propos" zone="bio_text_4" type="textarea" fallback="Le slow travel, ce n'est pas une stratégie. C'est une évidence. Quand on voyage autrement, on vit autrement. On choisit qualité sur quantité. On revient moins fatigué qu'avant de partir."
                  className="text-charcoal/75 leading-relaxed block"
                />
                <div className="pt-6 border-t border-[#DED5C6]/60 flex items-center gap-4">
                  <Image
                    src="/images/branding/logo-seal-transparent.png"
                    alt={getCmsOrSetting('seal_alt', '', 'Sceau officiel Heldonica')}
                    width={80}
                    height={80}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-90 flex-shrink-0"
                  />
                  <div>
                    {Z('seal_quote', '« Deux regards. Un seul terrain. »', 'p', 'font-serif italic text-mahogany text-base md:text-lg')}
                    {Z('seal_author', 'Le duo fondateur', 'p', 'text-xs uppercase tracking-[0.16em] text-charcoal/60 mt-0.5')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#EFE9DF] rounded-sm p-6 border border-[#DED5C6] text-center">
                  <EditableZone page="a-propos" zone="stat_1_value" fallback="7+"
                    className="text-4xl md:text-5xl font-serif font-normal text-mahogany mb-1 block"
                  />
                  <EditableZone page="a-propos" zone="stat_1_label" fallback="Pays habités"
                    className="text-charcoal/60 text-[11px] uppercase tracking-[0.16em] block"
                  />
                </div>
                <div className="bg-[#EFE9DF] rounded-sm p-6 border border-[#DED5C6] text-center">
                  <EditableZone page="a-propos" zone="stat_2_value" fallback={`${carnetCount}`}
                    className="text-4xl md:text-5xl font-serif font-normal text-mahogany mb-1 block"
                  />
                  <EditableZone page="a-propos" zone="stat_2_label" fallback="Carnets publiés"
                    className="text-charcoal/60 text-[11px] uppercase tracking-[0.16em] block"
                  />
                </div>
                <div className="bg-[#EFE9DF] rounded-sm p-6 border border-[#DED5C6] text-center">
                  <EditableZone page="a-propos" zone="stat_3_value" fallback="4"
                    className="text-4xl md:text-5xl font-serif font-normal text-mahogany mb-1 block"
                  />
                  <EditableZone page="a-propos" zone="stat_3_label" fallback="Langues parlées dans ce duo"
                    className="text-charcoal/60 text-[11px] uppercase tracking-[0.16em] block"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOTRE PHILOSOPHIE ── */}
        <section className="py-20 md:py-28 bg-[#EFE9DF] border-b border-[#E2D9C8]">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_philo_badge" fallback="Notre philosophie"
              className="text-eucalyptus text-[11px] font-medium tracking-[0.22em] uppercase mb-4 text-center block"
            />
            <EditableZone page="a-propos" zone="section_philo_title" fallback="Trois piliers qu'on ne négocie pas"
              className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-12 text-center block"
            />
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-8 border border-[#DED5C6]">
                <Footprints aria-hidden="true" strokeWidth={1.25} className="w-8 h-8 text-eucalyptus mb-5" />
                <EditableZone page="a-propos" zone="pillar_1_title" fallback="Lent, pas lazy"
                  className="text-xl font-serif font-normal text-mahogany mb-3 block"
                />
                <EditableZone page="a-propos" zone="pillar_1_text" type="textarea" fallback="Ralentir pour mieux voir. Prendre le temps de comprendre un quartier, une culture, une cuisine. Le voyage qui compte vraiment demande de la présence, pas une liste à cocher."
                  className="text-charcoal/70 text-sm leading-relaxed block"
                />
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-8 border border-[#DED5C6]">
                <Feather aria-hidden="true" strokeWidth={1.25} className="w-8 h-8 text-eucalyptus mb-5" />
                <EditableZone page="a-propos" zone="pillar_2_title" fallback="Vrai, pas parfait"
                  className="text-xl font-serif font-normal text-mahogany mb-3 block"
                />
                <EditableZone page="a-propos" zone="pillar_2_text" type="textarea" fallback="Le voyage qu'on te raconte, on l'a vécu. Les adresses où le patron te reconnaît, les sentiers qui n'existent sur aucune carte, les erreurs qui deviennent des histoires qu'on garde."
                  className="text-charcoal/70 text-sm leading-relaxed block"
                />
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-8 border border-[#DED5C6]">
                <PenTool aria-hidden="true" strokeWidth={1.25} className="w-8 h-8 text-eucalyptus mb-5" />
                <EditableZone page="a-propos" zone="pillar_3_title" fallback="Sur mesure, pas en série"
                  className="text-xl font-serif font-normal text-mahogany mb-3 block"
                />
                <EditableZone page="a-propos" zone="pillar_3_text" type="textarea" fallback="On ne vend pas des destinations. On conçoit des expériences. Chaque voyage est construit avec toi — tes envies, ton rythme, tes contraintes. Pas un copier-coller."
                  className="text-charcoal/70 text-sm leading-relaxed block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CE QU'ON FAIT CONCRÈTEMENT ── */}
        <section className="py-20 md:py-28 bg-[#F7F3EC] border-b border-[#E2D9C8]">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <EditableZone page="a-propos" zone="section_services_badge" fallback="Ce qu'on fait"
              className="text-eucalyptus text-[11px] font-medium tracking-[0.22em] uppercase mb-4 text-center block"
            />
            <EditableZone page="a-propos" zone="section_services_title" fallback="Concrètement, on fait quoi ?"
              className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-12 text-center block"
            />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#EFE9DF] rounded-sm p-8 border border-[#DED5C6]">
                <BookOpen aria-hidden="true" strokeWidth={1.25} className="w-7 h-7 text-eucalyptus mb-5" />
                <EditableZone page="a-propos" zone="service_1_title" fallback="Blog & Carnets"
                  className="text-xl font-serif font-normal text-mahogany mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_1_text" type="textarea" fallback="On documente ce qu'on vit vraiment. Pas des listes copiées d'internet, des récits avec les erreurs, les surprises, le vrai — ce qu'on te cache ailleurs."
                  className="text-charcoal/70 leading-relaxed mb-6 block"
                />
                <Link href="/blog" className="inline-block text-xs uppercase tracking-[0.16em] text-mahogany border-b border-mahogany/40 pb-0.5 font-medium hover:text-eucalyptus hover:border-eucalyptus transition-colors">
                  <EditableZone page="a-propos" zone="service_1_cta" fallback="Lire les carnets" />
                </Link>
              </div>

              <div className="bg-[#2A1D18] text-[#F7F3EC] rounded-sm p-8">
                <Map aria-hidden="true" strokeWidth={1.25} className="w-7 h-7 text-[#E6DEC8] mb-5" />
                <EditableZone page="a-propos" zone="service_2_title" fallback="Travel Planning"
                  className="text-xl font-serif font-normal mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_2_text" type="textarea" fallback="On conçoit ton voyage sur mesure. Un brief, un échange humain, un carnet de route pensé pour toi — avec les adresses qu'on a vraiment testées."
                  className="text-[#E6DEC8]/75 leading-relaxed mb-6 block"
                />
                <Link href="/travel-planning" className="inline-block text-xs uppercase tracking-[0.16em] text-[#E6DEC8] border-b border-[#E6DEC8]/40 pb-0.5 font-medium hover:text-[#F7F3EC] hover:border-[#F7F3EC] transition-colors">
                  <EditableZone page="a-propos" zone="service_2_cta" fallback="Concevoir mon voyage" />
                </Link>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-8 border border-[#DED5C6]">
                <Gift aria-hidden="true" strokeWidth={1.25} className="w-7 h-7 text-eucalyptus mb-5" />
                <EditableZone page="a-propos" zone="service_3_title" fallback="Guides & Pépites Offerts"
                  className="text-xl font-serif font-normal text-mahogany mb-4 block"
                />
                <EditableZone page="a-propos" zone="service_3_text" type="textarea" fallback="On partage gratuitement nos cartes interactives de terrain, nos checklists de voyage et nos guides de voyage thématiques pour t'aider à partir sereinement."
                  className="text-charcoal/70 leading-relaxed mb-6 block"
                />
                <Link href="/destinations" className="inline-block text-xs uppercase tracking-[0.16em] text-mahogany border-b border-mahogany/40 pb-0.5 font-medium hover:text-eucalyptus hover:border-eucalyptus transition-colors">
                  <EditableZone page="a-propos" zone="service_3_cta" fallback="Découvrir les guides" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÉASSURANCE FINALE ── */}
        <section className="py-20 md:py-28 bg-[#EFE9DF] border-t border-[#E2D9C8]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <blockquote className="text-2xl md:text-3xl font-serif font-normal text-mahogany leading-relaxed mb-8">
              <EditableZone page="a-propos" zone="quote_text" type="textarea" fallback="« On n'a pas de témoignages clients. On a des années de route, des carnets remplis d'adresses dénichées, et une méthode éprouvée sur le terrain. C'est nos preuves. »" className="inline" />
            </blockquote>
            <p className="text-charcoal/60 text-sm">
              <EditableZone page="a-propos" zone="footer_contact_prefix" fallback="Des questions ? Écris-nous à" className="inline" />{' '}
              <a href="mailto:contact@heldonica.fr" className="text-mahogany hover:underline font-medium">
                <EditableZone page="a-propos" zone="footer_contact_email" fallback="contact@heldonica.fr" className="inline" />
              </a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </InlineEditProvider>
  )
}
