import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockCanvas } from '@/components/admin/blocks/BlockCanvas';
import type { CmsBlock } from '@/types/cms-blocks';

describe('BlockCanvas UI & Interactivity (__tests__/components/BlockCanvas.test.tsx)', () => {
  it('affiche la palette complète et l\'état vide quand aucun bloc n\'est présent', () => {
    const onChange = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={onChange} />);

    expect(screen.getByText('Palette des blocs modulaires')).toBeDefined();
    expect(screen.getByText('📋 Gabarits Slow Travel')).toBeDefined();
    expect(screen.getByText('Aucun bloc pour le moment')).toBeDefined();
  });

  it('affiche les blocs existants avec leurs poignées de déplacement et boutons d\'action', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'blk_1', type: 'heading', level: 1, text: 'Titre de voyage' },
      { id: 'blk_2', type: 'text', content: 'Paragraphe d\'immersion' },
    ];
    const onChange = vi.fn();

    render(<BlockCanvas blocks={initialBlocks} onChange={onChange} />);

    expect(screen.getByDisplayValue('Titre de voyage')).toBeDefined();
    expect(screen.getByDisplayValue("Paragraphe d'immersion")).toBeDefined();
    expect(screen.getAllByTitle('Glisser-déposer pour réorganiser')).toHaveLength(2);
    expect(screen.getAllByTitle('Dupliquer ce bloc')).toHaveLength(2);
  });

  it('duplique un bloc avec un nouvel identifiant unique lors du clic sur le bouton Dupliquer', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'blk_test', type: 'heading', level: 2, text: 'Étape 1' },
    ];
    const onChange = vi.fn();

    render(<BlockCanvas blocks={initialBlocks} onChange={onChange} />);

    const duplicateBtn = screen.getByTitle('Dupliquer ce bloc');
    fireEvent.click(duplicateBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated).toHaveLength(2);
    expect(updated[0].id).toBe('blk_test');
    expect(updated[1].id).not.toBe('blk_test');
    expect(updated[1].text).toBe('Étape 1');
  });

  it('supprime un bloc lors du clic sur le bouton Supprimer', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'blk_del_1', type: 'heading', level: 2, text: 'Premier' },
      { id: 'blk_del_2', type: 'text', content: 'Deuxième' },
    ];
    const onChange = vi.fn();

    render(<BlockCanvas blocks={initialBlocks} onChange={onChange} />);

    const deleteButtons = screen.getAllByLabelText('Supprimer le bloc');
    fireEvent.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith([initialBlocks[1]]);
  });

  it('ouvre le modal des gabarits Slow Travel lors du clic sur le bouton de la palette', () => {
    const onChange = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={onChange} />);

    const tplBtn = screen.getByText('📋 Gabarits Slow Travel');
    fireEvent.click(tplBtn);

    expect(screen.getByText('Gabarits Éditoriaux Slow Travel')).toBeDefined();
    expect(screen.getByText('Carnet d\'immersion lente')).toBeDefined();
  });

  it('affiche le statut Voix 100% Conforme quand le contenu respecte les règles', () => {
    const cleanBlocks: CmsBlock[] = [
      { id: 'b_clean_1', type: 'heading', level: 1, text: 'Matin calme au village' },
      { id: 'b_clean_2', type: 'text', content: 'On a dégusté du fromage fumé au petit matin à notre rythme.' },
    ];
    render(<BlockCanvas blocks={cleanBlocks} onChange={vi.fn()} />);

    expect(screen.getByText(/Voix 100% Conforme/)).toBeDefined();
  });

  it('affiche les alertes de mots bannis et le popover de suggestions en temps réel', () => {
    const dirtyBlocks: CmsBlock[] = [
      { id: 'b_dirty_1', type: 'text', content: 'Voici un super bon plan incontournable pour les voyageurs.' },
    ];
    render(<BlockCanvas blocks={dirtyBlocks} onChange={vi.fn()} />);

    // Badge dans l'en-tête du bloc
    expect(screen.getByText(/Voix \(/)).toBeDefined();
    // Message d'alerte spécifique dans le bloc
    expect(screen.getByText(/Mot banni détecté : "bon plan"/)).toBeDefined();
    expect(screen.getByText(/Suggestion : pépite dénichée/)).toBeDefined();

    // Clic pour ouvrir le popover d'audit global
    const lintBtn = screen.getByTitle('Audit de voix de marque Heldonica en temps réel');
    fireEvent.click(lintBtn);

    expect(screen.getByText('Linter Voix Heldonica')).toBeDefined();
    expect(screen.getByText(/Score actuel :/)).toBeDefined();
    expect(screen.getByText('« bon plan »')).toBeDefined();
  });

  it('permet de choisir un cliché certifié depuis un album de terrain dans le bloc Image', () => {
    const onChange = vi.fn();
    const imageBlocks: CmsBlock[] = [
      { id: 'b_img_1', type: 'image', url: '', alt: '', layout: 'wide' },
    ];
    render(<BlockCanvas blocks={imageBlocks} onChange={onChange} />);

    // Clic sur le bouton de sélection d'album
    const pickerBtn = screen.getByText('📸 Choisir depuis un album de terrain');
    fireEvent.click(pickerBtn);

    // Vérifier l'ouverture du modal
    expect(screen.getByText('Sélectionner une photo certifiée pour le bloc Image')).toBeDefined();
    expect(screen.getByText(/100% de photos réelles vécues/)).toBeDefined();

    // Sélectionner le premier cliché vérifié
    const selectBtns = screen.getAllByText('Sélectionner ce cliché');
    fireEvent.click(selectBtns[0]);

    // Vérifier que le bloc est mis à jour avec les métadonnées réelles
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated[0].url).toContain('https://www.heldonica.fr/images/destinations/');
    expect(updated[0].alt).toBeTruthy();
    expect(updated[0].caption).toBeTruthy();
  });

  it('permet d\'ajouter une photo de terrain certifiée dans une galerie photo', () => {
    const onChange = vi.fn();
    const galleryBlocks: CmsBlock[] = [
      { id: 'b_gal_1', type: 'gallery', images: [], displayMode: 'carousel' },
    ];
    render(<BlockCanvas blocks={galleryBlocks} onChange={onChange} />);

    // Clic sur le bouton d'ajout depuis album
    const albumBtn = screen.getByText('📸 Album de terrain');
    fireEvent.click(albumBtn);

    // Vérifier l'ouverture du modal pour la galerie
    expect(screen.getByText('Sélectionner une photo pour la galerie')).toBeDefined();

    // Sélectionner un cliché
    const selectBtns = screen.getAllByText('Sélectionner ce cliché');
    fireEvent.click(selectBtns[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated[0].images).toHaveLength(1);
    expect(updated[0].images[0].url).toContain('https://www.heldonica.fr/images/destinations/');
  });
});
