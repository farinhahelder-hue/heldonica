import { supabase } from './blog-supabase';

export interface Destination {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
}

export async function getAllDestinationsForSitemap(): Promise<Destination[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('cms_destinations')
      .select('slug, updated_at, created_at')
      .eq('published', true);
    if (error) {
      console.error('Supabase getAllDestinationsForSitemap error:', error.message);
      return [];
    }
    return (data as Destination[]) || [];
  } catch (err) {
    console.error('getAllDestinationsForSitemap exception:', err);
    return [];
  }
}
