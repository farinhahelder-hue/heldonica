import { describe, it, expect } from 'vitest';
import {
  UNPUBLISHED_PATHS,
  UNPUBLISHED_CMS_PAGES,
  isUnpublishedPath,
  isUnpublishedCmsPage,
} from '../../lib/unpublished-pages';

/**
 * Ces listes protègent l'indexation : une page dont le contenu n'est pas publiable
 * ne doit plus être annoncée dans le sitemap ni indexée. Le test échoue si une
 * entrée disparaît par mégarde (ce qui rouvrirait la porte à une page brouillon).
 */
describe('unpublished-pages', () => {
  it('liste les deux formes de la même page (chemin et clé CMS)', () => {
    expect(UNPUBLISHED_PATHS).toHaveLength(UNPUBLISHED_CMS_PAGES.length);
  });

  it('reconnaît un chemin, avec ou sans domaine, avec ou sans slash final', () => {
    expect(isUnpublishedPath('/destinations/sicile/taormine')).toBe(true);
    expect(isUnpublishedPath('https://www.heldonica.fr/destinations/sicile/taormine')).toBe(true);
    expect(isUnpublishedPath('/destinations/sicile/taormine/')).toBe(true);
  });

  it('reconnaît la clé de page CMS correspondante', () => {
    expect(isUnpublishedCmsPage('destinations-sicile-taormine')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-sardaigne-costa-smeralda')).toBe(true);
  });

  it('laisse passer les pages publiées', () => {
    expect(isUnpublishedPath('/destinations/madere/funchal')).toBe(false);
    expect(isUnpublishedPath('https://www.heldonica.fr/destinations/montenegro/kotor')).toBe(false);
    expect(isUnpublishedCmsPage('destinations-madere-funchal')).toBe(false);
  });

  it('ne piège pas une page dont le chemin commence par une entrée non publiable', () => {
    // Garde-fou : /destinations/sicile/palerme-bis ne doit pas être filtré par
    // l'entrée /destinations/sicile/palerme.
    expect(isUnpublishedPath('/destinations/sicile/palerme-bis')).toBe(false);
  });
});
