import type { Metadata } from 'next'
import { getAllPosts, formatDate } from '@/lib/blog-supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogClientPage from '@/components/BlogClientPage'
import NewsletterForm from '@/components/NewsletterForm'
import Breadcrumb from '@/components/Breadcrumb'

function calcReadTime(content: string | null): number {
  if (!content) return 0
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export const revalidate = 60

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
  const posts = await getAllPosts()
  const postsWithFormattedDate = posts.map((post) => ({
    ...post,
    formattedDate: formatDate(post.published_at),
    readTime: post.read_time ?? calcReadTime(post.content),
  }))

  return (
    <>
      <Header />
      <Breadcrumb />
      <BlogClientPage posts={postsWithFormattedDate} />
      <NewsletterForm variant="blog" />
      <Footer />
    </>
  )
}
