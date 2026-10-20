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

  it('couvre les 14 pages destinations au contenu non publiable', () => {
    // Relevé du 16/10 : le balayage complet des 69 pages destinations a montré
    // 14 pages à fragments (« Grec. », « Le parc. »), dont 3 que le premier
    // relevé (11 pages) avait manquées : medellin, alghero, asinara.
    // + 33 sous-pages sans photo vérifiée, passées en « Bientôt » pour le MVP du
    // 18/10 (décision du fondateur après la planche de contrôle des photos).
    // + 3 pages relevées en ligne le 19/10 : Paris, Maramureș, Grèce.
    expect(UNPUBLISHED_PATHS).toHaveLength(14 + 33 + 3);
    expect(UNPUBLISHED_CMS_PAGES).toHaveLength(14 + 33 + 3);
  });

  it('relevé en ligne du 19/10 : photo écartée ou page vide, « Bientôt »', () => {
    // Paris : tour Eiffel de stock. Maramureș : photo qui n'est pas du
    // Maramureș. Grèce : déjà « Bientôt », mais indexable et dans le pied de page.
    expect(isUnpublishedPath('/destinations/paris')).toBe(true);
    expect(isUnpublishedPath('/destinations/roumanie/maramures')).toBe(true);
    expect(isUnpublishedPath('/destinations/grece')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-paris')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-roumanie-maramures')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-grece')).toBe(true);
  });

  it('MVP du 18/10 : les sous-pages sans photo vérifiée sont « Bientôt »', () => {
    expect(isUnpublishedPath('/destinations/madere/funchal')).toBe(true);
    expect(isUnpublishedPath('/destinations/montenegro/kotor')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-roumanie-timisoara')).toBe(true);
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

  it('inclut les pages découvertes au balayage du 16/10', () => {
    expect(isUnpublishedPath('/destinations/colombie/medellin')).toBe(true);
    expect(isUnpublishedPath('/destinations/sardaigne/alghero')).toBe(true);
    expect(isUnpublishedPath('/destinations/sardaigne/asinara')).toBe(true);
    expect(isUnpublishedCmsPage('destinations-sardaigne-asinara')).toBe(true);
  });

  it('laisse passer les pages publiées', () => {
    // Pages au contenu et à la photo vérifiés : elles restent en ligne.
    expect(isUnpublishedPath('/destinations/roumanie/bucarest')).toBe(false);
    expect(isUnpublishedPath('https://www.heldonica.fr/destinations/montenegro')).toBe(false);
    expect(isUnpublishedCmsPage('destinations-roumanie-bucarest')).toBe(false);
  });

  it('ne piège pas une page dont le chemin commence par une entrée non publiable', () => {
    // Garde-fou : /destinations/sicile/palerme-bis ne doit pas être filtré par
    // l'entrée /destinations/sicile/palerme.
    expect(isUnpublishedPath('/destinations/sicile/palerme-bis')).toBe(false);
  });
});
