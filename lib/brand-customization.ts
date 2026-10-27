/**
 * lib/brand-customization.ts
 *
 * Répertoire des combinaisons typographiques et packs d'icônes
 * slow travel pour la personnalisation du site et du CMS Heldonica.
 */

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  letterSpacingHeading?: string;
  tag: string;
}

export interface IconPackPreset {
  id: string;
  name: string;
  description: string;
  strokeWidth: number;
  style: 'hairline' | 'mineral' | 'botanical';
  previewIcons: string[];
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'editorial_heritage',
    name: 'Héritage Éditorial (Défaut)',
    description: 'Playfair Display romain élégant pour les titres et DM Sans moderne pour un confort de lecture optimal.',
    headingFont: 'Playfair Display',
    bodyFont: 'DM Sans',
    monoFont: 'JetBrains Mono',
    letterSpacingHeading: '-0.02em',
    tag: 'Recommandé Heldonica',
  },
  {
    id: 'roman_grandeur',
    name: 'Grand Romain & Alpin',
    description: 'Cormorant Garamond majestueux inspiré des carnets de voyage du XIXe siècle, soutenu par Outfit.',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Outfit',
    monoFont: 'Space Mono',
    tag: 'Monographie & Histoire',
  },
  {
    id: 'poetic_solitude',
    name: 'Solitude Poétique',
    description: 'Lora nuancé et expressif marié à Inter pour les récits d\'immersion dans les faubourgs et fjords.',
    headingFont: 'Lora',
    bodyFont: 'Inter',
    monoFont: 'Courier Prime',
    tag: 'Carnets d’ambiance',
  },
  {
    id: 'austere_mineral',
    name: 'Minéral & Gravure Ancienne',
    description: 'Cinzel inspiré de l\'épigraphie romaine classique et Source Sans 3 pour un dépouillement pur.',
    headingFont: 'Cinzel',
    bodyFont: 'Source Sans 3',
    monoFont: 'Fira Code',
    tag: 'Crêtes & Haute montagne',
  },
];

export const ICON_PACK_PRESETS: IconPackPreset[] = [
  {
    id: 'hairline_artisan',
    name: 'Ligne Fine Artisanale (1.5px)',
    description: 'Tracé précis et délicat à la plume d\'encre, évitant toute surcharge visuelle sur fond papier.',
    strokeWidth: 1.5,
    style: 'hairline',
    previewIcons: ['Compass', 'Camera', 'MapPin', 'Feather', 'ShieldCheck'],
  },
  {
    id: 'mineral_duotone',
    name: 'Minéral & Silhouette (2px)',
    description: 'Lignes affirmées et contrastées idéales pour les cartes de randonnée et interfaces mobiles APK.',
    strokeWidth: 2.0,
    style: 'mineral',
    previewIcons: ['Mountain', 'Footprints', 'Sunrise', 'Train', 'Bookmark'],
  },
  {
    id: 'botanical_seal',
    name: 'Sceau Botanique & Terroir',
    description: 'Formes organiques inspirées de la flore locale (lauriers, oliviers, faïences, reliefs côtiers).',
    strokeWidth: 1.75,
    style: 'botanical',
    previewIcons: ['Sparkles', 'HeartHandshake', 'Trees', 'Wind', 'Coffee'],
  },
];
