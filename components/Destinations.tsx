'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useContentLoader } from '@/hooks/useContentLoader'

interface Destination {
  destination_slug: string
  title: string
  custom_description?: string | null
  custom_image_url?: string | null
  hero_unsplash_url?: string | null
  tagline?: string | null
  flag_emoji?: string | null
}

// Fallback destinations for resilience
const FALLBACK_DESTINATIONS: Destination[] = [
  { 
    destination_slug: 'suisse', 
    title: 'Suisse', 
    custom_description: 'Slow travel alpin authentique',
    custom_image_url: 'https://images.unsplash.com/photo-1502786129236-63f2598fd7b9?w=600&q=80'
  },
  { 
    destination_slug: 'roumanie', 
    title: 'Roumanie', 
    custom_description: 'Nature sauvage Delta du Danube',
    custom_image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80'
  },
  { 
    destination_slug: 'ile-de-france', 
    title: 'Île-de-France', 
    custom_description: 'Paris alternatif & Petite Ceinture',
    custom_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80'
  },
  { 
    destination_slug: 'madere', 
    title: 'Madère', 
    custom_description: 'Randonnées volcaniques en couple',
    custom_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
  },
]

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>(FALLBACK_DESTINATIONS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { zones } = useContentLoader()

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch('/api/cms/home-destinations', { 
          cache: 'no-store' 
        })
        
        if (!res.ok) {
          throw new Error('Failed to fetch destinations')
        }

        const data = await res.json()
        
        if (data.success && data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations)
        }
        setError(null)
      } catch (err) {
        console.error('[Destinations] Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  // Get localized content from CMS zones
  const title = zones?.['destinations_title']?.value || 'Nos Pépites'
  const subtitle = zones?.['destinations_subtitle']?.value || 'Destinations slow travel'

  return (
    <section className="bg-cloud-dancer section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          {subtitle}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => {
            const imageUrl = dest.custom_image_url || dest.hero_unsplash_url
            const description = dest.custom_description || dest.tagline || ''
            
            return (
              <Link key={dest.destination_slug} href={`/destinations/${dest.destination_slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-stone-200 to-stone-300">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={dest.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {dest.flag_emoji && <span>{dest.flag_emoji}</span>}
                      <span className="text-white/90 text-sm font-medium">{dest.title}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-mahogany mb-2">{dest.title}</h3>
                  {description && <p className="text-gray-700 text-sm">{description}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
