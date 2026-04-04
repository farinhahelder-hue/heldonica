import { getAllPosts, formatDate, type BlogPost } from '@/lib/blog-supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogClientPage from '@/components/BlogClientPage';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 60; // ISR : re-génère toutes les 60s

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
