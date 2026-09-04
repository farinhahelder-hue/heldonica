import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/components/admin/ErrorBoundary';

const BuggyComponent = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>OK</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Contenu normal</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Contenu normal')).toBeTruthy();
  });

  it('renders fallback on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Une erreur est survenue dans cette section.')).toBeTruthy();
  });

  it('shows retry button and recovers on click', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Réessayer')).toBeTruthy();

    // L'enfant sain d'abord, la reinitialisation ensuite. Dans l'autre sens, la
    // limite d'erreur repart avec l'enfant qui leve toujours monte : il releve
    // aussitot, et l'ecran d'erreur revient. C'est le comportement attendu d'une
    // limite d'erreur — « Reessayer » ne repare que ce qui etait passager.
    rerender(
      <ErrorBoundary>
        <div>Après récupération</div>
      </ErrorBoundary>
    );

    await userEvent.click(screen.getByText('Réessayer'));

    expect(screen.getByText('Après récupération')).toBeTruthy();
  });

  it('uses custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Fallback personnalisé</div>}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback personnalisé')).toBeTruthy();
  });
});
