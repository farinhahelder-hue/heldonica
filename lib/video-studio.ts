// Video Studio configuration and utilities
// Centralized configuration for all video studio modules

export interface StudioModule {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  features: string[];
  route: string;
}

export const STUDIO_MODULES: StudioModule[] = [
  {
    id: 'editor',
    label: 'Éditeur Timeline',
    description: 'Monter des vlogs de voyage',
    icon: 'Film',
    href: '/panel-manager/video',
    color: '#6b2a1a',
    features: ['Multi-piste', 'Color grading', 'Text overlays', 'Export 9:16'],
    route: 'video',
  },
  {
    id: 'subtitles',
    label: 'Sous-titres IA',
    description: 'Accessibilité + engagement',
    icon: 'Type',
    href: '/panel-manager/subtitles',
    color: '#2563eb',
    features: ['Transcription Whisper', 'Correction vocabulaire', 'Export SRT'],
    route: 'subtitles',
  },
  {
    id: 'auto-shorts',
    label: 'Auto-Shorts',
    description: 'Recycler les vlogs en Reels',
    icon: 'Zap',
    href: '/panel-manager/auto-shorts',
    color: '#9333ea',
    features: ['Analyse IA', 'Captions auto', 'Hashtags', 'Intro/outro branded'],
    route: 'auto-shorts',
  },
  {
    id: 'fast-trim',
    label: 'Découpe Rapide',
    description: 'Extraire les meilleures scènes',
    icon: 'Scissors',
    href: '/panel-manager/fast-trim',
    color: '#059669',
    features: ['Lossless cutting', 'Marqueurs IN/OUT', 'Batch processing'],
    route: 'fast-trim',
  },
];

// Main studio hub route
export const STUDIO_HUB_ROUTE = '/panel-manager/studio-video';

// Get module by route
export function getModuleByRoute(route: string): StudioModule | undefined {
  return STUDIO_MODULES.find(m => m.route === route || m.href.includes(route));
}

// Get module by ID
export function getModuleById(id: string): StudioModule | undefined {
  return STUDIO_MODULES.find(m => m.id === id);
}

// Get all studio routes
export function getStudioRoutes(): string[] {
  return STUDIO_MODULES.map(m => m.href);
}

// Check if a path is a studio route
export function isStudioRoute(path: string): boolean {
  return STUDIO_MODULES.some(m => path.startsWith(m.href));
}

// Design tokens for video studio
export const VIDEO_STUDIO_TOKENS = {
  colors: {
    primary: '#6b2a1a',
    secondary: '#83C5BE',
    background: '#f5f3ef',
    surface: '#ffffff',
    border: '#e0dbd5',
    text: '#302925',
    textMuted: '#6d625a',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.35rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
} as const;

// Platform-specific export formats
export const EXPORT_FORMATS = {
  instagram: {
    reels: { width: 1080, height: 1920, aspect: '9:16', label: 'Reels' },
    feedSquare: { width: 1080, height: 1080, aspect: '1:1', label: 'Feed Carré' },
    feedLandscape: { width: 1080, height: 566, aspect: '16:9', label: 'Feed Paysage' },
    story: { width: 1080, height: 1920, aspect: '9:16', label: 'Story' },
  },
  tiktok: {
    video: { width: 1080, height: 1920, aspect: '9:16', label: 'Vidéo' },
  },
  youtube: {
    shorts: { width: 1080, height: 1920, aspect: '9:16', label: 'Shorts' },
    standard: { width: 1920, height: 1080, aspect: '16:9', label: 'Standard' },
  },
} as const;

// Media library configuration
export const MEDIA_LIBRARY_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedTypes: {
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  thumbnailSize: { width: 160, height: 90 },
  gridColumns: { mobile: 2, tablet: 3, desktop: 4 },
} as const;

// Keyboard shortcuts
export const STUDIO_SHORTCUTS = {
  global: {
    save: 'Ctrl+S',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Shift+Z',
    preview: 'Space',
  },
  timeline: {
    zoomIn: '=',
    zoomOut: '-',
    deleteClip: 'Delete',
    splitClip: 'S',
    addMarker: 'M',
  },
  subtitles: {
    setIn: 'I',
    setOut: 'O',
    addSubtitle: 'Enter',
  },
} as const;