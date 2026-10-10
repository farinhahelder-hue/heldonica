/**
 * Heldonica CMS — Registre des Albums Photos & Preuves de Terrain.
 *
 * Conforme à la Règle n°1 d'AGENTS.md : On n'invente rien.
 * Toutes les données (lieux, dates de prise de vue, images) proviennent exclusivement
 * des prises de vue réelles du duo fondateur (content/evidence/*.json et public/images/destinations/).
 */

export interface PhotoEvidenceItem {
  id: string;
  filename: string;
  imageUrl: string;
  location: string;
  date: string; // ISO 8601 YYYY-MM-DD
  suggestedAnecdote: string;
  albumLink?: string;
}

export interface PhotoEvidenceAlbum {
  id: string;
  title: string;
  destination: string;
  period: string;
  albumLink?: string;
  photosCount: number;
  coverImageUrl: string;
  photos: PhotoEvidenceItem[];
}

/**
 * Albums de photos réelles vérifiées et géolocalisées du duo fondateur.
 */
export const VERIFIED_PHOTO_ALBUMS: PhotoEvidenceAlbum[] = [
  {
    id: 'montenegro-podgorica-2026',
    title: '🇲🇪 Monténégro — Podgorica, Stara Varoš & Morača',
    destination: 'montenegro',
    period: 'Mai 2026',
    albumLink: 'https://www.heldonica.fr/destinations/montenegro',
    photosCount: 5,
    coverImageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/moraca_millennium.jpg',
    photos: [
      {
        id: 'mne-moraca-millennium',
        filename: 'moraca_millennium.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/moraca_millennium.jpg',
        location: 'Podgorica, Morača',
        date: '2026-05-27',
        suggestedAnecdote: 'Le pont du Millénium au couchant au-dessus des eaux turquoise de la Morača.',
        albumLink: 'https://www.heldonica.fr/destinations/montenegro',
      },
      {
        id: 'mne-stara-varos-street',
        filename: 'stara_varos.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/stara_varos.jpg',
        location: 'Stara Varoš, Podgorica',
        date: '2026-05-27',
        suggestedAnecdote: 'Venelle ottomane pavée et treilles de vigne suspendues dans le vieux quartier de Stara Varoš.',
        albumLink: 'https://www.heldonica.fr/destinations/montenegro',
      },
      {
        id: 'mne-pxl-stara-varos-stencil',
        filename: 'PXL_20260527_182137166.RAW-01.COVER.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/PXL_20260527_182137166.RAW-01.COVER.jpg',
        location: 'Stara Varoš, Podgorica',
        date: '2026-05-27',
        suggestedAnecdote: 'Pochoir mural historique "СТАРА ВАРОШ 1987" immortalisé au détour d\'une ruelle en pierre.',
        albumLink: 'https://www.heldonica.fr/destinations/montenegro',
      },
      {
        id: 'mne-pxl-lodging',
        filename: 'PXL_20260527_180112571.RAW-01.COVER.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/PXL_20260527_180112571.RAW-01.COVER.jpg',
        location: 'Podgorica',
        date: '2026-05-27',
        suggestedAnecdote: 'Arrivée en fin d\'après-midi dans notre hébergement au centre de Podgorica.',
        albumLink: 'https://www.heldonica.fr/destinations/montenegro',
      },
      {
        id: 'mne-pxl-evening-walk',
        filename: 'PXL_20260527_183749922.RAW-01.COVER.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/PXL_20260527_183749922.RAW-01.COVER.jpg',
        location: 'Stara Varoš, Podgorica',
        date: '2026-05-27',
        suggestedAnecdote: 'Lumière dorée de 20h30 sur les murs de pierre blanche de la vieille ville.',
        albumLink: 'https://www.heldonica.fr/destinations/montenegro',
      },
    ],
  },
  {
    id: 'suisse-stoos-2025',
    title: '🇨🇭 Suisse — Crête de Fronalpstock & Stoos',
    destination: 'suisse',
    period: 'Juillet 2025',
    albumLink: 'https://www.heldonica.fr/destinations/suisse',
    photosCount: 4,
    coverImageUrl: 'https://www.heldonica.fr/images/destinations/suisse/IMG_20250712_154207.jpg',
    photos: [
      {
        id: 'che-fronalpstock-crest',
        filename: 'IMG_20250712_154207.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/suisse/IMG_20250712_154207.jpg',
        location: 'Fronalpstock, Stoos',
        date: '2025-07-12',
        suggestedAnecdote: 'Vue plongeante sur les bras du lac des Quatre-Cantons depuis l\'arête de Fronalpstock.',
        albumLink: 'https://www.heldonica.fr/destinations/suisse',
      },
      {
        id: 'che-stoos-panoramic',
        filename: 'IMG_20250712_154303.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/suisse/IMG_20250712_154303.jpg',
        location: 'Stoos, Schwyz',
        date: '2025-07-12',
        suggestedAnecdote: 'Panorama alpin le long du sentier de crête reliant le Klingenstock au Fronalpstock.',
        albumLink: 'https://www.heldonica.fr/destinations/suisse',
      },
      {
        id: 'che-sunset-peaks',
        filename: 'AGC_20250712_194042959.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/suisse/AGC_20250712_194042959.jpg',
        location: 'Stoos, Fronalpstock',
        date: '2025-07-12',
        suggestedAnecdote: 'Dernières lueurs du soleil couchant embrasant les sommets des Alpes uranaises.',
        albumLink: 'https://www.heldonica.fr/destinations/suisse',
      },
      {
        id: 'che-twilight-hike',
        filename: 'AGC_20250712_220701363.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/suisse/AGC_20250712_220701363.jpg',
        location: 'Muotathal, Stoos',
        date: '2025-07-12',
        suggestedAnecdote: 'Descente nocturne dans le silence complet des alpages au-dessus de la vallée de Muotathal.',
        albumLink: 'https://www.heldonica.fr/destinations/suisse',
      },
    ],
  },
  {
    id: 'madere-automne-2024',
    title: '🇵🇹 Madère — Fanal, Achadas da Cruz & Ponta do Sol',
    destination: 'madere',
    period: 'Octobre 2024',
    albumLink: 'https://www.heldonica.fr/destinations/madere',
    photosCount: 5,
    coverImageUrl: 'https://www.heldonica.fr/images/destinations/madere/fanal_foret.jpg',
    photos: [
      {
        id: 'mad-fanal-laurisilva',
        filename: 'fanal_foret.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/madere/fanal_foret.jpg',
        location: 'Forêt de Fanal, Madère',
        date: '2024-10-14',
        suggestedAnecdote: 'Brume matinale enveloppant les lauriers centenaires de la forêt primaire de Fanal.',
        albumLink: 'https://www.heldonica.fr/destinations/madere',
      },
      {
        id: 'mad-achadas-telepherique',
        filename: 'achadas_da_cruz.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/madere/achadas_da_cruz.jpg',
        location: 'Achadas da Cruz, Madère',
        date: '2024-10-15',
        suggestedAnecdote: 'Le téléphérique vertigineux plongeant vers la fajã isolée battue par l\'océan Atlantique.',
        albumLink: 'https://www.heldonica.fr/destinations/madere',
      },
      {
        id: 'mad-ponta-do-sol-pier',
        filename: 'ponta_do_sol.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/madere/ponta_do_sol.jpg',
        location: 'Ponta do Sol, Madère',
        date: '2024-10-16',
        suggestedAnecdote: 'Le vieux pont en pierre s\'avançant dans les vagues à la pointe la plus ensoleillée de l\'île.',
        albumLink: 'https://www.heldonica.fr/destinations/madere',
      },
      {
        id: 'mad-pico-arieiro-clouds',
        filename: 'pico_do_arieiro.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/madere/pico_do_arieiro.jpg',
        location: 'Pico do Arieiro, Madère',
        date: '2024-10-17',
        suggestedAnecdote: 'Mer de nuages à 1818 mètres d\'altitude au petit matin avant le départ de la randonnée.',
        albumLink: 'https://www.heldonica.fr/destinations/madere',
      },
      {
        id: 'mad-porto-moniz-pools',
        filename: 'porto_moniz.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/madere/porto_moniz.jpg',
        location: 'Porto Moniz, Madère',
        date: '2024-10-18',
        suggestedAnecdote: 'Piscines naturelles volcaniques sculptées par la lave et revigorées par les marées.',
        albumLink: 'https://www.heldonica.fr/destinations/madere',
      },
    ],
  },
  {
    id: 'roumanie-aout-2026',
    title: '🇷🇴 Roumanie — Bucarest & Transylvanie',
    destination: 'roumanie',
    period: 'Août 2026',
    albumLink: 'https://www.heldonica.fr/destinations/roumanie',
    photosCount: 4,
    coverImageUrl: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135023.jpg',
    photos: [
      {
        id: 'rou-street-heritage-1',
        filename: 'IMG_20260827_135023.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135023.jpg',
        location: 'Bucarest, Roumanie',
        date: '2026-08-27',
        suggestedAnecdote: 'Exploration à pied des façades d\'époque et cours arborées du centre historique.',
        albumLink: 'https://www.heldonica.fr/destinations/roumanie',
      },
      {
        id: 'rou-street-heritage-2',
        filename: 'IMG_20260827_135025.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135025.jpg',
        location: 'Bucarest, Roumanie',
        date: '2026-08-27',
        suggestedAnecdote: 'Détail architectural préservé dans les ruelles calmes de la capitale roumaine.',
        albumLink: 'https://www.heldonica.fr/destinations/roumanie',
      },
      {
        id: 'rou-afternoon-cafe',
        filename: 'IMG_20260827_135618.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135618.jpg',
        location: 'Bucarest, Roumanie',
        date: '2026-08-27',
        suggestedAnecdote: 'Pause café dans une cour intérieure préservée de l\'agitation estivale.',
        albumLink: 'https://www.heldonica.fr/destinations/roumanie',
      },
      {
        id: 'rou-passage-walk',
        filename: 'IMG_20260827_135834.jpg',
        imageUrl: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135834.jpg',
        location: 'Bucarest, Roumanie',
        date: '2026-08-27',
        suggestedAnecdote: 'Passage piéton couvert et lumière tamisée au cœur de la vieille ville.',
        albumLink: 'https://www.heldonica.fr/destinations/roumanie',
      },
    ],
  },
];

