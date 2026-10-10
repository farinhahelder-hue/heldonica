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
  | 'photo_evidence';

export type BlockSpacing = 'compact' | 'normal' | 'relaxed';
export type BlockTheme = 'default' | 'sand' | 'dark' | 'gold_accent';

export interface BaseBlock {
  id: string; // Identifiant unique (ex: blk_xyz123)
  type: BlockType;
  spacing?: BlockSpacing;
  theme?: BlockTheme;
}

// 1. Bloc Texte libre & paragraphe
export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string; // Supporte HTML sain ou Markdown
}

// 2. Bloc Titre
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
  subtitle?: string;
}

// 3. Bloc Image unique
export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
  layout: 'inline' | 'wide' | 'fullwidth';
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}

// 4. Bloc Galerie & Carrousel photo
export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
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
  | PhotoEvidenceBlock;

/**
 * Crée un bloc par défaut selon son type.
 */
export function createDefaultBlock(type: BlockType): CmsBlock {
  const id = `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, text: 'Nouveau titre de section' };
    case 'text':
      return { id, type: 'text', content: 'Écrivez votre paragraphe ici...' };
    case 'image':
      return { id, type: 'image', url: '', alt: '', layout: 'wide', aspectRatio: '16:9' };
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
      return { id, type: 'photo_evidence', imageUrl: '', location: '', date: '', anecdote: '' };
  }
}
