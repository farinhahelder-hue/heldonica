import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import type { CmsBlock } from '@/types/cms-blocks';

describe('BlockRenderer', () => {
  it('returns null when blocks array is empty', () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders heading and text blocks with correct styling and content', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk-h1',
        type: 'heading',
        level: 2,
        text: 'Les Calanques Secrètes',
        theme: 'gold_accent',
        spacing: 'relaxed',
      },
      {
        id: 'blk-p1',
        type: 'text',
        content: 'Le sentier démarre tôt le matin sous la pinède.',
        spacing: 'normal',
      },
    ];

    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByRole('heading', { level: 2, name: /Les Calanques Secrètes/i })).toBeDefined();
    expect(screen.getByText(/Le sentier démarre tôt le matin/i)).toBeDefined();
  });

  it('renders photo_evidence block with anecdote and place', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk-photo-1',
        type: 'photo_evidence',
        imageUrl: 'https://images.unsplash.com/photo-test.jpg',
        location: 'Marseilleveyre',
        date: '2024-05-12',
        anecdote: 'Le mistral s’est calmé net à 19h.',
      },
    ];

    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByText(/Marseilleveyre/i)).toBeDefined();
    expect(screen.getByText(/Le mistral s’est calmé net/i)).toBeDefined();
  });
});
