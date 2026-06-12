/**
 * Design tokens Heldonica pour le carrousel Instagram
 */
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