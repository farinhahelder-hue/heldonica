import { describe, it, expect } from 'vitest';
import { emojisDeco, classerLignes, TABLES } from '../../scripts/check-cms-emojis.mjs';

/**
 * Le garde-fou lit la BASE. On teste ici ses deux fonctions pures (la détection
 * d'emoji et le tri rendu/non rendu) : le reste est de l'entrée/sortie réseau,
 * exercé par `npm run check:cms-emojis`.
 */
describe('check-cms-emojis — fonctions pures', () => {
  describe('emojisDeco', () => {
    it('détecte les emojis décoratifs, y compris ceux hors de la purge #687', () => {
      expect(emojisDeco('Bienvenue ✨')).toEqual(['✨']);
      // ⌛ (U+231B) : la famille qui avait échappé à la purge #687.
      expect(emojisDeco('Patientez ⌛')).toEqual(['⌛']);
      expect(emojisDeco('⭐⭐⭐')).toEqual(['⭐', '⭐', '⭐']);
    });

    it('ignore les drapeaux (indicateurs de pays sémantiques)', () => {
      expect(emojisDeco('🇵🇹')).toEqual([]);
      expect(emojisDeco('🇫🇷 France')).toEqual([]);
      // Un drapeau À CÔTÉ d'un emoji décoratif : seul le décoratif est retenu.
      expect(emojisDeco('🇵🇹 ✨')).toEqual(['✨']);
    });

    it('ne touche pas le texte ordinaire', () => {
      expect(emojisDeco('Un guide slow travel pour deux')).toEqual([]);
      expect(emojisDeco('A, é, à, ç — ponctuation : ; ! ?')).toEqual([]);
      expect(emojisDeco('')).toEqual([]);
    });

    it('tolère une valeur absente ou non textuelle', () => {
      expect(emojisDeco(null)).toEqual([]);
      expect(emojisDeco(undefined)).toEqual([]);
      expect(emojisDeco(42)).toEqual([]);
    });
  });

  describe('classerLignes', () => {
    const config = { etat: 'published', colonnes: ['title', 'content'] };

    it('classe une ligne rendue (publiée) avec emoji dans `rendues`', () => {
      const { rendues, inactives } = classerLignes(config, [
        { slug: 'a', title: 'Titre ✨', content: 'x', published: true },
      ]);
      expect(rendues).toHaveLength(1);
      expect(rendues[0].slug).toBe('a');
      expect(rendues[0].emojis).toEqual(['✨']);
      expect(inactives).toHaveLength(0);
    });

    it('classe une ligne non rendue (brouillon) dans `inactives`', () => {
      const { rendues, inactives } = classerLignes(config, [
        { slug: 'b', title: 'Titre ✨', content: 'x', published: false },
      ]);
      expect(rendues).toHaveLength(0);
      expect(inactives).toHaveLength(1);
    });

    it('ignore une ligne sans emoji, rendue ou non', () => {
      const { rendues, inactives } = classerLignes(config, [
        { slug: 'c', title: 'Propre', content: 'rien', published: true },
        { slug: 'd', title: 'Propre aussi', content: 'rien', published: false },
      ]);
      expect(rendues).toHaveLength(0);
      expect(inactives).toHaveLength(0);
    });

    it('collecte les emojis de plusieurs colonnes', () => {
      const { rendues } = classerLignes(config, [
        { slug: 'e', title: 'Titre ✨', content: 'corps ⌛', published: true },
      ]);
      expect(rendues[0].emojis).toEqual(['✨', '⌛']);
    });
  });

  describe('TABLES — périmètre des tables rendues', () => {
    it('couvre les quatre tables de contenu rendues, avec leur colonne d état', () => {
      const parTable = Object.fromEntries(TABLES.map((t) => [t.table, t.etat]));
      expect(parTable).toEqual({
        cms_editable_zones: 'is_active',
        cms_blog_posts: 'published',
        cms_sub_destinations: 'is_active',
        cms_guide_items: 'is_active',
      });
    });

    it('chaque table déclare au moins une colonne et une clé d identification', () => {
      for (const t of TABLES) {
        expect(t.colonnes.length, t.table).toBeGreaterThan(0);
        expect(typeof t.cle, t.table).toBe('string');
      }
    });
  });
});
