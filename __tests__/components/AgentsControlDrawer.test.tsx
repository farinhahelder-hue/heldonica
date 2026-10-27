import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentsControlDrawer from '@/components/admin/AgentsControlDrawer';
import { AgentPresenceBadge } from '@/components/admin/blocks/AgentPresenceBadge';

describe('AgentsControlDrawer Component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('ne rend rien lorsque isOpen est false', () => {
    const { container } = render(
      <AgentsControlDrawer isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('rend le panneau et affiche les tâches et les presets quand isOpen est true', async () => {
    const mockTasks = [
      {
        id: 't-101',
        agent: 'jules',
        task: 'Relecture style : Lisbonne Secrète',
        description: 'Article lisbonne-secrete',
        status: 'done',
        scope: 'content',
        actions_done: {
          verifie: ['HTTP 200 sur les 4 photos de couverture', 'Aucun mot banni détecté'],
          corrige: ['Correction accord pluriel'],
        },
        validated_by: 'heldonica',
        created_at: '2026-10-08T18:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ tasks: mockTasks }),
    } as any);

    render(
      <AgentsControlDrawer
        isOpen={true}
        onClose={vi.fn()}
        articleId={42}
        articleTitle="Lisbonne Secrète"
        articleSlug="lisbonne-secrete"
      />
    );

    // Vérifie le titre du tiroir
    expect(screen.getByText('Station de Contrôle Multi-Agents')).toBeDefined();
    expect(screen.getByText('Article : Lisbonne Secrète')).toBeDefined();

    // Vérifie les presets
    expect(screen.getByText('Relecture Voix & Style')).toBeDefined();
    expect(screen.getByText('Vérification Faits & RAG')).toBeDefined();
    expect(screen.getByText('Audit SEO & Métadonnées')).toBeDefined();

    // Attendre l'apparition de la tâche chargée
    await waitFor(() => {
      expect(screen.getByText('Relecture style : Lisbonne Secrète')).toBeDefined();
      expect(screen.getByText('Validé par heldonica')).toBeDefined();
    });
  });

  it('appelle onClose lors du clic sur le bouton fermer', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ tasks: [] }),
    } as any);

    const onClose = vi.fn();
    render(
      <AgentsControlDrawer isOpen={true} onClose={onClose} />
    );

    const closeBtn = screen.getByTitle('Fermer');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AgentPresenceBadge Component', () => {
  it('affiche le statut de l’agent actif et ouvre les détails au clic', async () => {
    const mockTasks = [
      {
        id: 't-in-progress',
        agent: 'jules',
        task: 'Audit A11y & Liens morts',
        status: 'in_progress',
        claimed_by: 'Jules',
        created_at: '2026-10-08T18:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ tasks: mockTasks }),
    } as any);

    const onOpenDrawer = vi.fn();
    render(<AgentPresenceBadge onOpenAgentsDrawer={onOpenDrawer} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent Jules actif/i)).toBeInTheDocument();
    });

    // Ouvre le dropdown
    const badgeBtn = screen.getByRole('button', { name: /statut de présence des agents/i });
    fireEvent.click(badgeBtn);

    expect(screen.getByText(/Coordination Multi-Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit A11y & Liens morts/i)).toBeInTheDocument();

    // Clic sur ouvrir la tour de contrôle
    const drawerBtn = screen.getByRole('button', { name: /ouvrir la tour de contrôle/i });
    fireEvent.click(drawerBtn);
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
  });
});
