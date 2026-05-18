import type { Metadata } from 'next'
import { getAllPosts, formatDate, BlogPost } from '@/lib/blog-supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogClientPage from '@/components/BlogClientPage'
import Breadcrumb from '@/components/Breadcrumb'

// Bolt optimization: Enable ISR with 60 second revalidation period to improve TTFB and reduce server load for the blog index page
export const revalidate = 60

function calcReadTime(content: string | null): number {
  if (!content || typeof content !== 'string') return 0
  try {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  } catch (e) {
    return 1
  }
}

export const metadata: Metadata = {
  title: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
  description:
    'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain. Récits authentiques, conseils pratiques et destinations hors des sentiers battus.',
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
    description:
      'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain.',
    url: 'https://www.heldonica.fr/blog',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Heldonica — Carnets de route slow travel, pépites dénichées',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Slow Travel — Carnets de Route & Pépites Dénichées | Heldonica',
    description:
      'Articles slow travel, carnets de route et pépites dénichées testées sur le terrain.',
    images: ['/og-blog.jpg'],
    creator: '@heldonica',
  },
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
    readTime: post.read_time ?? calcReadTime(post.content),
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
