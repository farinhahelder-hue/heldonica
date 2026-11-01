import { describe, it, expect } from 'vitest';
import { pageToPath } from '@/lib/revalidate';

/**
 * `pageToPath` traduit une clé de page CMS en chemin d'URL publique.
 *
 * Deux formes de clés existent réellement en base et n'étaient pas traduites :
 *   - `guides-<slug>` tombait sur `/guides-<slug>`, alors que la page vit sous
 *     `/guides/<slug>` (clés `guides-merci`, `guides-top-10-pepites-madere`) ;
 *   - une sous-destination dont la racine contient un tiret était coupée au
 *     premier tiret : `destinations-cote-d-azur-beausoleil` donnait
 *     `/destinations/cote/d-azur-beausoleil`.
 *
 * Un chemin inexistant ne fait pas échouer `revalidatePath` : la revalidation est
 * simplement sans effet, en silence. D'où ces tests.
 */
describe('pageToPath — traduction des clés de page CMS', () => {
  it('traduit une clé de guide vers /guides/<slug>', () => {
    expect(pageToPath('guides-top-10-pepites-madere')).toBe('/guides/top-10-pepites-madere');
    expect(pageToPath('guides-merci')).toBe('/guides/merci');
    expect(pageToPath('guides-5-erreurs-voyage-couple')).toBe('/guides/5-erreurs-voyage-couple');
  });

  it('traduit une destination dont la racine contient un tiret', () => {
    expect(pageToPath('destinations-cote-d-azur-beausoleil')).toBe(
      '/destinations/cote-d-azur/beausoleil'
    );
  });

  it('traduit une sous-destination ordinaire', () => {
    expect(pageToPath('destinations-madere-funchal')).toBe('/destinations/madere/funchal');
    expect(pageToPath('destinations-sardaigne-costa-smeralda')).toBe(
      '/destinations/sardaigne/costa-smeralda'
    );
    expect(pageToPath('destinations-roumanie-itineraire-10-jours')).toBe(
      '/destinations/roumanie/itineraire-10-jours'
    );
  });

  it('traduit une destination de premier niveau', () => {
    expect(pageToPath('destinations-sardaigne')).toBe('/destinations/sardaigne');
    expect(pageToPath('destinations-cote-d-azur')).toBe('/destinations/cote-d-azur');
    expect(pageToPath('destinations')).toBe('/destinations');
  });

  it('conserve les pages simples', () => {
    expect(pageToPath('blog')).toBe('/blog');
    expect(pageToPath('temoignages')).toBe('/temoignages');
    expect(pageToPath('carte')).toBe('/destinations/carte');
    expect(pageToPath('destinations-carte')).toBe('/destinations/carte');
    expect(pageToPath('home')).toBe('/');
    expect(pageToPath('global')).toBe('/');
  });

  it('retombe sur le découpage au premier tiret pour une racine inconnue', () => {
    expect(pageToPath('destinations-nouvelle-ville')).toBe('/destinations/nouvelle/ville');
  });
});
