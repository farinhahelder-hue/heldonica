import { describe, it, expect } from 'vitest';
import {
  generateLogoSvg,
  generateLogoDataUri,
  type LogoStyle,
} from '@/lib/logo-generator';

describe('Générateur Vectoriel de Sceaux & Logos (lib/logo-generator.ts)', () => {
  const styles: LogoStyle[] = [
    'seal_circular',
    'mountain_crest',
    'compass_rose',
    'minimal_monogram',
  ];

  styles.forEach((style) => {
    it(`génère un SVG valide et complet pour le style ${style}`, () => {
      const svg = generateLogoSvg({
        style,
        brandName: 'HELDONICA',
        subtitle: 'SLOW TRAVEL',
        coordinates: '46.97°N • 8.65°E',
        year: '2026',
        primaryColor: '#241D1A',
        accentColor: '#B8860B',
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('HELDONICA');
      expect(svg).toContain('#241D1A');
    });
  });

  it('génère une Data URI prête pour une balise img ou favicon', () => {
    const uri = generateLogoDataUri({
      style: 'seal_circular',
      brandName: 'HELDONICA',
    });

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(uri).toContain('%3Csvg');
  });
});
