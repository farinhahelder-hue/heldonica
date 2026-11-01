import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cloud-dancer': 'color-mix(in srgb, var(--color-background, #F8F6F2) calc(<alpha-value> * 100%), transparent)',
        'eucalyptus': 'color-mix(in srgb, var(--color-primary, #006D77) calc(<alpha-value> * 100%), transparent)',
        'teal': 'color-mix(in srgb, var(--color-secondary, #4ECDC4) calc(<alpha-value> * 100%), transparent)',
        // Couleur des titres, présente dans 73 fichiers. Elle passe par --color-heading
        // tout en supportant les modificateurs d'opacité Tailwind (/10, /80…) via color-mix.
        'mahogany': 'color-mix(in srgb, var(--color-heading, #6B2D1F) calc(<alpha-value> * 100%), transparent)',
        'charcoal': 'color-mix(in srgb, var(--color-text, #2C2C2C) calc(<alpha-value> * 100%), transparent)',
        // Seule couleur des boutons d'action (« Préparer un voyage », envoyer un
        // formulaire…). Distincte de `mahogany`, qui suit la couleur des titres :
        // changer l'accent d'action se fait ici, sans toucher aux titres.
        'action': {
          DEFAULT: 'color-mix(in srgb, var(--color-action, #6B2D1F) calc(<alpha-value> * 100%), transparent)',
          fonce: 'color-mix(in srgb, var(--color-action-fonce, #4F2016) calc(<alpha-value> * 100%), transparent)',
        },
        // Stitch Redesign — Palette Terracotta, Azure & Papier Coton
        'terracotta': {
          DEFAULT: '#9A442D',
          light: '#E07A5F',
          dark: '#7C2E19',
        },
        'azure': {
          DEFAULT: '#4F5F79',
          dark: '#1D2D44',
          light: '#D0E0FF',
        },
        'warm-sand': '#F4F1DE',
        'alabaster': '#FAF9F5',
      },
      fontFamily: {
        serif: ['var(--font-heading, "Playfair Display")', 'Georgia', 'serif'],
        sans: ['var(--font-body, "DM Sans")', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'section': '80px',
      },
      maxWidth: {
        'container': '1400px',
      },
    },
  },
  plugins: [],
}
export default config
