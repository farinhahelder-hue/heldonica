import { describe, expect, it } from 'vitest';
import {
  CMS_CONTENT_TYPES,
  getCmsContentType,
  starterContent,
  type CmsContentType,
} from '@/lib/cms-content-types';
import { FORBIDDEN_WORDS } from '@/lib/brand-voice';
import { htmlToBlocks } from '@/lib/cms-blocks-converter';

// Les quatre rubriques du site (CategorySelect.tsx). Un type qui pointe ailleurs
// crée un brouillon dans une rubrique fantôme : ce test le dit avant la prod.
const SITE_CATEGORIES = new Set([
  'Carnets Voyage',
  'Guides Pratiques',
  'Découvertes Locales',
  'Nourriture',
]);

describe('types de contenu CMS', () => {
  it('couvre carnet, guide, adresse et table avec des identifiants uniques', () => {
    const ids = CMS_CONTENT_TYPES.map((type) => type.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['carnet', 'guide', 'adresse', 'table']);
  });

  it('pointe sur des rubriques réelles du site', () => {
    for (const type of CMS_CONTENT_TYPES) {
      expect(SITE_CATEGORIES.has(type.category), `${type.id} → ${type.category}`).toBe(true);
    }
  });

  it('n’emploie aucun mot banni dans les libellés et les sections', () => {
    const texts: string[] = [];
    for (const type of CMS_CONTENT_TYPES) {
      texts.push(type.label, type.summary, ...type.sections, ...type.tags);
    }
    const corpus = texts.join(' ').toLowerCase();
    const found = FORBIDDEN_WORDS.filter((word) => corpus.includes(word.toLowerCase()));
    expect(found).toEqual([]);
  });

  it('pose une structure vide : un titre de section et un paragraphe, jamais de phrase inventée', () => {
    for (const type of CMS_CONTENT_TYPES) {
      const html = starterContent(type);
      const headings = html.match(/<h2>/g) ?? [];
      expect(headings.length).toBe(type.sections.length);
      expect((html.match(/<p><\/p>/g) ?? []).length).toBe(type.sections.length);
      // Hors titres de section et paragraphes vides, il ne reste aucun texte.
      const leftover = html
        .replace(/<h2>[^<]*<\/h2>/g, '')
        .replace(/<p><\/p>/g, '')
        .trim();
      expect(leftover, `${type.id} contient du texte pré-écrit`).toBe('');
    }
  });

  it('échappe les titres de section', () => {
    const hostile: CmsContentType = {
      ...CMS_CONTENT_TYPES[0],
      sections: ['<script>alert(1)</script>'],
    };
    const html = starterContent(hostile);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('se convertit en blocs d’éditeur : un titre par section', () => {
    for (const type of CMS_CONTENT_TYPES) {
      const blocks = htmlToBlocks(starterContent(type));
      const headings = blocks.filter((block) => block.type === 'heading');
      expect(headings.length, `${type.id} → éditeur blocs`).toBe(type.sections.length);
    }
  });

  it('retrouve un type par son identifiant, et rien pour un inconnu', () => {
    expect(getCmsContentType('carnet')?.category).toBe('Carnets Voyage');
    expect(getCmsContentType('podcast')).toBeUndefined();
  });
});
