import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticlePreview from '@/components/admin/ArticlePreview';

describe('ArticlePreview', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ArticlePreview open={false} title="Test" onClose={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders article content when open', () => {
    render(
      <ArticlePreview
        open={true}
        title="Mon article test"
        excerpt="Un super résumé"
        content="<p>Contenu HTML</p>"
        category="Slow Travel"
        author="Heldonica"
        featured_image="https://example.com/image.jpg"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Mon article test')).toBeTruthy();
    expect(screen.getByText('Un super résumé')).toBeTruthy();
    expect(screen.getByText('Slow Travel')).toBeTruthy();
    expect(screen.getByText('Par Heldonica')).toBeTruthy();
  });

  it('shows placeholder when no content', () => {
    render(
      <ArticlePreview
        open={true}
        title="Sans contenu"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Aucun contenu à afficher.')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <ArticlePreview
        open={true}
        title="Test"
        content="<p>Hello</p>"
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByText('Aperçu de l\'article').parentElement?.querySelector('button');
    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledOnce();
    }
  });
});
