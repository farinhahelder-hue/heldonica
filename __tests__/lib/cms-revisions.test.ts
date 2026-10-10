import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  savePostRevision,
  getPostRevisions,
  restorePostRevision,
} from '@/lib/cms-revisions';
import { CmsUser } from '@/lib/cms-access';

vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/cms-audit', () => ({
  logCmsAudit: vi.fn().mockResolvedValue(true),
}));

import { supabase } from '@/lib/supabase-client';
import { logCmsAudit } from '@/lib/cms-audit';

describe('CMS Revisions — Versionnage & Rollback en 1 clic', () => {
  const adminUser: CmsUser = {
    id: 'user-admin',
    email: 'admin@heldonica.fr',
    role: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enregistre une révision complète d’un article', async () => {
    (supabase!.from as any).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'rev-uuid-1' }, error: null }),
    });

    const res = await savePostRevision(
      {
        id: 'post-101',
        title: 'Guide Madère',
        slug: 'guide-madere',
        content: 'Contenu original complet.',
        author: 'Heldonica',
      },
      adminUser
    );

    expect(res.success).toBe(true);
    expect(res.revisionId).toBe('rev-uuid-1');
  });

  it('restaure une révision antérieure et logge l’audit', async () => {
    const targetRevision = {
      id: 'rev-target',
      post_id: 'post-101',
      title: 'Guide Madère V1',
      slug: 'guide-madere',
      content: 'Contenu historique restauré.',
      author: 'Heldonica',
      saved_at: '2026-09-01T10:00:00Z',
    };

    const currentPost = {
      id: 'post-101',
      title: 'Guide Madère V2 (Modifié)',
      slug: 'guide-madere',
      content: 'Contenu modifié avec erreur.',
    };

    (supabase!.from as any).mockImplementation((table: string) => {
      if (table === 'cms_post_revisions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: targetRevision, error: null }),
          insert: vi.fn().mockReturnThis(),
        };
      }
      if (table === 'cms_blog_posts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: currentPost, error: null }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return {};
    });

    const res = await restorePostRevision('post-101', 'rev-target', adminUser);

    expect(res.success).toBe(true);
    expect(logCmsAudit).toHaveBeenCalledTimes(1);
    expect(logCmsAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'update',
        entity: 'article',
        entityId: 'post-101',
      })
    );
  });
});
