import { createClient } from '@supabase/supabase-js'

export interface CmsPageRow {
  id: string;
  page_key: string;
  label: string | null;
  hero_image: string | null;
  hero_video: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  section_data: Record<string, any>;
  updated_at: string;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getPageContent(pageKey: string): Promise<CmsPageRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('page_key', pageKey)
    .single();

  if (error || !data) return null;
  return data as CmsPageRow;
}

export async function updatePageContent(
  pageKey: string,
  updates: Partial<CmsPageRow>
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: { message: 'DB Unavailable' } };

  return supabase
    .from('cms_pages')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('page_key', pageKey);
}
