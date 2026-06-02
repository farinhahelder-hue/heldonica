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

/** Normalise un post pour garantir qu'aucun champ tableau n'est null */
function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
    category: post.category ?? null,
    excerpt: post.excerpt ?? null,
    content: post.content ?? null,
    featured_image: post.featured_image ?? null,
    author: post.author ?? null,
  };
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
  const plain = stripHtml(post.content);
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '\u2026';
}

/** Tous les articles publiés, du plus récent au plus ancien */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning []');
    return [];
  }
  try {
    // Try both column names: 'published' boolean and 'status' text
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .or('published.eq.true,status.eq.published')
      .order('published_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Supabase getAllPosts error:', error.message);
      // Fallback to just published=true
      const fallback = await supabase
        .from('cms_blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(100);
      if (fallback.error) {
        console.error('Fallback also failed:', fallback.error.message);
        return [];
      }
      return (fallback.data as BlogPost[] || []).map(normalizePost);
    }
    const posts = Array.isArray(data) ? (data as BlogPost[]) : [];
    return posts.map(normalizePost);
  } catch (err) {
    console.error('getAllPosts exception:', err);
    return [];
  }
}

/** Un article par slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      console.error('Supabase getPostBySlug error:', error.message);
      return null;
    }
    return data ? normalizePost(data as BlogPost) : null;
  } catch (err) {
    console.error('getPostBySlug exception:', err);
    return null;
  }
}

/** Articles liés (même catégorie, sans l'article courant) */
export async function getRelatedPosts(
  currentSlug: string,
  category: string | null,
  limit = 3
): Promise<BlogPost[]> {
  if (!supabase) return [];
  try {
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
    const posts = Array.isArray(data) ? (data as BlogPost[]) : [];
    return posts.map(normalizePost);
  } catch (err) {
    console.error('getRelatedPosts exception:', err);
    return [];
  }
}

/** Tous les slugs pour generateStaticParams */
export async function getAllSlugs(): Promise<{ slug: string }[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('slug')
      .eq('published', true);
    if (error) {
      console.error('Supabase getAllSlugs error:', error.message);
      return [];
    }
    return (data as { slug: string }[]) ?? [];
  } catch (err) {
    console.error('getAllSlugs exception:', err);
    return [];
  }
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
 * Récupère une valeur de paramètre depuis la table site_settings
 */
export async function getSetting(key: string): Promise<string | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Supabase getSetting error for '${key}':`, error.message);
      return null;
    }

    return data?.value || null;
  } catch (err) {
    console.error(`getSetting exception for '${key}':`, err);
    return null;
  }
}

/**
 * Récupère le contenu d'une page (depuis site_content table)
 * Retourne un dictionnaire block_key -> value
 */
export async function getPageContent(page: string): Promise<Record<string, string>> {
  if (!supabase) return {};
  
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('block_key, value')
      .eq('page', page);

    if (error) {
      console.error(`Supabase getPageContent error for '${page}':`, error.message);
      return {};
    }

    if (!data || data.length === 0) return {};
    
    return data.reduce((acc, item) => {
      if (item.block_key && item.value) {
        acc[item.block_key] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);
  } catch (err) {
    console.error(`getPageContent exception for '${page}':`, err);
    return {};
  }
}

/** Tous les slugs de destinations pour generateStaticParams */
export async function getAllDestinationSlugs(): Promise<{ slug: string }[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('slug')
      .eq('published', true);
    if (error) {
      console.error('Supabase getAllDestinationSlugs error:', error.message);
      return [];
    }
    return (data as { slug: string }[]) ?? [];
  } catch (err) {
    console.error('getAllDestinationSlugs exception:', err);
    return [];
  }
}
