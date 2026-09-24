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
        'cloud-dancer': 'var(--color-background, #F8F6F2)',
        'eucalyptus': 'var(--color-primary, #006D77)',
        'teal': 'var(--color-secondary, #4ECDC4)',
        // Couleur des titres, présente dans 73 fichiers. Elle était la seule du
        // thème sans variable CSS : la changer depuis le CMS n'avait aucun effet.
        // Le repli conserve la teinte historique pour les rendus hors thème.
        'mahogany': 'var(--color-heading, #6B2D1F)',
        'charcoal': 'var(--color-text, #2C2C2C)',
      },
      fontFamily: {
        serif: ['var(--font-heading, Playfair Display)', 'serif'],
        sans: ['var(--font-body, Inter)', 'sans-serif'],
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
