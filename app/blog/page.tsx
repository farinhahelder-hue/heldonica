import type { Metadata } from 'next'
import { getAllPosts, formatDate } from '@/lib/blog-supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogClientPage from '@/components/BlogClientPage'
import Breadcrumb from '@/components/Breadcrumb'

function calcReadTime(content: string | null): number {
  if (!content) return 0
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog Slow Travel | Carnets, Pépites & Guides — Heldonica',
  description:
    'Carnets, pépites et guides écrits depuis le terrain. Des récits slow travel ancrés dans le réel, pas dans la brochure.',
  keywords: ['blog slow travel', 'carnet de voyage', 'pépites voyage', 'voyage terrain', 'heldonica', 'slow travel couple', 'découvertes locales'],
  alternates: {
    canonical: 'https://heldonica.fr/blog',
  },
  openGraph: {
    title: 'Blog Slow Travel | Carnets, Pépites & Guides — Heldonica',
    description:
      'Carnets, pépites et guides écrits depuis le terrain. Des récits slow travel ancrés dans le réel, pas dans la brochure.',
    url: 'https://heldonica.fr/blog',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Heldonica — Carnets de voyage slow travel, pépites et guides terrain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Slow Travel | Carnets, Pépites & Guides — Heldonica',
    description:
      'Carnets, pépites et guides écrits depuis le terrain. Des récits slow travel ancrés dans le réel, pas dans la brochure.',
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
      <Footer />
    </>
  )
}