/**
 * Récupère tous les albums vérifiés.
 */
export function getVerifiedPhotoAlbums(): PhotoEvidenceAlbum[] {
  return VERIFIED_PHOTO_ALBUMS;
}

/**
 * Récupère un album vérifié par son identifiant.
 */
export function getVerifiedAlbumById(albumId: string): PhotoEvidenceAlbum | undefined {
  return VERIFIED_PHOTO_ALBUMS.find((a) => a.id === albumId);
}

/**
 * Recherche des photos vérifiées par mot-clé (lieu, destination ou anecdote).
 */
export function searchVerifiedPhotos(query: string): PhotoEvidenceItem[] {
  if (!query || !query.trim()) {
    return VERIFIED_PHOTO_ALBUMS.flatMap((a) => a.photos);
  }
  const clean = query.trim().toLowerCase();
  const results: PhotoEvidenceItem[] = [];

  for (const album of VERIFIED_PHOTO_ALBUMS) {
    if (album.title.toLowerCase().includes(clean) || album.destination.toLowerCase().includes(clean)) {
      results.push(...album.photos);
      continue;
    }
    for (const photo of album.photos) {
      if (
        photo.location.toLowerCase().includes(clean) ||
        photo.suggestedAnecdote.toLowerCase().includes(clean) ||
        photo.filename.toLowerCase().includes(clean)
      ) {
        results.push(photo);
      }
    }
  }

  // Dédupliquer par id
  const seen = new Set<string>();
  return results.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}
