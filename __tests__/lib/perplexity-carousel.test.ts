import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildCarouselPrompt,
  CAROUSEL_TEMPLATES,
  openPerplexityForCarousel
} from '../../lib/perplexity-carousel';

describe('Perplexity Carousel Generator', () => {
  describe('buildCarouselPrompt', () => {
    it('should generate a prompt with the correct topic and default slide count of 5', () => {
      const topic = 'Astuces de voyage';
      const result = buildCarouselPrompt(topic);

      expect(result).toContain(`Je veux créer un carrousel Instagram sur le sujet: "${topic}".`);
      expect(result).toContain('Le carrousel doit faire exactement 5 slides.');
      expect(result).toContain('Format JSON (sans code blocks):');
    });

    it('should generate a prompt with the correct topic and a custom slide count', () => {
      const topic = 'Destinations secrètes';
      const slideCount = 8;
      const result = buildCarouselPrompt(topic, slideCount);

      expect(result).toContain(`Je veux créer un carrousel Instagram sur le sujet: "${topic}".`);
      expect(result).toContain(`Le carrousel doit faire exactement ${slideCount} slides.`);
    });

    it('should include the required JSON format instructions in the prompt', () => {
      const result = buildCarouselPrompt('Test topic');

      expect(result).toContain('- Un titre court et accrocheur');
      expect(result).toContain('- 2-3 phrases de contenu pertinent');
      expect(result).toContain('- Un mot-clé pour l\'image Unsplash associée');
      expect(result).toContain('"title": "Titre principal du carrousel"');
      expect(result).toContain('"slides": [');
      expect(result).toContain('"callToAction": "CTA final"');
    });
  });

  describe('CAROUSEL_TEMPLATES', () => {
    it('should generate correct structure for fiveTips template', () => {
      const topic = 'Productivity Hacks';
      const result = CAROUSEL_TEMPLATES.fiveTips.generate(topic);

      expect(result.title).toBe(topic);
      expect(result.slides).toHaveLength(5);
      expect(result.slides[0].title).toBe('Tip 1');
      expect(result.slides[4].title).toBe('Tip 5');
      expect(result.callToAction).toBe('Save for plus tard! 📌');
    });

    it('should generate correct structure for quote template', () => {
      const topic = 'Inspirational Quote';
      const result = CAROUSEL_TEMPLATES.quote.generate(topic);

      expect(result.title).toBe(topic);
      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].title).toBe('Citation');
      expect(result.slides[1].title).toBe('Auteur');
      expect(result.callToAction).toBe('Partage! 📤');
    });

    it('should generate correct structure for announcement template', () => {
      const topic = 'New Feature Release';
      const result = CAROUSEL_TEMPLATES.announcement.generate(topic);

      expect(result.title).toBe(topic);
      expect(result.slides).toHaveLength(3);
      expect(result.slides[0].title).toBe('Nouveau!');
      expect(result.slides[1].title).toBe('Détails');
      expect(result.slides[2].title).toBe('Action');
      expect(result.callToAction).toBe('Découvrir →');
    });
  });

  describe('openPerplexityForCarousel', () => {
    beforeEach(() => {
      // Mock window.open
      vi.stubGlobal('window', {
        open: vi.fn(),
      });
    });

    it('should open Perplexity with the correct encoded URL', () => {
      const topic = 'Test Topic';
      const expectedPrompt = buildCarouselPrompt(topic);
      const expectedEncoded = encodeURIComponent(expectedPrompt);

      openPerplexityForCarousel(topic);

      expect(window.open).toHaveBeenCalledWith(
        `https://perplexity.ai/?q=${expectedEncoded}`,
        '_blank'
      );
    });
  });
});
