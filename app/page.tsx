import { getSetting, getAllPosts, formatDate, BlogPost } from '@/lib/blog-supabase'
import HomeClient from '@/components/HomeClient'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Heldonica — Slow travel vécu en duo, conçu pour toi',
  description:
    'Un duo Paris-Madère-Roumanie qui voyage lentement, documente vraiment et partage ce qu\'il a vécu — pas ce qu\'il a lu ailleurs.',
  keywords: [
    'slow travel couple',
    'travel planning sur mesure',
    'voyage hors sentiers battus',
    'blog voyage écoresponsable',
    'Madère',
    'heldonica',
  ],
  openGraph: {
    title: 'Heldonica — Slow travel vécu en duo, conçu pour toi',
    description:
      'On ferme les ordis. On part. On revient avec des pépites qu\'on n\'avait pas cherchées.',
    url: 'https://www.heldonica.fr',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://www.heldonica.fr/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow travel vécu en duo, conçu pour toi',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heldonica — Slow travel vécu en duo, conçu pour toi',
    description:
      'Carnets terrain, pépites vécues et voyages sur mesure pour couples, solos, familles ou amis.',
    images: ['https://www.heldonica.fr/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.heldonica.fr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

function calcReadTime(content: string | null): number {
  if (!content) return 0
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatPosts(posts: BlogPost[]) {
  return posts.map((post) => ({
    ...post,
    formattedDate: formatDate(post.published_at),
    readTime: post.read_time ?? calcReadTime(post.content),
  }))
}

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.heldonica.fr/#organization',
  name: 'Heldonica',
  url: 'https://www.heldonica.fr',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.heldonica.fr/logo.png',
    width: 200,
    height: 60,
  },
  description:
    'Blog slow travel vécu en duo et service de travel planning sur mesure écoresponsable. On voyage lentement, on teste vraiment, on partage ce qui tient sur le terrain.',
  foundingLocation: {
    '@type': 'Place',
    addressCountry: 'FR',
    addressLocality: 'Paris',
  },
  knowsAbout: [
    'slow travel',
    'voyage écoresponsable',
    'travel planning sur mesure',
    'voyage en couple',
    'blog voyage',
    'Madère',
    'Roumanie',
    'Suisse',
  ],
  sameAs: [
    'https://www.instagram.com/heldonica',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services Heldonica',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Travel Planning Sur Mesure',
          url: 'https://www.heldonica.fr/travel-planning',
          description:
            'Conception sur mesure d\'itinéraires slow travel écoresponsables : rythme personnalisé, adresses testées terrain, carnet de voyage clé en main.',
        },
      },
    ],
  },
}

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.heldonica.fr/#website',
  name: 'Heldonica',
  url: 'https://www.heldonica.fr',
  description: 'Blog slow travel vécu en duo et travel planning sur mesure écoresponsable.',
  inLanguage: 'fr-FR',
  publisher: {
    '@id': 'https://www.heldonica.fr/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.heldonica.fr/blog?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const schemaSpeakable = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.heldonica.fr/#webpage',
  name: 'Heldonica — Slow Travel & Voyages Authentiques',
  url: 'https://www.heldonica.fr',
  isPartOf: { '@id': 'https://www.heldonica.fr/#website' },
  about: { '@id': 'https://www.heldonica.fr/#organization' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[class*="hero"]', '[class*="intro"]'],
  },
}

export default async function Home() {
  const allPosts = await getAllPosts()
  const coveredCountries = await getSetting('covered_countries')

  const latestPosts = allPosts.slice(0, 6)
  const travelPosts = formatPosts(allPosts.filter((p) => p.category === 'Carnets Voyage').slice(0, 3))
  const foodPosts = formatPosts(
    allPosts
      .filter((p) => p.category === 'Découvertes Locales' || p.category === 'Guides Pratiques')
      .slice(0, 3)
  )
  const featured = allPosts[0]
    ? { ...allPosts[0], formattedDate: formatDate(allPosts[0].published_at), readTime: allPosts[0].read_time ?? calcReadTime(allPosts[0].content) }
    : null

  return (
    <>
      <HomeClient
        featured={featured}
        travelPosts={travelPosts}
        foodPosts={foodPosts}
        totalPosts={allPosts.length}
        coveredCountries={coveredCountries}
        latestPosts={formatPosts(latestPosts)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSpeakable) }}
      />
    </>
  )
}
