import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotPicker } from '@/components/admin/media/HotspotPicker';
import { ImageBlock } from '@/components/blocks/ImageBlock';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { OmnisearchPalette } from '@/components/admin/OmnisearchPalette';
import { BlockCanvas } from '@/components/admin/blocks/BlockCanvas';
import { blocksToHtml, htmlToBlocks } from '@/lib/cms-blocks-converter';
import type { ImageBlock as ImageBlockType, CmsBlock } from '@/types/cms-blocks';

describe('CMS 3.0 Sanity Killer — Hotspot & Visual Click-to-Edit', () => {
  it('HotspotPicker affiche les presets et déclenche onChange lors d’un clic', () => {
    const onChange = vi.fn();
    render(
      <HotspotPicker
        imageUrl="https://heldonica.fr/test.jpg"
        hotspot={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />
    );

    // Vérifie la présence des coordonnées de départ
    expect(screen.getByText(/X: 50% • Y: 50%/i)).toBeDefined();

    // Clic sur le preset "Sommet / Ciel"
    const sommetBtn = screen.getByText(/Sommet \/ Ciel/i);
    fireEvent.click(sommetBtn);

    expect(onChange).toHaveBeenCalledWith({ x: 0.5, y: 0.15 });
  });

  it('ImageBlock applique object-position dynamique selon le point focal', () => {
    const block: ImageBlockType = {
      id: 'blk_img_1',
      type: 'image',
      url: 'https://heldonica.fr/montagne.jpg',
      alt: 'Montagne brumeuse',
      layout: 'wide',
      aspectRatio: '16:9',
      hotspot: { x: 0.3, y: 0.15 },
    };

    const { container } = render(<ImageBlock block={block} />);
    const img = container.querySelector('img');
    expect(img).toBeDefined();
    expect(img?.style.objectPosition).toBe('30% 15%');
  });

  it('BlockRenderer en mode interactivePreview active le Click-to-Edit sur chaque bloc', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk_text_1',
        type: 'text',
        content: 'Un sentier de fougères et de brume.',
      },
    ];
    const onSelect = vi.fn();

    const { container } = render(
      <BlockRenderer
        blocks={blocks}
        interactivePreview={true}
        selectedBlockId="blk_text_1"
        onSelectBlock={onSelect}
      />
    );

    const interactiveWrapper = container.querySelector('[data-cms-block-id="blk_text_1"]');
    expect(interactiveWrapper).toBeDefined();

    // Clic sur le bloc dans la prévisualisation
    fireEvent.click(interactiveWrapper!);
    expect(onSelect).toHaveBeenCalledWith('blk_text_1');
  });

  it('Sérialisation lossless de l’image avec Hotspot dans blocksToHtml et restauration complète', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk_img_focal',
        type: 'image',
        url: 'https://heldonica.fr/falaise.jpg',
        alt: 'Falaises de basalte',
        layout: 'wide',
        aspectRatio: '16:9',
        hotspot: { x: 0.7, y: 0.25 },
      },
    ];

    const html = blocksToHtml(blocks);
    expect(html).toContain('object-position: 70% 25%');

    // Restauration via htmlToBlocks
    const restored = htmlToBlocks(html);
    expect(restored).toHaveLength(1);
    expect(restored[0].type).toBe('image');
    const restoredImg = restored[0] as ImageBlockType;
    expect(restoredImg.hotspot).toEqual({ x: 0.7, y: 0.25 });
  });

  it('OmnisearchPalette filtre par mot-clé et insère une pépite du Coffre RAG', () => {
    const onInsertVaultSpot = vi.fn();
    const onClose = vi.fn();

    render(
      <OmnisearchPalette
        isOpen={true}
        onClose={onClose}
        onInsertVaultSpot={onInsertVaultSpot}
        articles={[{ id: 1, title: 'Guide Madère', slug: 'madere' }]}
      />
    );

    const input = screen.getByPlaceholderText(/Rechercher partout/i);
    expect(input).toBeDefined();

    // Filtre par "Stoos"
    fireEvent.change(input, { target: { value: 'Stoos' } });

    // Vérifie la présence d'un spot RAG contenant Stoos
    const spotElements = screen.getAllByText(/Stoos/i);
    expect(spotElements.length).toBeGreaterThan(0);

    fireEvent.click(spotElements[0]);
    expect(onInsertVaultSpot).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('BlockCanvas propose l’insertion de bloc intermédiaire (InserterDivider)', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'b_head', type: 'heading', level: 2, text: 'Premier bloc' },
      { id: 'b_text', type: 'text', content: 'Deuxième bloc' },
    ];
    const onChange = vi.fn();

    render(
      <BlockCanvas
        blocks={initialBlocks}
        onChange={onChange}
      />
    );

    // Les boutons d'insertion intermédiaire sont présents
    const insertButtons = screen.getAllByRole('button', { name: /Insérer un bloc/i });
    expect(insertButtons.length).toBeGreaterThanOrEqual(2);

    // Clic sur le premier inserter pour ouvrir le menu
    fireEvent.click(insertButtons[0]);

    // Sélectionne un type de bloc (Image)
    const addImageBtn = screen.getByRole('button', { name: /Image Photo responsive/i });
    fireEvent.click(addImageBtn);

    expect(onChange).toHaveBeenCalled();
    const newBlocksArg = onChange.mock.calls[0][0];
    expect(newBlocksArg).toHaveLength(3);
    expect(newBlocksArg[0].type).toBe('image');
  });
});
