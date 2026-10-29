/**
 * Heldonica CMS — Types stricts pour le système de blocs modulaires (Page & Block Builder).
 * Règle AGENTS.md : pas de données inventées, typage TypeScript strict.
 */

export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'image' 
  | 'gallery' 
  | 'button' 
  | 'list' 
  | 'video' 
  | 'vault_spot'
  | 'photo_evidence'
  | 'map'
  | 'table_of_contents'
  | 'hospitality_spot';

export type BlockSpacing = 'compact' | 'normal' | 'relaxed';
export type BlockTheme = 'default' | 'sand' | 'dark' | 'gold_accent' | 'terracotta' | 'forest_fog' | 'parchment' | 'chalk';

/** Cadrage intelligent et point focal Sanity-style (x: 0..1, y: 0..1) */
export interface ImageHotspot {
  x: number; // 0 = bord gauche, 0.5 = centre, 1 = bord droit
  y: number; // 0 = sommet/ciel, 0.5 = centre, 1 = bas/sol
}

export interface BaseBlock {
  id: string; // Identifiant unique (ex: blk_xyz123)
  type: BlockType;
  spacing?: BlockSpacing;
  theme?: BlockTheme;
}

// Modèle "Portable Text" à la Sanity : un bloc contient des enfants (spans),
// chaque span porte des marks (annotations) et des markDefs (ex: liens).
export type TextMark = 'strong' | 'em' | 'underline' | 'link' | 'highlight' | 'code' | 'blockquote';

export interface TextSpan {
  text: string;
  marks: TextMark[];
  href?: string; // présent quand 'link' est dans marks
}

export interface LinkMarkDef {
  _type: 'link';
  href: string;
}

export type RichTextBlock =
  | {
      _type: 'block';
      children: TextSpan[];
      markDefs?: LinkMarkDef[];
      style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
    }
  | {
      _type: 'image';
      url: string;
      alt?: string;
      caption?: string;
      hotspot?: ImageHotspot;
    }
  | {
      _type: 'code';
      language?: string;
      code: string;
    }
  | {
      _type: 'list';
      style: 'bullet' | 'number';
      items: TextSpan[][];
    };

// 1. Bloc Texte libre & paragraphe (rich text Portable Text + fallback legacy)
export interface TextBlock extends BaseBlock {
  type: 'text';
  content?: string; // legacy texte plat (rétrocompat)
  richText?: RichTextBlock[]; // Portable Text à la Sanity
}

// 2. Bloc Titre
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
  subtitle?: string;
}

// 3. Bloc Image unique avec Hotspot Sanity-style
export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
  layout: 'inline' | 'wide' | 'fullwidth';
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  hotspot?: ImageHotspot;
}

// 4. Bloc Galerie & Carrousel photo
export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
  hotspot?: ImageHotspot;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  images: GalleryImage[];
  displayMode: 'carousel' | 'grid_2' | 'grid_3' | 'masonry';
}

// 5. Bloc Bouton d'action / Lien
export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  url: string;
  variant: 'primary_gold' | 'outline' | 'subtle';
  openInNewTab?: boolean;
}

// 6. Bloc Liste & Checklist de voyage
export interface ListBlock extends BaseBlock {
  type: 'list';
  items: string[];
  style: 'bullet' | 'numbered' | 'checklist';
}

// 7. Bloc Vidéo & Shorts
export interface VideoBlock extends BaseBlock {
  type: 'video';
  source: 'local' | 'youtube';
  url: string;
  aspectRatio: '16:9' | '9:16'; // 9:16 pour Shorts et Reels
  autoPlay?: boolean;
  caption?: string;
}

// 8. Bloc Pépite relié au Coffre des Savoirs (RAG Heldonica)
export interface VaultSpotBlock extends BaseBlock {
  type: 'vault_spot';
  spotId?: string;
  title: string;
  location: string;
  livedExperience: string; // Anecdote vécue authentique
}

// 9. Bloc Preuve photo avec contexte réel (lieu, date, anecdote, album)
// Charte Heldonica : aucune donnée inventée, tout est affiché depuis le CMS.
export interface PhotoEvidenceBlock extends BaseBlock {
  type: 'photo_evidence';
  imageUrl: string; // URL HTTPS publique (Supabase Storage ou CDN)
  location: string; // Lieu exact vécu, texte brut
  date: string; // ISO 8601 YYYY-MM-DD
  anecdote: string; // Max 200 caractères, vécue et vérifiable
  albumLink?: string; // URL album Google Photos (optionnel)
  hotspot?: ImageHotspot;
  cameraInfo?: string; // Boîtier & Optique réels (ex: Nikon D7200, 35mm f/1.8 DX)
}

