import type { Metadata } from 'next'
import Script from 'next/script'
import { getAllPosts, formatDate, BlogPost } from '@/lib/blog-supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogClientPage from '@/components/BlogClientPage'
import Breadcrumb from '@/components/Breadcrumb'
import { getReadingTime } from '@/lib/readingTime'

// ISR: cache for 1 hour
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
    description: 'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain. Récits authentiques, conseils pratiques et destinations hors des sentiers battus.',
    keywords: [
      'blog slow travel',
      'carnet de voyage',
      'récit de voyage',
      'blog voyage authentique',
      'blog écoresponsable',
    ],
    alternates: {
      canonical: 'https://www.heldonica.fr/blog',
    },
    openGraph: {
      title: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
      description: 'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain.',
      url: 'https://heldonica.fr/blog',
      siteName: 'Heldonica',
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
          width: 1200,
          height: 630,
          alt: 'Blog Heldonica — Carnets de route slow travel, pépites dénichées',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
      description: 'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain.',
      images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85'],
      creator: '@heldonica',
    },
  }
}

function CollectionPageJsonLd({ posts }: { posts: BlogPost[] }) {
  const baseUrl = 'https://www.heldonica.fr'
  const blogUrl = `${baseUrl}/blog`

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
    description: 'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain. Récits authentiques, conseils pratiques et destinations hors des sentiers battus.',
    url: blogUrl,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Heldonica',
      publisher: {
        '@type': 'Organization',
        name: 'Heldonica',
        url: baseUrl,
      },
    },
    about: {
      '@type': 'Thing',
      name: 'Slow Travel',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: blogUrl,
        },
      ],
    },
  }

  // Add mainEntity if we have posts
  if (posts.length > 0) {
    const blogPosts = posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${blogUrl}/${post.slug}`,
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      image: post.featured_image,
      author: {
        '@type': 'Person',
        name: post.author || 'Heldonica',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Heldonica',
        url: baseUrl,
      },
    }))

    return (
      <Script
        id="collection-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          ...collectionPageSchema,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: blogPosts,
          },
        }) }}
      />
    )
  }

  return (
    <Script
      id="collection-page-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
    />
  )
}

export default async function BlogPage() {
  let posts: BlogPost[] = []
  try {
    const result = await getAllPosts()
    posts = Array.isArray(result) ? result : []
  } catch (e) {
    console.error('Supabase getAllPosts error:', e)
    posts = []
  }

  // If we have no posts at build time, avoid crashing the build and just render an empty list.
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <>
        <Header />
        <Breadcrumb />
        <BlogClientPage posts={[]} />
        <Footer />
        <CollectionPageJsonLd posts={[]} />
      </>
    )
  }

  // Ensure posts is an array and each post is an object
  const safePosts = posts.filter((p) => p && typeof p === 'object')

  const postsWithFormattedDate = safePosts.map((post) => ({
    ...post,
    // Defensive: force tags to be an array for the client
    tags: Array.isArray(post.tags) ? post.tags : [],
    formattedDate: formatDate(post.published_at),
    readTime: post.read_time ?? getReadingTime(post.content),
  }))

  return (
    <>
      <Header />
      <Breadcrumb />
      <BlogClientPage posts={postsWithFormattedDate} />
      <Footer />
      <CollectionPageJsonLd posts={safePosts} />
    </>
  )
}
