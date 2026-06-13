import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Test"
        message="Message"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Supprimer l'article"
        message="Cette action est irréversible."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Supprimer l'article")).toBeTruthy();
    expect(screen.getByText('Cette action est irréversible.')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Confirmer"
        message="Voulez-vous continuer ?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    await userEvent.click(screen.getByText('Confirmer'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Confirmer"
        message="Voulez-vous continuer ?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('uses custom button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        message="Message"
        confirmLabel="Oui, supprimer"
        cancelLabel="Non, garder"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText('Oui, supprimer')).toBeTruthy();
    expect(screen.getByText('Non, garder')).toBeTruthy();
  });

  it('applies danger variant styles', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Supprimer"
        message="Action dangereuse"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const confirmBtn = screen.getByText('Confirmer');
    expect(confirmBtn.className).toContain('bg-red-600');
  });
});
