import type { Config } from 'tailwindcss'

const config: Config = {
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
        'mahogany': 'var(--color-accent, #6B2D1F)',
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
