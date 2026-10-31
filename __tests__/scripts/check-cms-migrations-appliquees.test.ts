import { describe, it, expect } from 'vitest';
import {
  versionDeFichier,
  versionsDepuisFichiers,
  comparer,
} from '../../scripts/check-cms-migrations-appliquees.mjs';

/**
 * Le blocage que ce contrôle vise : **aucun workflow n'exécute `supabase db
 * push`**. Fusionner une PR qui porte une migration ne l'applique pas, et rien
 * ne le signalait — d'où des dizaines de tâches en `waiting_validation` avec
 * « MANQUE : appliquer la migration ».
 *
 * Ces tests verrouillent la comparaison dépôt ↔ base, qui est tout l'intérêt du
 * contrôle. Le cas `02_enable_rls.sql` est un piège réel du dépôt : exiger 14
 * chiffres le faisait disparaître des deux côtés, ce qui faussait le compte
 * sans rien signaler.
 */
describe('check-cms-migrations-appliquees — dépôt ↔ base', () => {
  describe('versionDeFichier', () => {
    it('extrait la version d’un nom horodaté', () => {
      expect(versionDeFichier('20261031120000_exposer_migrations_appliquees.sql')).toBe('20261031120000');
    });

    it('accepte la migration legacy `02_enable_rls.sql`', () => {
      // Présente et appliquée : elle doit compter des DEUX côtés, sinon le
      // compte est faux sans qu'aucune alerte ne le dise.
      expect(versionDeFichier('02_enable_rls.sql')).toBe('02');
    });

    it('écarte un nom qui ne suit pas la convention', () => {
      expect(versionDeFichier('notes.sql')).toBeNull();
      expect(versionDeFichier('README.md')).toBeNull();
      expect(versionDeFichier('20261031120000_sans_extension')).toBeNull();
    });
  });

  describe('versionsDepuisFichiers', () => {
    it('écarte les noms illisibles et trie les versions', () => {
      const versions = versionsDepuisFichiers([
        '20261031120000_b.sql',
        'notes.sql',
        '02_enable_rls.sql',
        '20261031110000_a.sql',
      ]);
      expect(versions).toEqual(['02', '20261031110000', '20261031120000']);
    });

    it('ne produit pas de faux écart sur un dossier vide', () => {
      expect(versionsDepuisFichiers([])).toEqual([]);
    });
  });

  describe('comparer', () => {
    it('signale une migration du dépôt absente de la base', () => {
      const { manquantes } = comparer(
        ['02', '20261031110000', '20261031120000'],
        ['02', '20261031110000'],
      );
      expect(manquantes).toEqual(['20261031120000']);
    });

    it('ne signale rien quand tout est appliqué', () => {
      const { manquantes, enPlus } = comparer(['02', '20261031120000'], ['02', '20261031120000']);
      expect(manquantes).toEqual([]);
      expect(enPlus).toEqual([]);
    });

    it('range une migration appliquée mais retirée du dépôt en « en plus », pas en échec', () => {
      // Une migration appliquée puis retirée du dépôt n'est pas un défaut de
      // mise en ligne. La compter comme échec ferait crier le contrôle à tort,
      // et une alerte fausse finit par faire ignorer les vraies.
      const { manquantes, enPlus } = comparer(['02'], ['02', '20260101000000_retiree']);
      expect(manquantes).toEqual([]);
      expect(enPlus).toEqual(['20260101000000_retiree']);
    });

    it('distingue l’écart dans les deux sens au sein d’un même lot', () => {
      const { manquantes, enPlus } = comparer(
        ['02', '20261031120000'],
        ['02', '20260101000000_retiree'],
      );
      expect(manquantes).toEqual(['20261031120000']);
      expect(enPlus).toEqual(['20260101000000_retiree']);
    });
  });
});