// 10. Bloc Carte Interactive de balade et repères
export interface MapBlock extends BaseBlock {
  type: 'map';
  center: { lat: number; lng: number };
  zoom: number; // 1 à 18, défaut 13
  markers: Array<{ id: string; lat: number; lng: number; label: string; description?: string }>;
  caption?: string;
  mapStyle?: 'topo' | 'minimal' | 'voyage';
}

// 11. Bloc Sommaire interactif avec défilement fluide
export interface TableOfContentsBlock extends BaseBlock {
  type: 'table_of_contents';
  title?: string; // Défaut: 'Au fil du carnet'
  maxLevel?: 2 | 3;
  displayStyle?: 'list' | 'numbered' | 'cards'; // Défaut: 'numbered'
}

// 12. Bloc Fiche Hébergement Éthique et Indépendant
export interface HospitalitySpotBlock extends BaseBlock {
  type: 'hospitality_spot';
  name: string;
  location: string;
  hostName?: string;
  ethicalCriteria: {
    localFood: boolean;
    lowCarbonAccess: boolean;
    quietAtmosphere: boolean;
    fairPricing: boolean;
  };
  livedAnecdote?: string;
  directBookingUrl?: string;
  priceIndication?: string;
}

// Union discriminée de tous les blocs disponibles
export type CmsBlock = 
  | TextBlock 
  | HeadingBlock 
  | ImageBlock 
  | GalleryBlock 
  | ButtonBlock 
  | ListBlock 
  | VideoBlock 
  | VaultSpotBlock
  | PhotoEvidenceBlock
  | MapBlock
  | TableOfContentsBlock
  | HospitalitySpotBlock;

/**
 * Crée un bloc par défaut selon son type.
 */
export function createDefaultBlock(type: BlockType): CmsBlock {
  const id = `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, text: 'Nouveau titre de section' };
    case 'text':
      return { id, type: 'text', richText: [{ _type: 'block', children: [{ text: 'Écrivez votre paragraphe ici...', marks: [] }] }] };
    case 'image':
      return { id, type: 'image', url: '', alt: '', layout: 'wide', aspectRatio: '16:9', hotspot: { x: 0.5, y: 0.5 } };
    case 'gallery':
      return { id, type: 'gallery', images: [], displayMode: 'carousel' };
    case 'button':
      return { id, type: 'button', label: 'Découvrir la suite', url: '#', variant: 'primary_gold' };
    case 'list':
      return { id, type: 'list', items: ['Premier élément', 'Deuxième élément'], style: 'bullet' };
    case 'video':
      return { id, type: 'video', source: 'youtube', url: '', aspectRatio: '16:9' };
    case 'vault_spot':
      return { id, type: 'vault_spot', title: 'Pépite dénichée', location: 'Lieu authentique', livedExperience: 'Notre vécu sur place...' };
    case 'photo_evidence':
      return { id, type: 'photo_evidence', imageUrl: '', location: '', date: '', anecdote: '', hotspot: { x: 0.5, y: 0.5 } };
    case 'map':
      return { id, type: 'map', center: { lat: 48.8566, lng: 2.3522 }, zoom: 13, markers: [], mapStyle: 'minimal' };
    case 'table_of_contents':
      return { id, type: 'table_of_contents', title: 'Au fil du carnet', maxLevel: 2, displayStyle: 'numbered' };
    case 'hospitality_spot':
      return {
        id,
        type: 'hospitality_spot',
        name: 'Hébergement',
        location: '',
        ethicalCriteria: {
          localFood: false,
          lowCarbonAccess: false,
          quietAtmosphere: false,
          fairPricing: false,
        },
      };
  }
}

/**
 * Métadonnées de document (niveau page) à la Sanity : titre, slug, statut, date.
 */
export interface DocumentRevision {
  id: string;
  createdAt: string; // ISO 8601
  status: 'draft' | 'review' | 'published';
  title: string;
  blockCount: number;
  snapshot: string; // JSON sérialisé des blocs
}

export interface DocumentMetadata {
  title: string;
  slug: string;
  status: 'draft' | 'review' | 'published';
  publishedAt?: string; // ISO 8601
  author?: string;
  excerpt?: string;
  revisions?: DocumentRevision[];
}

export function createDefaultDocumentMetadata(): DocumentMetadata {
  return {
    title: 'Nouveau carnet',
    slug: 'nouveau-carnet',
    status: 'draft',
  };
}
