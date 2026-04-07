import { getAllPosts, formatDate, BlogPost } from '@/lib/blog-supabase'
import HomeClient from '@/components/HomeClient'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Heldonica — Blog Slow Travel en Couple & Travel Planning sur Mesure',
  description: 'Pépites dénichées, carnets de voyage en couple et service de travel planning sur mesure. Embarquez dans notre histoire de slow travel écoresponsable, hors des sentiers battus.',
  keywords: ['slow travel couple', 'travel planning sur mesure', 'voyage hors sentiers battus', 'blog voyage écoresponsable', 'Madère', 'heldonica'],
  openGraph: {
    title: 'Heldonica — Slow Travel en Couple & Travel Planning',
    description: 'Blog de voyage et service de conception sur mesure pour les couples qui veulent voyager autrement, lentement, et authentiquement.',
    url: 'https://heldonica.fr',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://heldonica.fr/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow Travel en Couple',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heldonica — Slow Travel en Couple & Travel Planning',
    description: 'Pépites dénichées, carnets de voyage en couple et service de travel planning sur mesure.',
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

// Pre-format dates for client components (cannot pass functions)
function formatPosts(posts: BlogPost[]) {
  return posts.map(post => ({
    ...post,
    formattedDate: formatDate(post.published_at)
  }))
}

export default async function Home() {

  const allPosts = await getAllPosts()
  // Top 6 pour les sections dynamiques
  const latestPosts = allPosts.slice(0, 6)
  // Articles par catégorie pour la home — alignés sur les catégories Supabase
  const travelPosts = formatPosts(
    allPosts.filter(p => p.category === 'Carnets Voyage').slice(0, 3)
  )
  const foodPosts = formatPosts(
    allPosts.filter(p =>
      p.category === 'Découvertes Locales' || p.category === 'Guides Pratiques'
    ).slice(0, 3)
  )
  // Article mis en avant = le plus récent
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
