import type { Metadata } from 'next';
import { getAllPosts, formatDate, type BlogPost } from '@/lib/blog-supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogClientPage from '@/components/BlogClientPage';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog Slow Travel | Carnets de Voyage & Pépites Dénichées | Heldonica',
  description: 'Carnets de voyage slow travel, pépites dénichées et conseils pour voyager en couple hors des sentiers battus. Madère, Zurich, Portugal — des récits vrais, testés sur le terrain.',
  keywords: ['blog slow travel', 'carnet de voyage', 'pépites voyage', 'voyage en couple', 'voyages hors sentiers battus', 'heldonica'],
  alternates: {
    canonical: 'https://heldonica.fr/blog',
  },
  openGraph: {
    title: 'Blog Slow Travel — Carnets de Voyage Heldonica',
    description: 'Carnets de route authentiques, pépites dénichées et itinéraires slow travel pour voyager en couple autrement.',
    url: 'https://heldonica.fr/blog',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
}; // ISR : re-génère toutes les 60s

export default async function BlogPage() {
  const posts = await getAllPosts();
  // Pre-format dates for client component (cannot pass functions)
  const postsWithFormattedDate = posts.map(post => ({
    ...post,
    formattedDate: formatDate(post.published_at)
  }));
  return (
    <>
      <Header />
      <Breadcrumb />
      <BlogClientPage posts={postsWithFormattedDate} />
      <Footer />
    </>
  );
}
