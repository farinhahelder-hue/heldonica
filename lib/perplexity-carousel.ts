/**
 * Perplexity Carousel Generator
 * 
 * Generates content for Instagram carousels using Perplexity
 */

export interface CarouselSlide {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface CarouselData {
  title: string;
  slides: CarouselSlide[];
  callToAction?: string;
}

/**
 * Default carousel templates
 */
export const CAROUSEL_TEMPLATES = {
  fiveTips: {
    name: '5 Tips',
    generate: (topic: string): CarouselData => ({
      title: topic,
      slides: Array.from({ length: 5 }, (_, i) => ({
        title: `Tip ${i + 1}`,
        content: '',
      })),
      callToAction: 'Save for plus tard! 📌',
    }),
  },
  quote: {
    name: 'Citation',
    generate: (topic: string): CarouselData => ({
      title: topic,
      slides: [
        { title: 'Citation', content: '' },
        { title: 'Auteur', content: '' },
      ],
      callToAction: 'Partage! 📤',
    }),
  },
  announcement: {
    name: 'Annonce',
    generate: (topic: string): CarouselData => ({
      title: topic,
      slides: [
        { title: 'Nouveau!', content: '' },
        { title: 'Détails', content: '' },
        { title: 'Action', content: '' },
      ],
      callToAction: 'Découvrir →',
    }),
  },
};

/**
 * Build Perplexity prompt for carousel content
 */
export function buildCarouselPrompt(topic: string, slideCount = 5): string {
  return `Génère un carrousel Instagram de ${slideCount} slides sur le thème: "${topic}"

Pour chaque slide, fournis:
- Un titre court et accrocheur
- 2-3 phrases de contenu pertinent
- Un mot-clé pour l'image Unsplash associée

Format JSON (sans code blocks):
{
  "title": "Titre principal du carrousel",
  "slides": [
    {"title": "Tip 1", "content": "Descrição", "keyword": "palavra"},
    ...
  ],
  "callToAction": "CTA final"
}`;
}

/**
 * Open Perplexity for carousel generation
 */
export function openPerplexityForCarousel(topic: string): void {
  const prompt = buildCarouselPrompt(topic);
  const encoded = encodeURIComponent(prompt);
  window.open(`https://perplexity.ai/?q=${encoded}`, '_blank');
}