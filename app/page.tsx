import { getSetting, getAllPosts, formatDate, BlogPost, getPageContent } from '@/lib/blog-supabase'
import { getSiteSettings } from '@/lib/settings'
import HomeClient from '@/components/HomeClient'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import type { Metadata } from 'next'
import { getHomeDestinations, getHomeContentZones } from '@/lib/home-data'

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
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
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
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85'],
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
    readTime: (post.read_time && post.read_time > 0) ? post.read_time : calcReadTime(post.content),
  }))
}
const schemaSpeakable = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Heldonica — Slow Travel & Voyages Authentiques',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[class*="hero"]', '[class*="intro"]'],
  },
  url: 'https://www.heldonica.fr',
};

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Heldonica",
  "url": "https://www.heldonica.fr",
  "logo": "https://www.heldonica.fr/images/badges-heldonica.svg",
  "sameAs": [
    "https://www.instagram.com/heldonica",
    "https://www.linkedin.com/company/heldonicatravel"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["French", "English", "Portuguese"]
  }
};

export default async function Home() {
  // Fetch all data in parallel
  const [allPostsResult, homeDestinations, homeZones, rawCountries, heroSettings, siteSettingsResult] = await Promise.all([
    getAllPosts(),
    getHomeDestinations(),
    getHomeContentZones(),
    getSetting('covered_countries'),
    getPageContent('home'),
    getSiteSettings(),
  ])

  // Defensive: ensure we always have an array
  const allPosts = Array.isArray(allPostsResult) ? allPostsResult : []
  
  // Get covered_countries as number with fallback
  const coveredCountries = rawCountries ? parseInt(rawCountries, 10) : 7

  // Hero media
  const heroVideoUrl = heroSettings['hero_video_url'] || null
  const heroPosterImage = heroSettings['hero_poster_image'] || null

  const latestPosts = allPosts.slice(0, 6)
  const travelPosts = formatPosts(allPosts.filter((p) => p.category === 'Carnets Voyage').slice(0, 3))
  const foodPosts = formatPosts(
    allPosts
      .filter((p) => p.category === 'Découvertes Locales' || p.category === 'Guides Pratiques')
      .slice(0, 3)
  )
  // Featured: use first published article with a valid slug (avoids 404)
  const featuredPost = allPosts.find(p => p.slug && p.slug.trim().length > 0) ?? null
  const featured = featuredPost
    ? { ...featuredPost, formattedDate: formatDate(featuredPost.published_at), readTime: (featuredPost.read_time && featuredPost.read_time > 0) ? featuredPost.read_time : calcReadTime(featuredPost.content) }
    : null

  // Site settings
  const siteSettings = {
    instagramUsername: siteSettingsResult?.instagramUsername || undefined,
    instagramPostCount: siteSettingsResult?.instagramPostCount ? Number(siteSettingsResult.instagramPostCount) : undefined,
    instagramPosts: siteSettingsResult?.instagramPosts || undefined,
    site_email: siteSettingsResult?.contact_email || 'contact@heldonica.fr',
  }

  return (
    <InlineEditProvider page="home">
      <HomeClient
        featured={featured}
        travelPosts={travelPosts}
        foodPosts={foodPosts}
        totalPosts={allPosts.length}
        coveredCountries={String(coveredCountries)}
        latestPosts={formatPosts(latestPosts)}
        heroVideoUrl={heroVideoUrl}
        heroPosterImage={heroPosterImage}
        siteSettings={siteSettings}
        homeDestinations={homeDestinations}
        homeZones={homeZones}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSpeakable) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
    </InlineEditProvider>
  )
}