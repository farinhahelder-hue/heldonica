/**
 * Marqueurs de la carte interactive — lecture CMS.
 *
 * Source de vérité UNIQUE : table Supabase `map_markers`.
 *
 * Jusqu'au 2026-08-04, ce fichier embarquait les 24 marqueurs en dur, sous un
 * en-tête qui annonçait « Ready for future Supabase/CMS integration » — jamais
 * fait. Chaque titre, chaque accroche et chaque coordonnée n'était modifiable
 * que par un redéploiement.
 *
 * Il n'y a volontairement aucune copie de secours du contenu ici. Si la base est
 * injoignable, la carte s'affiche sans marqueur et l'erreur est journalisée : une
 * panne se voit, au lieu d'être masquée par des données périmées. C'est la leçon
 * de `lib/pillar-data.ts`, dont le « fallback » avait dissimulé une panne
 * pendant des mois.
 *
 * Pour modifier les marqueurs : table `map_markers`.
 */

import { createServiceClient } from '@/lib/supabase'

export interface DestinationMarker {
  slug: string;
  title: string;
  excerpt: string;
  latitude: number;
  longitude: number;
  category: 'nature' | 'culture' | 'city' | 'food';
  country: string;
  region: string;
  url: string;
  display_order?: number;
}

/**
 * Marqueurs actifs, ordonnés par display_order. À appeler côté serveur : le résultat
 * descend en prop jusqu'à la carte, qui est un composant client.
 */
export async function getDestinationMarkers(): Promise<DestinationMarker[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('map_markers')
      .select('slug, title, excerpt, latitude, longitude, category, country, region, url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[Carte] Erreur de lecture des marqueurs:', error.message)
      return []
    }
    return (data ?? []) as DestinationMarker[]
  } catch (err) {
    console.error(
      '[Carte] Erreur inattendue au chargement des marqueurs:',
      err instanceof Error ? err.message : String(err)
    )
    return []
  }
}

/*
 * Dérivations pour les filtres. Elles prennent les marqueurs en argument : le
 * jeu de données n'est plus une constante de module, il dépend de la requête.
 */

export const getCountries = (markers: DestinationMarker[]) =>
  Array.from(new Set(markers.map((d) => d.country))).sort();

export const getRegions = (markers: DestinationMarker[]) =>
  Array.from(new Set(markers.map((d) => d.region))).sort();

export const getCategories = (markers: DestinationMarker[]) =>
  Array.from(new Set(markers.map((d) => d.category)));
