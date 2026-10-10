import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { slugify, TableOfContentsBlock } from '../../components/blocks/TableOfContentsBlock';
import type { CmsBlock, HeadingBlock, TableOfContentsBlock as TOCBlockType } from '@/types/cms-blocks';

describe('TableOfContentsBlock', () => {
  describe('slugify', () => {
    it('generates standard kebab-case anchors', () => {
      expect(slugify("Hello World!")).toBe("hello-world");
    });

    it('removes accents correctly', () => {
      expect(slugify("Élève modèle, 20% !")).toBe("eleve-modele-20");
    });

    it('handles multiple spaces and special characters', () => {
      expect(slugify("   Mon   titre  --- super   !!!")).toBe("mon-titre-super");
    });
  });

  describe('Component rendering and maxLevel filtering', () => {
    const mockAllBlocks: CmsBlock[] = [
      { id: '1', type: 'heading', level: 2, text: 'H2 Section' } as HeadingBlock,
      { id: '2', type: 'text', content: 'Some text' } as CmsBlock,
      { id: '3', type: 'heading', level: 3, text: 'H3 Subsection' } as HeadingBlock,
      { id: '4', type: 'heading', level: 4, text: 'H4 Sub-subsection' } as HeadingBlock,
    ];

    it('filters out h3 and h4 when maxLevel is 2', () => {
      const block: TOCBlockType = { id: 'toc1', type: 'table_of_contents', maxLevel: 2, title: 'Sommaire' };
      render(<TableOfContentsBlock block={block} allBlocks={mockAllBlocks} />);
      
      expect(screen.getByText('H2 Section')).toBeTruthy();
      expect(screen.queryByText('H3 Subsection')).toBeNull();
      expect(screen.queryByText('H4 Sub-subsection')).toBeNull();
    });

    it('includes h3 but filters out h4 when maxLevel is 3', () => {
      const block: TOCBlockType = { id: 'toc1', type: 'table_of_contents', maxLevel: 3, title: 'Sommaire' };
      render(<TableOfContentsBlock block={block} allBlocks={mockAllBlocks} />);
      
      expect(screen.getByText('H2 Section')).toBeTruthy();
      expect(screen.getByText('H3 Subsection')).toBeTruthy();
      expect(screen.queryByText('H4 Sub-subsection')).toBeNull();
    });
  });
});
