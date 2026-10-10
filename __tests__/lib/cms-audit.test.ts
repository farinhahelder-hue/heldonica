import { describe, it, expect } from 'vitest';
import { calculateDiff, logCmsAudit } from '@/lib/cms-audit';
import { SYSTEM_ADMIN_USER } from '@/lib/cms-access';

describe('CMS Audit Log & Diff Calculator', () => {
  describe('calculateDiff', () => {
    it('retourne un diff vide si les deux états sont identiques', () => {
      const before = { title: 'Madère Slow Travel', excerpt: 'Un carnet calme' };
      const after = { title: 'Madère Slow Travel', excerpt: 'Un carnet calme' };
      const diff = calculateDiff(before, after);
      expect(Object.keys(diff)).toHaveLength(0);
    });

    it('identifie précisément les champs modifiés', () => {
      const before = { title: 'Titre Initial', visits: 10 };
      const after = { title: 'Titre Modifié', visits: 10 };
      const diff = calculateDiff(before, after);

      expect(diff).toHaveProperty('title');
      expect(diff.title).toEqual({ before: 'Titre Initial', after: 'Titre Modifié' });
      expect(diff).not.toHaveProperty('visits');
    });

    it('gère l ajout et la suppression de propriétés', () => {
      const before = { status: 'draft', oldProp: 'supprimé' };
      const after = { status: 'published', newProp: 'ajouté' };
      const diff = calculateDiff(before, after);

      expect(diff.status).toEqual({ before: 'draft', after: 'published' });
      expect(diff.newProp).toEqual({ before: null, after: 'ajouté' });
      expect(diff.oldProp).toEqual({ before: 'supprimé', after: null });
    });

    it('ignore les variations techniques de updated_at', () => {
      const before = { title: 'Identique', updated_at: '2026-10-01T00:00:00Z' };
      const after = { title: 'Identique', updated_at: '2026-10-08T00:00:00Z' };
      const diff = calculateDiff(before, after);

      expect(diff).not.toHaveProperty('updated_at');
      expect(Object.keys(diff)).toHaveLength(0);
    });

    it('fonctionne proprement avec des valeurs nulles ou undefined', () => {
      const diff1 = calculateDiff(null, { title: 'Création' });
      expect(diff1.title).toEqual({ before: null, after: 'Création' });

      const diff2 = calculateDiff({ title: 'Suppression' }, null);
      expect(diff2.title).toEqual({ before: 'Suppression', after: null });
    });
  });

  describe('logCmsAudit', () => {
    it('ne lève aucune exception et retourne un booléen même sans Supabase connecté', async () => {
      const result = await logCmsAudit({
        user: SYSTEM_ADMIN_USER,
        action: 'update',
        entity: 'article',
        entityId: 'art_123',
        before: { title: 'Ancien titre' },
        after: { title: 'Nouveau titre' },
      });

      // Doit retourner true ou false de façon résiliente sans crash
      expect(typeof result).toBe('boolean');
    });
  });
});
