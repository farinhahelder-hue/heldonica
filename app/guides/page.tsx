'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GuideDownloadButton from '@/components/GuideDownloadButton'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

type Guide = {
  destination_slug: string
  title: string
  subtitle: string | null
  cover_unsplash_url: string | null
}

const FALLBACK_GUIDES: Guide[] = [
  { destination_slug: 'madere', title: 'Guide de Madère', subtitle: 'Entre montagnes luxuriantes et océan', cover_unsplash_url: 'https://images.unsplash.com/photo-1593702288056-2c160f65cf12?w=1200&q=80' },
  { destination_slug: 'roumanie', title: 'Guide de Roumanie', subtitle: 'Carpates, monastères et villages authentiques', cover_unsplash_url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=1200&q=80' },
  { destination_slug: 'montenegro', title: 'Guide du Monténégro', subtitle: 'Montagnes, fjords et criques', cover_unsplash_url: 'https://images.unsplash.com/photo-1602153987248-d3e28629e7d6?w=1200&q=80' },
  { destination_slug: 'lisbonne', title: 'Guide de Lisbonne', subtitle: 'Collines, azulejos et fado', cover_unsplash_url: 'https://images.unsplash.com/photo-1585208798174-6cedc86e7f2c?w=1200&q=80' },
  { destination_slug: 'paris', title: 'Guide de Paris', subtitle: 'Adresses slow, balades secrètes et pépites', cover_unsplash_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80' },
  { destination_slug: 'sicile', title: 'Guide de Sicile', subtitle: 'Volcans, temples et street food', cover_unsplash_url: 'https://images.unsplash.com/photo-1565626424178-c699f6601afd?w=1200&q=80' },
]

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(FALLBACK_GUIDES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch('/api/cms/travel-guides')
        if (res.ok) {
          const data = await res.json()
          if (data.guides && data.guides.length > 0) {
            setGuides(data.guides)
          }
        }
      } catch {
        // Use fallback on error
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  return (
    <InlineEditProvider page="guides">
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        {/* Hero */}
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488085061387-422e29b4003a?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-eucalyptus/20 text-eucalyptus text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              <EditableZone page="guides" zone="hero_badge" fallback="Guides gratuits" />
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              <EditableZone page="guides" zone="hero_title" fallback="Nos guides de destination" />
            </h1>
            <EditableZone page="guides" zone="hero_text" type="textarea"
              fallback="Télécharge nos guides gratuits et partez avec nos meilleures adresses en poche. Des itinéraires testés, des secrets dénichés, et tout ce qu'on n'aurait jamais partagé sans ça."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto block"
            />
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <div key={guide.destination_slug} className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    {guide.cover_unsplash_url ? (
                      <img
                        src={guide.cover_unsplash_url}
                        alt={guide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-eucalyptus/20 to-mahogany/20 flex items-center justify-center">
                        <span className="text-4xl">🗺️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-serif font-bold text-white">{guide.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    {guide.subtitle && (
                      <p className="text-stone-600 text-sm mb-4 leading-relaxed">{guide.subtitle}</p>
                    )}
                    <GuideDownloadButton
                      slug={guide.destination_slug}
                      title={guide.title}
                      variant="default"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4">
              <EditableZone page="guides" zone="cta_title" fallback="Tu ne sais pas quelle destination choisir ?" />
            </h2>
            <p className="text-stone-600 leading-relaxed mb-8">
              <EditableZone page="guides" zone="cta_text" fallback="Décris-nous ton voyage idéal et on te prépare une proposition sur mesure. Gratuit, sans engagement, et avec une vraie réponse humaine."
                className="inline"
              />
            </p>
            <Link href="/travel-planning" className="inline-flex items-center gap-2 px-8 py-4 bg-eucalyptus hover:bg-eucalyptus/90 text-white rounded-full font-semibold text-sm transition">
              <EditableZone page="guides" zone="cta_button" fallback="Dis-nous où tu veux aller →" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
