import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  voice_notes?: string | null;
  category: string | null;
  destination?: string | null;
  tags: string[] | null;
  featured_image: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string | null;
  read_time?: number | null;
  readTime?: number;
  updated_at: string | null;
}

/** Strip HTML tags and get plain text */
function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Generate excerpt from content if excerpt field is empty */
export function getExcerpt(post: BlogPost, maxLength = 160): string {
  if (post.excerpt && post.excerpt.trim().length > 0) {
    return post.excerpt.trim();
  }
  // Fallback: generate from content
  const plain = stripHtml(post.content);
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Tous les articles publiés, du plus récent au plus ancien */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
  if (error) {
    console.error('Supabase getAllPosts error:', error.message);
    return [];
  }
  return (data as BlogPost[]) ?? [];
}

/** Un article par slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Supabase getPostBySlug error:', error.message);
    return null;
  }
  return data as BlogPost;
}

/** Articles liés (même catégorie, sans l'article courant) */
export async function getRelatedPosts(
  currentSlug: string,
  category: string | null,
  limit = 3
): Promise<BlogPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('category', category ?? '')
    .eq('published', true)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Supabase getRelatedPosts error:', error.message);
    return [];
  }
  return (data as BlogPost[]) ?? [];
}

/** Tous les slugs pour generateStaticParams */
export async function getAllSlugs(): Promise<{ slug: string }[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('slug')
    .eq('published', true);
  if (error) {
    console.error('Supabase getAllSlugs error:', error.message);
    return [];
  }
  return (data as { slug: string }[]) ?? [];
}

/** Formate une date ISO en français */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Récupère une valeur de paramètre depuis la table cms_settings
 * @param key - La clé du paramètre (ex: 'covered_countries')
 * @returns La valeur du paramètre ou null si non trouvé
 */
export async function getSetting(key: string): Promise<string | null> {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('cms_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Supabase getSetting error for '${key}':`, error.message);
    return null;
  }

  return data?.value || null;
}





















