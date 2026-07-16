/**
 * Home Page Data Fetching
 * Fetches dynamic content from Supabase for the homepage
 */

import { supabase } from './supabase-client';

export interface HomeDestination {
  id: string;
  destination_slug: string;
  display_order: number;
  is_featured: boolean;
  custom_title: string | null;
  custom_description: string | null;
  custom_image_url: string | null;
  title: string;
  tagline: string | null;
  hero_unsplash_url: string | null;
  country: string | null;
  flag_emoji: string | null;
}

export interface HomeContentZone {
  key: string;
  value: string;
}

export interface HomeData {
  destinations: HomeDestination[];
  contentZones: Record<string, string>;
}

const DESTINATION_EMOJI: Record<string, string> = {
  'madere': '🏝️',
  'maderia': '🏝️',
  'roumanie': '🏰',
  'romania': '🏰',
  'montenegro': '🌊',
  'sicile': '🌋',
  'sicily': '🌋',
  'zurich': '🏙️',
  'suisse': '🏔️',
  'switzerland': '🏔️',
  'grece': '🏛️',
  'greece': '🏛️',
  'colombie': '🌴',
  'colombia': '🌴',
  'paris': '🗼',
  'default': '📍',
};

function getDestinationEmoji(slug: string): string {
  const normalized = slug.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, emoji] of Object.entries(DESTINATION_EMOJI)) {
    if (normalized.includes(key)) {
      return emoji;
    }
  }
  return '📍';
}

export const FALLBACK_HOME_DESTINATIONS: HomeDestination[] = [
  {
    id: 'fallback-1',
    destination_slug: 'madere',
    display_order: 1,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: null,
    title: 'Madère',
    tagline: 'Île de l’Éternel Printemps',
    hero_unsplash_url: null,
    country: 'Portugal',
    flag_emoji: '🏝️',
  },
  {
    id: 'fallback-2',
    destination_slug: 'roumanie',
    display_order: 2,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: null,
    title: 'Roumanie',
    tagline: 'Nature Sauvage et Traditions',
    hero_unsplash_url: null,
    country: 'Roumanie',
    flag_emoji: '🏰',
  },
  {
    id: 'fallback-3',
    destination_slug: 'montenegro',
    display_order: 3,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: null,
    title: 'Monténégro',
    tagline: 'Côte Adriatique Préservée',
    hero_unsplash_url: null,
    country: 'Monténégro',
    flag_emoji: '🌊',
  },
  {
    id: 'fallback-4',
    destination_slug: 'sicile',
    display_order: 4,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: null,
    title: 'Sicile',
    tagline: 'Tranche de Vie Italienne',
    hero_unsplash_url: null,
    country: 'Italie',
    flag_emoji: '🌋',
  },
];

export const FALLBACK_HOME_ZONES: Record<string, string> = {
  'hero_badge': 'Slow travel vécu en duo · Hors sentiers · Paris',
  'hero_title': 'Carnets de terrain,\nenfin vécu.',
  'hero_subtitle': "On ferme les ordis. On part. On revient avec des pépites qu'on n'avait pas cherchées.",
  'hero_cta': 'Planifier mon voyage',
  'pillar_1_title': "L'émerveillement",
  'pillar_1_desc': 'Il se cache dans un marché de quartier, une ruelle oubliée, ou un café perdu en Provence.',
  'pillar_1_icon': '✨',
  'pillar_2_title': 'Notre philosophie',
  'pillar_2_desc': "Nous ne voyageons pas pour cocher des cases. Nous voyageons pour ralentir et nous reconnecter.",
  'pillar_2_icon': '🧭',
  'pillar_3_title': 'Notre promesse',
  'pillar_3_desc': "Heldonica vous accompagne pour planifier vos voyages avec âme.",
  'pillar_3_icon': '💚',
  'destinations_title': 'Nos Pépites',
  'destinations_subtitle': "4 destinations phare pour l'aventure en couple",
  'cta_badge': 'Travel Planning · terrain vécu',
  'cta_title_1': "On ne fait pas des itinéraires.",
  'cta_title_2': 'On fait le tien.',
  'cta_text': 'Tu nous envoies tes contraintes réelles et ton budget. On te renvoie un carnet complet.',
  'cta_subtext': "Notre terrain naturel : les couples, les solos curieux et les familles.",
  'cta_btn_1': 'Nous écrire →',
  'cta_btn_2': 'Voir nos services →',
  'cta_card_1_title': 'Couples aventuriers',
  'cta_card_1_desc': "Notre spécialité : ralentir sans ennuyer, et garder le hors-sentiers sans perdre le fil.",
  'cta_card_2_title': 'Ouvert aussi à ton format',
  'cta_card_2_desc': "Solo, famille curieuse ou groupe d'amis : on adapte à votre énergie.",
  'cta_card_3_title': 'Vécu sur le terrain',
  'cta_card_3_desc': "Cartes, adresses, conseils pratiques : tout part d'expériences testées.",
};

