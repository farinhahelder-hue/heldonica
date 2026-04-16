import type { Metadata } from 'next'
import { getAllPosts, formatDate } from '@/lib/blog-supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogClientPage from '@/components/BlogClientPage'
import Breadcrumb from '@/components/Breadcrumb'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog | Heldonica',
  description:
    'Carnets, pépites et guides écrits depuis le terrain. Des récits slow travel ancrés dans le réel, pas dans la brochure.',
  keywords: ['blog slow travel', 'carnet de voyage', 'pépites voyage', 'voyage terrain', 'heldonica'],
  alternates: {
    canonical: 'https://heldonica.fr/blog',
  },
  openGraph: {
    title: 'Blog | Heldonica',
    description:
      'Carnets, pépites et guides écrits depuis le terrain. Des récits slow travel ancrés dans le réel, pas dans la brochure.',
    url: 'https://heldonica.fr/blog',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const postsWithFormattedDate = posts.map((post) => ({
    ...post,
    formattedDate: formatDate(post.published_at),
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
