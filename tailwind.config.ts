import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cloud-dancer': '#F8F6F2',
        'eucalyptus': '#006D77',
        'teal': '#4ECDC4',
        'mahogany': '#6B2D1F',
        'charcoal': '#2C2C2C',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
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
