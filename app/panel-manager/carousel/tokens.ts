/**
 * Design tokens Heldonica pour le carrousel Instagram
 */

export interface PaletteEntry {
  name: string
  bg: string
  text: string
  accent: string
}

export const HELDONICA_TOKENS = {
  colors: {
    background: '#f8f6f4',
    backgroundAlt: '#ffffff',
    primary: '#6b2a1a',       // Warm Mahogany
    secondary: '#83C5BE',     // Teal
    accent: '#4a7c59',        // Eucalyptus
    text: '#2d2926',
    textLight: '#6b6560',
    border: '#e8e4e0',
    overlay: 'rgba(107, 42, 26, 0.85)',
  },
  fonts: {
    title: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, sans-serif",
  },
  style: {
    borderRadius: '16px',
    borderRadiusSm: '8px',
    shadow: '0 4px 24px rgba(0,0,0,0.08)',
    shadowHover: '0 8px 32px rgba(0,0,0,0.12)',
  },
  keywords: ['slow travel', 'éco-luxe', 'couple', 'hors sentiers battus', 'authenticité', 'voyage responsable'],
  aspectRatios: {
    square: { width: 1080, height: 1080, label: 'Carré' },
    portrait: { width: 1080, height: 1350, label: 'Portrait' },
    story: { width: 1080, height: 1920, label: 'Story/Reel' },
  },
  // Preset color palettes for slides
  palettes: [
    { name: 'Warm Mahogany', bg: '#f8f6f4', text: '#2d2926', accent: '#6b2a1a' },
    { name: 'Teal Dreams', bg: '#e8f5f3', text: '#1a3a38', accent: '#83C5BE' },
    { name: 'Forest', bg: '#f0f5f1', text: '#2d3a2e', accent: '#4a7c59' },
    { name: 'Sunset', bg: '#fdf5f0', text: '#4a2a1a', accent: '#d4a574' },
    { name: 'Ocean', bg: '#f0f7f8', text: '#1a3a4a', accent: '#4a9ebb' },
    { name: 'Minimal', bg: '#ffffff', text: '#2d2926', accent: '#6b2a1a' },
  ] as PaletteEntry[],
} as const

export type AspectRatio = keyof typeof HELDONICA_TOKENS.aspectRatios

export interface SlideData {
  id: string
  title: string
  content: string
  cta?: string
  image?: string
  backgroundColor?: string
  textColor?: string
  fontSize?: 'sm' | 'md' | 'lg'
}

export interface CarouselData {
  id: string
  title: string
  slides: SlideData[]
  aspectRatio: AspectRatio
  brandOverlay: boolean
  faceless: boolean
  createdAt: string
}

// Brand configuration for carousel
export interface BrandConfig {
  name: string
  colors: {
    background: string
    primary: string
    secondary: string
    accent: string
    text: string
  }
  fonts: {
    title: string
    body: string
  }
  keywords: string[]
  logoUrl?: string
  logoPosition?: 'bottom-left' | 'bottom-right' | 'bottom-center'
  defaultHashtags?: string
  faceless: boolean
}

// Default Heldonica brand config
export const HELDONICA_BRAND: BrandConfig = {
  name: 'Heldonica',
  colors: {
    background: '#f8f6f4',
    primary: '#6b2a1a',
    secondary: '#83C5BE',
    accent: '#4a7c59',
    text: '#2d2926',
  },
  fonts: {
    title: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, sans-serif",
  },
  keywords: ['slow travel', 'éco-luxe', 'couple', 'hors sentiers battus', 'authenticité', 'voyage responsable'],
  logoUrl: '/logo.png',
  logoPosition: 'bottom-left',
  defaultHashtags: '#slowtravel #heldonica #pepite',
  faceless: true,
}

// Prompt templates for AI generation
export const PROMPT_TEMPLATES = {
  destinations: [
    "Crée un carrousel {n} slides sur {destination}",
    "Top {n} endroits pour {activity} à {destination}",
    "{n} bonnes raisons de visiter {destination}",
    "Comment explorer {destination} en mode slow travel",
  ],
  tips: [
    "{n} conseils pour {topic}",
    "Les secrets de {topic} que personne ne vous dit",
    "Guide complet : {topic} pour débutants",
    "{n} erreurs à éviter sur {topic}",
  ],
  romantic: [
    "{n} escapades romantiques pour couples",
    "Week-end en amoureux : {destination}",
    "Voyage à deux : {n} destinations",
    "{n} expériences couple à {destination}",
  ],
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}