export async function getHomeDestinations(): Promise<HomeDestination[]> {
  if (!supabase) {
    console.warn('[HomeData] Supabase not configured, using fallback destinations');
    return FALLBACK_HOME_DESTINATIONS;
  }

  try {
    const { data: homeDests, error: homeError } = await supabase
      .from('cms_home_destinations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (homeError) {
      console.error('[HomeData] Error fetching home destinations:', homeError);
      return FALLBACK_HOME_DESTINATIONS;
    }

    if (!homeDests || homeDests.length === 0) {
      console.warn('[HomeData] No home destinations configured, using fallback');
      return FALLBACK_HOME_DESTINATIONS;
    }

    const slugs = homeDests.map((d: any) => d.slug);

    const { data: destData, error: destError } = await supabase
      .from('destinations')
      .select('slug, title, tagline, hero_unsplash_url, country, flag_emoji')
      .in('slug', slugs)
      .eq('published', true);

    if (destError) {
      console.error('[HomeData] Error fetching destinations:', destError);
    }

    const destMap = new Map((destData || []).map((d: any) => [d.slug, d]));

    const destinations: HomeDestination[] = homeDests.map((homeDest: any) => {
      const dest: any = destMap.get(homeDest.slug);
      return {
        id: homeDest.id,
        destination_slug: homeDest.slug,
        display_order: homeDest.sort_order || 0,
        is_featured: true, // fallback to true
        custom_title: homeDest.title || null,
        custom_description: homeDest.description || null,
        custom_image_url: null, // fallback
        title: homeDest.title || dest?.title || homeDest.slug,
        tagline: dest?.tagline || homeDest.description || null,
        hero_unsplash_url: dest?.hero_unsplash_url || null,
        country: dest?.country || null,
        flag_emoji: dest?.flag_emoji || getDestinationEmoji(homeDest.slug),
      };
    });

    return destinations;
  } catch (err) {
    console.error('[HomeData] Unexpected error:', err);
    return FALLBACK_HOME_DESTINATIONS;
  }
}

export async function getHomeContentZones(): Promise<Record<string, string>> {
  if (!supabase) {
    console.warn('[HomeData] Supabase not configured, using fallback zones');
    return FALLBACK_HOME_ZONES;
  }

  try {
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('zone_key, value')
      .eq('page', 'home')
      .eq('is_active', true);

    if (error) {
      console.error('[HomeData] Error fetching home zones:', error);
      return FALLBACK_HOME_ZONES;
    }

    if (!data || data.length === 0) {
      console.warn('[HomeData] No home zones configured, using fallback');
      return FALLBACK_HOME_ZONES;
    }

    const zones: Record<string, string> = {};
    for (const zone of data as any[]) {
      zones[zone.zone_key] = zone.value;
    }

    return { ...FALLBACK_HOME_ZONES, ...zones };
  } catch (err) {
    console.error('[HomeData] Unexpected error:', err);
    return FALLBACK_HOME_ZONES;
  }
}

export async function getHomeData(): Promise<HomeData> {
  const [destinations, contentZones] = await Promise.all([
    getHomeDestinations(),
    getHomeContentZones(),
  ]);

  return { destinations, contentZones };
}
