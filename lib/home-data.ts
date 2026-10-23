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

function getDestinationEmoji(_slug: string): string {
  return '';
}

export const FALLBACK_HOME_DESTINATIONS: HomeDestination[] = [
  {
    id: 'fallback-1',
    destination_slug: 'madere',
    display_order: 1,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg',
    title: 'Madère',
    tagline: 'Slow travel, falaises, levadas et douceur atlantique.',
    hero_unsplash_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg',
    country: 'Portugal',
    flag_emoji: null,
  },
  {
    id: 'fallback-2',
    destination_slug: 'roumanie',
    display_order: 2,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    title: 'Roumanie',
    tagline: 'Forêts des Carpates, cités discrètes et pépites inattendues.',
    hero_unsplash_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    country: 'Roumanie',
    flag_emoji: null,
  },
  {
    id: 'fallback-3',
    destination_slug: 'montenegro',
    display_order: 3,
    is_featured: true,
    custom_title: null,
    custom_description: null,
    custom_image_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    title: 'Monténégro',
    tagline: 'Fjord de Kotor, ruelles anciennes et Adriatique hors des radars.',
    hero_unsplash_url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    country: 'Monténégro',
    flag_emoji: null,
  },
];

export const FALLBACK_HOME_ZONES: Record<string, string> = {
  'hero_badge': 'Slow travel vécu en duo · Hors sentiers · Paris',
  'hero_title': 'Carnets de terrain,\nenfin vécu.',
  'hero_subtitle': "On ferme les ordis. On part. On revient avec des pépites qu'on n'avait pas cherchées.",
  'hero_cta': 'Planifier mon voyage',
  'pillar_1_title': "L'émerveillement",
  'pillar_1_desc': 'Il se cache dans un marché de quartier, une ruelle oubliée, ou un café perdu en Provence.',
  'pillar_1_icon': 'Sparkles',
  'pillar_2_title': 'Notre philosophie',
  'pillar_2_desc': "Nous ne voyageons pas pour cocher des cases. Nous voyageons pour ralentir et nous reconnecter.",
  'pillar_2_icon': 'Compass',
  'pillar_3_title': 'Notre promesse',
  'pillar_3_desc': "Heldonica vous accompagne pour planifier vos voyages avec âme.",
  'pillar_3_icon': 'Heart',
  'destinations_title': 'Nos Pépites',
  'destinations_subtitle': "Nos territoires explorés à pied et en duo",
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
    const [{ data: homeDests, error: homeError }, { data: destData, error: destError }] = await Promise.all([
      supabase
        .from('cms_home_destinations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(8),
      supabase
        .from('destinations')
        .select('slug, title, tagline, excerpt, hero_unsplash_url, featured_image, country, flag_emoji')
        .eq('published', true),
    ]);

    if (homeError) {
      console.error('[HomeData] Error fetching home destinations:', homeError);
    }
    if (destError) {
      console.error('[HomeData] Error fetching destinations:', destError);
    }

    const publishedDests = destData || [];
    if (publishedDests.length === 0) {
      return FALLBACK_HOME_DESTINATIONS;
    }

    const destMap = new Map(publishedDests.map((d: any) => [d.slug, d]));
    const fallbackImgMap = new Map(FALLBACK_HOME_DESTINATIONS.map((f) => [f.destination_slug, f.custom_image_url]));

    // Ne retenir de cms_home_destinations que les destinations réellement publiées,
    // puis compléter avec les destinations publiées restantes (ex: montenegro).
    const orderedSlugs: string[] = [];
    for (const hd of homeDests || []) {
      if (hd?.slug && destMap.has(hd.slug) && !orderedSlugs.includes(hd.slug)) {
        orderedSlugs.push(hd.slug);
      }
    }
    for (const d of publishedDests) {
      if (d?.slug && !orderedSlugs.includes(d.slug)) {
        orderedSlugs.push(d.slug);
      }
    }

    const homeDestMap = new Map((homeDests || []).map((hd: any) => [hd.slug, hd]));

    return orderedSlugs.map((slug, idx) => {
      const dest: any = destMap.get(slug);
      const homeDest: any = homeDestMap.get(slug);
      const verifiedImg =
        dest?.featured_image ||
        dest?.hero_unsplash_url ||
        homeDest?.image_url ||
        fallbackImgMap.get(slug) ||
        null;

      return {
        id: String(homeDest?.id ?? `dest-${idx + 1}`),
        destination_slug: slug,
        display_order: homeDest?.sort_order ?? idx + 1,
        is_featured: true,
        custom_title: homeDest?.title || null,
        custom_description: homeDest?.description || null,
        custom_image_url: verifiedImg,
        title: homeDest?.title || dest?.title?.split(' | ')[0]?.split(' : ')[0] || slug,
        tagline: homeDest?.description || dest?.tagline || dest?.excerpt || null,
        hero_unsplash_url: verifiedImg,
        country: dest?.country || null,
        flag_emoji: dest?.flag_emoji || getDestinationEmoji(slug),
      };
    });
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
