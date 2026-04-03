import { getAllPosts, formatDate, type BlogPost } from '@/lib/blog-supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogClientPage from '@/components/BlogClientPage';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 60; // ISR : re-génère toutes les 60s

export default async function BlogPage() {
  const posts = await getAllPosts();
  return (
    <>
      <Header />
      <Breadcrumb />
      <BlogClientPage posts={posts} formatDate={formatDate} />
      <Footer />
    </>
  );
}
