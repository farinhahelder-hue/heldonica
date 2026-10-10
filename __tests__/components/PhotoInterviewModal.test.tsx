import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PhotoInterviewModal } from '@/components/admin/PhotoInterviewModal';

describe('PhotoInterviewModal (__tests__/components/PhotoInterviewModal.test.tsx)', () => {
  it('ne rend rien lorsque isOpen est false', () => {
    const { container } = render(
      <PhotoInterviewModal
        isOpen={false}
        onClose={vi.fn()}
        imageUrl="https://images.unsplash.com/photo-test.jpg"
        onApply={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('rend le modal avec l\'image et les 3 questions interactives lorsque isOpen est true', () => {
    render(
      <PhotoInterviewModal
        isOpen={true}
        onClose={vi.fn()}
        imageUrl="https://images.unsplash.com/photo-test.jpg"
        initialLocation="Stoos"
        initialDate="2025-07-15"
        onApply={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Interview de Terrain/i })).toBeDefined();
    expect(screen.getByText(/1. Sons, odeurs et atmosphère/i)).toBeDefined();
    expect(screen.getByText(/2. Repère concret & Prix réel/i)).toBeDefined();
    expect(screen.getByText(/3. Ce qu'on a moins aimé/i)).toBeDefined();
  });

  it('permet de saisir les réponses, de tisser le récit et d\'appliquer au bloc', () => {
    const handleApply = vi.fn();

    render(
      <PhotoInterviewModal
        isOpen={true}
        onClose={vi.fn()}
        imageUrl="https://images.unsplash.com/photo-test.jpg"
        initialLocation="Stoos"
        initialDate="2025-07-15"
        onApply={handleApply}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    // inputs[0] = location input, inputs[1] = date input, inputs[2] = sensory, inputs[3] = concrete, inputs[4] = counterpoint
    const sensoryInput = screen.getByPlaceholderText(/Silence d'alpage absolu/i);
    const concreteInput = screen.getByPlaceholderText(/Funiculaire à 22 CHF/i);

    fireEvent.change(sensoryInput, {
      target: { value: 'Brise fraîche et son lointain des cloches.' },
    });
    fireEvent.change(concreteInput, {
      target: { value: 'Montée à 22 CHF après 16h.' },
    });

    // Bouton tisser
    const weaveBtn = screen.getByRole('button', { name: /Tisser le Récit/i });
    fireEvent.click(weaveBtn);

    // Vérifier l'apparition de la synthèse
    expect(screen.getByText(/Récit Tissé & Certifié/i)).toBeDefined();
    expect(screen.getByText(/Voix 100% Conforme/i)).toBeDefined();

    // Bouton appliquer
    const applyBtn = screen.getByRole('button', { name: /Appliquer directement au Bloc/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        anecdote: expect.stringContaining('Brise fraîche'),
        location: 'Stoos',
      })
    );
  });
});
