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
};

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    description: 'Classique Heldonica — vert têtène, bleu doux',
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
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Chaud et accueillant — orange terreux, crème',
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
  },
  {
    id: 'ocean',
    name: 'Océan',
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
  },
  {
    id: 'forest',
    name: 'Forêt',
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
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Épuré et moderne — noir, blanc, gris',
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
  },
];
