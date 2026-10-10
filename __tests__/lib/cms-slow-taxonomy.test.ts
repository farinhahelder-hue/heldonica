import { describe, it, expect } from 'vitest';
import {
  SLOW_SEASONS,
  SLOW_MOBILITIES,
  SLOW_BUDGETS,
  SLOW_CARBON_OPTIONS,
  buildSlowTravelSnippetTags,
  getCanonicalArticleUrl,
} from '@/lib/cms-slow-taxonomy';

describe('CMS Slow Travel Taxonomy & Helper functions', () => {
  it('contient toutes les options de saisons lentes avec émojis et libellés', () => {
    expect(SLOW_SEASONS.length).toBeGreaterThanOrEqual(4);
    const printemps = SLOW_SEASONS.find(s => s.value === 'printemps');
    expect(printemps).toBeDefined();
    expect(printemps?.emoji).toBe('🌸');
    expect(printemps?.label).toContain('Printemps fleuri');
  });

  it('contient les modes de mobilité douce respectant la charte Heldonica', () => {
    const train = SLOW_MOBILITIES.find(m => m.value === 'train');
    const marche = SLOW_MOBILITIES.find(m => m.value === 'marche');
    const velo = SLOW_MOBILITIES.find(m => m.value === 'velo');
    expect(train?.icon).toBe('🚆');
    expect(marche?.icon).toBe('🥾');
    expect(velo?.icon).toBe('🚲');
  });

  it('contient les échelons de budgets réels sans invention', () => {
    const econome = SLOW_BUDGETS.find(b => b.value === 'economique');
    const confort = SLOW_BUDGETS.find(b => b.value === 'confort');
    expect(econome?.range).toBe('< 60 €/j');
    expect(confort?.range).toBe('110-180 €/j');
  });

  it('contient les badges d’empreinte carbone', () => {
    const basCarbone = SLOW_CARBON_OPTIONS.find(c => c.value === 'faible');
    expect(basCarbone?.badge).toContain('Bas carbone');
  });

  describe('buildSlowTravelSnippetTags', () => {
    it('renvoie un tableau vide pour un article sans métadonnées slow', () => {
      const tags = buildSlowTravelSnippetTags({});
      expect(tags).toEqual([]);
    });

    it('génère les tags sémantiques complets avec émojis pour la SERP Google', () => {
      const tags = buildSlowTravelSnippetTags({
        duration: '7 jours en immersion',
        season: 'automne',
        mobility: 'train',
        budget_level: 'raisonnable',
        carbon_footprint: 'faible',
      });

      expect(tags).toHaveLength(5);
      expect(tags[0]).toBe('7 jours en immersion');
      expect(tags[1]).toBe('🍁 Automne doré');
      expect(tags[2]).toBe('🚆 Train');
      expect(tags[3]).toBe('60-110 €/j');
      expect(tags[4]).toBe('🌿 Bas carbone');
    });

    it('génère les tags partiels si seules certaines métadonnées sont renseignées', () => {
      const tags = buildSlowTravelSnippetTags({
        season: 'printemps',
        mobility: 'velo',
      });

      expect(tags).toHaveLength(2);
      expect(tags[0]).toBe('🌸 Printemps fleuri');
      expect(tags[1]).toBe('🚲 Vélo');
    });
  });

  describe('getCanonicalArticleUrl', () => {
    it('génère une URL de blog canonique sur heldonica.fr par défaut', () => {
      const url = getCanonicalArticleUrl('escapade-maramures', 'Carnet de voyage');
      expect(url).toBe('https://www.heldonica.fr/blog/escapade-maramures');
    });

    it('génère une URL de destination si la catégorie mentionne destination', () => {
      const url = getCanonicalArticleUrl('madere-sauvage', 'Destinations Slow');
      expect(url).toBe('https://www.heldonica.fr/destinations/madere-sauvage');
    });

    it('gère les slugs vides en toute sécurité', () => {
      const url = getCanonicalArticleUrl('', 'Blog');
      expect(url).toBe('https://www.heldonica.fr/blog/carnet-de-voyage');
    });
  });
});
