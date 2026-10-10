import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ArticleMigrateToBlocksModal from '../../components/admin/ArticleMigrateToBlocksModal';
import React from 'react';

// Mock htmlToBlocks for predictable test outputs
vi.mock('@/lib/cms-blocks-converter', () => ({
  htmlToBlocks: vi.fn((content: string) => {
    if (content === '<p>Mock Content</p>') {
      return [
        { id: '1', type: 'heading', level: 1, text: 'Titre de test' },
        { id: '2', type: 'text', content: 'Paragraphe de test' },
        { id: '3', type: 'image', url: 'https://test.com/img.jpg' },
      ];
    }
    return [];
  }),
}));

describe('ArticleMigrateToBlocksModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    content: '<p>Mock Content</p>',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne s\'affiche pas si isOpen est faux', () => {
    render(<ArticleMigrateToBlocksModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Migration vers le Mode Blocs/i)).not.toBeInTheDocument();
  });

  it('affiche les statistiques des blocs convertis', () => {
    render(<ArticleMigrateToBlocksModal {...defaultProps} />);
    
    // Total is 3
    expect(screen.getByText(/3 blocs modulaires interactifs/i)).toBeInTheDocument();
    
    // Check headings count
    const headingsStats = screen.getByText('Titres');
    expect(headingsStats.previousElementSibling?.textContent).toBe('1');

    // Check texts count
    const textsStats = screen.getByText('Paragraphes');
    expect(textsStats.previousElementSibling?.textContent).toBe('1');

    // Check images count
    const imagesStats = screen.getByText('Images');
    expect(imagesStats.previousElementSibling?.textContent).toBe('1');
    
    // Check others count
    const othersStats = screen.getByText('Autres');
    expect(othersStats.previousElementSibling?.textContent).toBe('0');
  });

  it('affiche le message de réassurance pour la sauvegarde', () => {
    render(<ArticleMigrateToBlocksModal {...defaultProps} />);
    expect(screen.getByText(/Une sauvegarde automatique sera créée dans l'historique des révisions/i)).toBeInTheDocument();
  });

  it('appelle onConfirm avec les blocs convertis lors du clic sur le bouton de confirmation', () => {
    render(<ArticleMigrateToBlocksModal {...defaultProps} />);
    const confirmButton = screen.getByRole('button', { name: /Confirmer et basculer en Mode Blocs/i });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).toHaveBeenCalledWith([
      { id: '1', type: 'heading', level: 1, text: 'Titre de test' },
      { id: '2', type: 'text', content: 'Paragraphe de test' },
      { id: '3', type: 'image', url: 'https://test.com/img.jpg' },
    ]);
  });

  it('appelle onClose lors du clic sur le bouton Annuler', () => {
    render(<ArticleMigrateToBlocksModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
