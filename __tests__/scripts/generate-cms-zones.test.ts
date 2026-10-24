import { describe, it, expect } from 'vitest';
import { buildSql as buildSubdestSql } from '../../scripts/generate-subdest-cms.mjs';
import { buildSql as buildItinerariesSql, addZone } from '../../scripts/generate-itineraries-cms.mjs';

/**
 * P4 de l'audit éditorial : le générateur de zones CMS émettait une ligne
 * `cms_editable_zones` même quand la valeur source était vide, avec
 * `is_active = true` et un `ON CONFLICT DO UPDATE ... is_active = true`.
 *
 * Deux dégâts, tous deux invisibles en CI :
 *   1. une zone vide active fait rendre au composant un bloc titré sans corps
 *      (« Notre conseil » suivi du vide) ;
 *   2. l'`ON CONFLICT DO UPDATE` réactive une zone vide que le fondateur avait
 *      désactivée à la main — le geste éditorial était annulé par la génération.
 *
 * Constat en base le 2026-10-23 : 37 zones actives vides, dont 22 `local_tip` et
 * 3 `day_N_accommodation`, toutes signées par ces deux générateurs.
 *
 * Les générateurs lisent les pages via PowerShell (absent sous Linux) : on teste
 * la fonction pure qui construit le SQL, pas la lecture des fichiers.
 */
describe('générateur de zones CMS — aucune zone vide émise', () => {
  describe('sous-destinations', () => {
    it('omet la ligne `local_tip` quand le conseil est vide', () => {
      const sql = buildSubdestSql([
        [
          'app/destinations/idf/paris/page.tsx',
          { heroImage: '', introText: 'Un texte.', localTip: '', highlights: [] },
        ],
      ]);
      expect(sql).not.toContain("'local_tip'");
      expect(sql).toContain("'intro_text'");
    });

    it('omet la ligne quand la valeur ne contient que des espaces', () => {
      const sql = buildSubdestSql([
        ['app/destinations/x/page.tsx', { heroImage: '', introText: '   ', localTip: '\n\t', highlights: [] }],
      ]);
      expect(sql).not.toContain("'intro_text'");
      expect(sql).not.toContain("'local_tip'");
    });

    it('conserve une zone réellement renseignée', () => {
      const sql = buildSubdestSql([
        [
          'app/destinations/x/page.tsx',
          { heroImage: '/a.jpg', introText: 'Intro', localTip: 'Un conseil', highlights: [] },
        ],
      ]);
      expect(sql).toContain("'local_tip', 'textarea', 'Un conseil'");
    });

    it('n\'émet pas de bloc VALUES vide quand tout est vide', () => {
      // `hero_image` a un défaut (`/og-default.jpg`) : le bloc n'est donc jamais
      // vide pour une sous-destination. Le garde reste défensif si un jour ce
      // défaut saute — on vérifie ici que l'image par défaut est bien posée et
      // que les zones vides, elles, ne sont pas émises.
      const sql = buildSubdestSql([
        ['app/destinations/x/page.tsx', { heroImage: '', introText: '', localTip: '', highlights: [] }],
      ]);
      expect(sql).toContain("'hero_image', 'image', '/og-default.jpg'");
      expect(sql).not.toContain("'intro_text'");
      expect(sql).not.toContain("'local_tip'");
    });
  });

  describe('itinéraires', () => {
    it('omet la ligne `day_N_accommodation` quand l\'hébergement est vide', () => {
      const rows = [];
      addZone(rows, 'destinations-roumanie-itineraire-5-jours', 'day_5_accommodation', 'textarea', '', 'Jour 5 — hébergement');
      addZone(rows, 'destinations-roumanie-itineraire-5-jours', 'day_5_title', 'text', 'Le retour', 'Jour 5 — titre');
      expect(rows).toHaveLength(1);
      expect(rows[0][1]).toBe("'day_5_title'");
    });

    it('traite null et undefined comme vide', () => {
      const rows = [];
      addZone(rows, 'p', 'a', 'text', null, 'l');
      addZone(rows, 'p', 'b', 'text', undefined, 'l');
      expect(rows).toHaveLength(0);
    });

    it('n\'émet pas de bloc VALUES vide pour une page sans zone', () => {
      const sql = buildItinerariesSql([['destinations-x', []]]);
      expect(sql).not.toContain('INSERT INTO public.cms_editable_zones');
    });
  });
});
