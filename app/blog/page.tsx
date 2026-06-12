import type { Metadata } from 'next'
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
      canonical: 'https://heldonica.fr/blog',
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
    </>
  )
}
