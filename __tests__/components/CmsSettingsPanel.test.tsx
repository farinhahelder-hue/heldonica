import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CmsSettingsPanel from '@/components/admin/CmsSettingsPanel';

const mockSettings = {
  site_name: 'Heldonica',
  site_url: 'https://www.heldonica.fr',
  site_tagline: 'Vivre, découvrir, partager.',
  site_description: 'Blog slow travel',
  primary_color: '#2D8B7A',
  social_instagram: 'https://instagram.com/heldonica',
  social_facebook: 'https://facebook.com/heldonica',
  meta_title: 'Heldonica — Slow Travel',
  meta_description: 'Blog voyage',
  footer_text: '© 2026 Heldonica',
  maintenance_mode: 'false',
  maintenance_message: 'On revient vite',
};

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
});

describe('CmsSettingsPanel', () => {
  it('loads and displays settings from API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Heldonica')).toBeTruthy();
    });

    expect(screen.getByDisplayValue('https://www.heldonica.fr')).toBeTruthy();
    expect(screen.getByDisplayValue('Vivre, découvrir, partager.')).toBeTruthy();
  });

  it('renders all 6 settings groups in sidebar', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Général')).toBeTruthy();
      expect(screen.getByText('Apparence')).toBeTruthy();
      expect(screen.getByText('Réseaux sociaux')).toBeTruthy();
      expect(screen.getByText('SEO')).toBeTruthy();
      expect(screen.getByText('Footer')).toBeTruthy();
      expect(screen.getByText('Maintenance')).toBeTruthy();
    });
  });

  it('switches group when clicking a sidebar tab', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => screen.getByText('Réseaux sociaux'));

    await userEvent.click(screen.getByText('Réseaux sociaux'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://instagram.com/heldonica')).toBeTruthy();
    });
  });

  it('shows error message when API fails', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CmsSettingsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger les paramètres.')).toBeTruthy();
    });
  });

  it('saves settings on save button click', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => screen.getByDisplayValue('Heldonica'));

    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    await userEvent.click(screen.getByText('Sauvegarder'));

    await waitFor(() => {
      expect(screen.getByText('✓ Paramètres sauvegardés')).toBeTruthy();
    });
  });

  it('shows error on save failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => screen.getByDisplayValue('Heldonica'));

    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    await userEvent.click(screen.getByText('Sauvegarder'));

    await waitFor(() => {
      expect(screen.getByText('Échec de la sauvegarde.')).toBeTruthy();
    });
  });

  it('shows general group fields by default', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Nom du site')).toBeTruthy();
      expect(screen.getByText('URL du site')).toBeTruthy();
      expect(screen.getByText('Slogan')).toBeTruthy();
      expect(screen.getByText('Description courte')).toBeTruthy();
    });
  });

  it('renders toggle for maintenance mode', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });

    render(<CmsSettingsPanel />);

    await waitFor(() => screen.getByText('Général'));

    await userEvent.click(screen.getByText('Maintenance'));

    await waitFor(() => {
      expect(screen.getByText('Mode maintenance actif')).toBeTruthy();
      expect(screen.getByText('Désactivé')).toBeTruthy();
    });
  });
});
