import { describe, it, expect } from 'vitest';
import {
  ciblesDepuisSchema,
  objetsDansValeur,
  lignesFautives,
  objetsServis,
  cheminPrive,
  BUCKET_PUBLIC,
  BUCKET_PRIVE,
  OBJETS_GENERES,
} from '../../scripts/check-cms-ai-images-db.mjs';

/**
 * `check-cms-ai-images.mjs` lit `public/` et le code. Il ne voit pas la base.
 * Deux purges (30/10/2026) ont été annoncées complètes en ne visant que les
 * colonnes d'image — `featured_image`, `og_image`, `hero_unsplash_url` — alors
 * que des URL subsistaient dans des colonnes de contenu (`cms_blog_posts.content`,
 * `cms_pillar_pages.hero`, `article_revisions.content`) et, surtout, dans une
 * colonne TABLEAU (`destinations.gallery_images`, type `text[]`) qu'un balayage
 * limité aux colonnes texte/json ne voit jamais.
 *
 * Ces tests verrouillent les trois propriétés qui font la valeur du contrôle :
 * l'exhaustivité des colonnes, la couverture des tableaux, et la détection.
 */
describe('check-cms-ai-images-db — balayage de la base', () => {
  describe('ciblesDepuisSchema', () => {
    it('retient les colonnes texte, json et tableau, écarte le reste', () => {
      const openapi = {
        definitions: {
          cms_blog_posts: {
            required: ['id'],
            properties: {
              id: { format: 'bigint', type: 'integer' },
              content: { format: 'text', type: 'string' },
              meta: { type: 'object' },
              gallery: { type: 'array', items: { type: 'string' } },
              actif: { type: 'boolean' },
              vues: { format: 'integer', type: 'integer' },
            },
          },
        },
      };
      const cibles = ciblesDepuisSchema(openapi);
      const colonnes = cibles.map((c) => c.colonne).sort();
      expect(colonnes).toEqual(['content', 'gallery', 'meta']);
    });

    it('marque les vues (sans clé primaire) pour ne pas échouer sur elles', () => {
      const openapi = {
        definitions: {
          vraie_table: { required: ['id'], properties: { id: { format: 'bigint' }, a: { format: 'text' } } },
          une_vue: { properties: { b: { format: 'text' } } },
        },
      };
      const cibles = ciblesDepuisSchema(openapi);
      expect(cibles.find((c) => c.table === 'vraie_table')?.estVue).toBe(false);
      expect(cibles.find((c) => c.table === 'une_vue')?.estVue).toBe(true);
    });

    it('choisit `key` comme identifiant quand `id` manque (cms_settings)', () => {
      const openapi = {
        definitions: {
          cms_settings: { required: ['key'], properties: { key: { format: 'text' }, value: { format: 'text' } } },
        },
      };
      const cibles = ciblesDepuisSchema(openapi);
      expect(cibles.every((c) => c.cle === 'key')).toBe(true);
    });
  });

  describe('objetsDansValeur', () => {
    it('détecte un objet généré dans une URL complète', () => {
      const url = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/ponta_do_sol.jpg';
      expect(objetsDansValeur(url)).toEqual(['destinations/madere/ponta_do_sol.jpg']);
    });

    it('détecte un objet généré dans un tableau sérialisé', () => {
      const tableau = ['https://x/media/destinations/madere/fanal_foret.jpg', 'https://x/photo-terrain.jpg'];
      expect(objetsDansValeur(tableau)).toEqual(['destinations/madere/fanal_foret.jpg']);
    });

    it('ne signale pas une photo de terrain', () => {
      expect(objetsDansValeur('https://x/media/destinations/roumanie/IMG_20260827_135618.jpg')).toEqual([]);
      expect(objetsDansValeur(null)).toEqual([]);
    });

    it('couvre les neuf objets générés connus (Madère et Monténégro)', () => {
      expect(OBJETS_GENERES).toHaveLength(9);
      expect(OBJETS_GENERES.some((o) => o.includes('montenegro/stara_varos.jpg'))).toBe(true);
    });
  });

  describe('lignesFautives', () => {
    it('remonte l’identifiant de la ligne fautive', () => {
      const cible = { table: 'destinations', colonne: 'gallery_images', cle: 'id', estVue: false };
      const lignes = [
        { id: 1, gallery_images: ['https://x/media/destinations/madere/porto_moniz.jpg'] },
        { id: 2, gallery_images: ['https://x/photo-terrain.jpg'] },
      ];
      const fautives = lignesFautives(cible, lignes);
      expect(fautives).toHaveLength(1);
      expect(fautives[0]).toMatchObject({ table: 'destinations', colonne: 'gallery_images', id: 1 });
    });

    it('ne remonte rien sur des lignes propres', () => {
      const cible = { table: 'cms_blog_posts', colonne: 'content', cle: 'id', estVue: false };
      expect(lignesFautives(cible, [{ id: 1, content: 'Un récit de terrain sans image fabriquée.' }])).toEqual([]);
    });
  });

  /**
   * Un visuel retiré des colonnes reste **téléchargeable** tant que son objet est
   * dans le bucket public. Le 31/10/2026, les cinq visuels Madère n'étaient plus
   * cités nulle part en base et répondaient pourtant HTTP 206. Ce contrôle ferme
   * ce trou : la base ne suffit pas, il faut regarder le stockage.
   */
  describe('objetsServis — stockage public', () => {
    it('détecte un objet généré encore servi', () => {
      const servis = objetsServis([
        'destinations/madere/porto_moniz.jpg',
        'images/destinations/madere/photo-terrain.jpg',
      ]);
      expect(servis).toEqual(['destinations/madere/porto_moniz.jpg']);
    });

    it('ne signale rien quand le bucket public est propre', () => {
      expect(objetsServis(['images/destinations/madere/photo-terrain.jpg', 'og-default.jpg'])).toEqual([]);
    });

    it('détecte les neuf objets, pas seulement Madère', () => {
      const servis = objetsServis(OBJETS_GENERES);
      expect(servis).toHaveLength(9);
    });

    it('ne confond pas une photo de terrain au nom proche', () => {
      // `podgorica_stara_varos.jpg` est une vraie photo (sans marqueur C2PA) ;
      // le visuel généré s'appelle `stara_varos.jpg`. Le chemin exact protège.
      expect(objetsServis(['destinations/montenegro/podgorica_stara_varos.jpg'])).toEqual([]);
    });
  });

  describe('cheminPrive — règle « dépublier, jamais supprimer »', () => {
    it('place la copie sous le préfixe images-ia/ du bucket privé', () => {
      expect(cheminPrive('destinations/madere/porto_moniz.jpg')).toBe(
        'images-ia/destinations/madere/porto_moniz.jpg',
      );
    });

    it('nomme les buckets réellement utilisés', () => {
      expect(BUCKET_PUBLIC).toBe('media');
      expect(BUCKET_PRIVE).toBe('prive');
    });
  });
});
