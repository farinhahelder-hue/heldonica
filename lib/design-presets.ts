export type DesignPreset = {
  id: string;
  name: string;
  description: string;
  colors: {
    primary_color: string;
    secondary_color: string;
    color_accent: string;
    color_background: string;
    color_text: string;
  };
  fonts: {
    font_heading: string;
    font_body: string;
  };
  css: string;
};

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    description: 'Classique Heldonica — vert têtène, bleu doux',
    colors: {
      primary_color: '#006D77',
      secondary_color: '#83C5BE',
      color_accent: '#E29578',
      color_background: '#F8F5F0',
      color_text: '#1A1A1A',
    },
    fonts: {
      font_heading: 'Playfair Display',
      font_body: 'DM Sans',
    },
    css: `
--border-radius-sm: 6px;
--border-radius-md: 12px;
--border-radius-lg: 20px;
--border-radius-full: 9999px;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.10);
--spacing-section: 5rem;
--button-style: rounded;
--header-style: classic;
--card-style: rounded;
--hero-style: full;
`.trim(),
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Chaud et accueillant — orange terreux, crème',
    colors: {
      primary_color: '#C4714A',
      secondary_color: '#E8C9B0',
      color_accent: '#6B2A1A',
      color_background: '#FDF8F4',
      color_text: '#2C2220',
    },
    fonts: {
      font_heading: 'Cormorant Garamond',
      font_body: 'DM Sans',
    },
    css: `
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 16px;
--border-radius-full: 9999px;
--shadow-sm: 0 2px 6px rgba(0,0,0,0.08);
--shadow-md: 0 6px 20px rgba(0,0,0,0.10);
--shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
--spacing-section: 6rem;
--button-style: pill;
--header-style: elegant;
--card-style: rounded;
--hero-style: minimal;
`.trim(),
  },
  {
    id: 'ocean',
    name: 'Océan',
    description: 'Frais et apaisant — bleu profond, turquoise',
    colors: {
      primary_color: '#1A5F7A',
      secondary_color: '#57B8C8',
      color_accent: '#F2A65A',
      color_background: '#F4F9FC',
      color_text: '#1C2E36',
    },
    fonts: {
      font_heading: 'Lora',
      font_body: 'Inter',
    },
    css: `
--border-radius-sm: 8px;
--border-radius-md: 16px;
--border-radius-lg: 24px;
--border-radius-full: 9999px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
--shadow-md: 0 8px 24px rgba(0,0,0,0.07);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.09);
--spacing-section: 5rem;
--button-style: rounded;
--header-style: transparent;
--card-style: rounded;
--hero-style: full;
`.trim(),
  },
  {
    id: 'forest',
    name: 'Forêt',
    description: 'Naturel et organique — vert sapin, olive',
    colors: {
      primary_color: '#3A5A40',
      secondary_color: '#A3B18A',
      color_accent: '#DDA15E',
      color_background: '#F6F8F4',
      color_text: '#1A1F18',
    },
    fonts: {
      font_heading: 'Cormorant',
      font_body: 'Source Sans 3',
    },
    css: `
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-full: 9999px;
--shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
--shadow-md: 0 4px 16px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.10);
--spacing-section: 4rem;
--button-style: square;
--header-style: classic;
--card-style: square;
--hero-style: split;
`.trim(),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Épuré et moderne — noir, blanc, gris',
    colors: {
      primary_color: '#2D2D2D',
      secondary_color: '#8C8C8C',
      color_accent: '#B0A8A0',
      color_background: '#FAFAF8',
      color_text: '#1A1A1A',
    },
    fonts: {
      font_heading: 'Inter',
      font_body: 'Inter',
    },
    css: `
--border-radius-sm: 0px;
--border-radius-md: 0px;
--border-radius-lg: 0px;
--border-radius-full: 0px;
--shadow-sm: none;
--shadow-md: none;
--shadow-lg: none;
--spacing-section: 5rem;
--button-style: square;
--header-style: minimal;
--card-style: square;
--hero-style: minimal;
`.trim(),
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Romanesque et chaleureux — cramoisi, cuivre',
    colors: {
      primary_color: '#8B3A3A',
      secondary_color: '#CD9777',
      color_accent: '#6B4F3A',
      color_background: '#F9F5F0',
      color_text: '#2B1E16',
    },
    fonts: {
      font_heading: 'Libre Baskerville',
      font_body: 'Raleway',
    },
    css: `
--border-radius-sm: 2px;
--border-radius-md: 6px;
--border-radius-lg: 10px;
--border-radius-full: 9999px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.10);
--shadow-md: 0 6px 24px rgba(0,0,0,0.12);
--shadow-lg: 0 12px 48px rgba(0,0,0,0.15);
--spacing-section: 6rem;
--button-style: pill;
--header-style: elegant;
--card-style: rounded;
--hero-style: full;
`.trim(),
  },
];
