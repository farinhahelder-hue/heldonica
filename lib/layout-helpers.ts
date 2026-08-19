import { createServiceClient } from '@/lib/supabase';

export type BlockDef = { id: string; label: string; active: boolean };
export type LayoutConfig = { article: BlockDef[]; destination: BlockDef[] };

export const DEFAULT_LAYOUTS: LayoutConfig = {
  article: [
    { id: 'hero', label: 'En-tête (Hero Image & Titre)', active: true },
    { id: 'content', label: 'Contenu principal (Texte & Images)', active: true },
    { id: 'map', label: 'Carte interactive', active: true },
    { id: 'voice_notes', label: 'Détail terrain (Voice notes)', active: true },
    { id: 'tags', label: 'Tags', active: true },
    { id: 'related_articles', label: 'Articles similaires', active: true },
  ],
  destination: [
    { id: 'hero', label: 'En-tête (Hero Image & Titre)', active: true },
    { id: 'info_cards', label: 'Cartes Infos Pratiques', active: true },
    { id: 'description', label: 'Description (On y est allés)', active: true },
    { id: 'sub_destinations', label: 'Sous-destinations', active: true },
    { id: 'tips', label: 'Nos Tips Recommandés', active: true },
    { id: 'verdict', label: 'Verdict', active: true },
    { id: 'cta', label: 'Appel à l\'action (Travel Planning)', active: true },
    { id: 'quiz', label: 'Quiz Slow Travel', active: true },
    { id: 'related_articles', label: 'Articles similaires', active: true },
  ]
};

export async function getPageLayout(type: 'article' | 'destination'): Promise<BlockDef[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'layouts')
      .single();
    
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (parsed[type]) {
        // Merge missing default blocks to avoid breaking if new blocks are added later
        const activeIds = new Set(parsed[type].map((b: BlockDef) => b.id));
        const missing = DEFAULT_LAYOUTS[type].filter(b => !activeIds.has(b.id));
        return [...parsed[type], ...missing];
      }
    }
  } catch (error) {
    console.error('Error fetching layout:', error);
  }
  return DEFAULT_LAYOUTS[type];
}
