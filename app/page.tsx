import { getAllPosts, formatDate, BlogPost } from '@/lib/blog-supabase'
import HomeClient from '@/components/HomeClient'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Heldonica — Slow travel vécu en duo, conçu pour toi',
  description:
    'Un duo Paris-Madère-Roumanie qui voyage lentement, documente vraiment et partage ce qu’il a vécu — pas ce qu’il a lu ailleurs.',
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
      'On ferme les ordis. On part. On revient avec des pépites qu’on n’avait pas cherchées.',
    url: 'https://heldonica.fr',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://heldonica.fr/og-image.jpg',
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
    images: ['https://heldonica.fr/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://heldonica.fr',
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

function formatPosts(posts: BlogPost[]) {
  return posts.map((post) => ({
    ...post,
    formattedDate: formatDate(post.published_at),
  }))
}

export default async function Home() {
  const allPosts = await getAllPosts()
  const latestPosts = allPosts.slice(0, 6)
  const travelPosts = formatPosts(allPosts.filter((p) => p.category === 'Carnets Voyage').slice(0, 3))
  const foodPosts = formatPosts(
    allPosts
      .filter((p) => p.category === 'Découvertes Locales' || p.category === 'Guides Pratiques')
      .slice(0, 3)
  )
  const featured = allPosts[0]
    ? { ...allPosts[0], formattedDate: formatDate(allPosts[0].published_at) }
    : null

  return (
    <HomeClient
      featured={featured}
      travelPosts={travelPosts}
      foodPosts={foodPosts}
      latestPosts={formatPosts(latestPosts)}
      totalPosts={allPosts.length}
    />
  )
}
