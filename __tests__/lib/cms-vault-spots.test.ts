import { describe, it, expect } from 'vitest';
import {
  getAllVaultSpots,
  searchVaultSpots,
  getVaultSpotById,
} from '@/lib/cms-vault-spots';

describe('CMS Vault Spots Registry (lib/cms-vault-spots.ts)', () => {
  it('contient exactement les 88 fiches certifiées du Coffre des Savoirs', () => {
    const spots = getAllVaultSpots();
    expect(spots).toHaveLength(88);
  });

  it('valide que chaque fiche possède des attributs obligatoires valides', () => {
    const spots = getAllVaultSpots();
    for (const spot of spots) {
      expect(spot.id).toMatch(/^vault_\d+$|^mad-.*$|^che-.*$|^mne-.*$/);
      expect(typeof spot.title).toBe('string');
      expect(spot.title.trim().length).toBeGreaterThan(0);
      expect(typeof spot.livedExperience).toBe('string');
      expect(spot.livedExperience.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(spot.tags)).toBe(true);
    }
  });

  it('recherche avec pertinence les pépites de Madère', () => {
    const results = searchVaultSpots('Madère', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase() + ' ' + results[0].location.toLowerCase()).toContain('madère');
  });

  it('recherche avec pertinence les pépites de Podgorica / Monténégro', () => {
    const results = searchVaultSpots('Podgorica');
    expect(results.length).toBeGreaterThan(0);
    const hasPodgorica = results.some((r) => r.title.toLowerCase().includes('podgorica') || r.tags.includes('podgorica'));
    expect(hasPodgorica).toBe(true);
  });

  it('récupère une fiche précise par son identifiant unique', () => {
    const spot = getVaultSpotById('vault_21');
    expect(spot).toBeDefined();
    expect(spot?.numericId).toBe(21);
    expect(spot?.title).toContain('Caldeirão Verde');
  });

  it('valide la présence des champs spécifiques pour les nouvelles fiches terrain', () => {
    const spots = getAllVaultSpots();
    const specificSpots = spots.filter(s => s.id.startsWith('mad-') || s.id.startsWith('che-') || s.id.startsWith('mne-'));
    expect(specificSpots).toHaveLength(10);
    for (const spot of specificSpots) {
      expect(spot.destination).toBeDefined();
      expect(['madere', 'suisse', 'montenegro']).toContain(spot.destination);
      expect(spot.bestSeason).toBeDefined();
      expect(spot.mobility).toBeDefined();
      expect(spot.pitfallAvoid).toBeDefined();
      expect(spot.sensoryNote).toBeDefined();
    }
  });
});
