import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRelease,
  addItemsToRelease,
  executeReleasePublication,
  CmsRelease,
} from '@/lib/cms-releases';
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

describe('CMS Releases — Publication Groupée & Atomique', () => {
  const adminUser: CmsUser = {
    id: 'user-admin',
    email: 'admin@heldonica.fr',
    role: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejette la création d’une release sans titre', async () => {
    const res = await createRelease({ title: '   ' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('titre de la release est obligatoire');
  });

  it('crée une release avec statut draft par défaut', async () => {
    const mockRelease: CmsRelease = {
      id: 'rel-1',
      title: 'Lancement Printemps Slow Travel',
      status: 'draft',
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase!.from as any).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockRelease, error: null }),
    });

    const res = await createRelease({
      title: 'Lancement Printemps Slow Travel',
      user: adminUser,
    });

    expect(res.success).toBe(true);
    expect(res.release?.status).toBe('draft');
  });

  it('interdit la modification d’une release déjà publiée', async () => {
    (supabase!.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'rel-1', items: [], status: 'published' },
        error: null,
      }),
    });

    const res = await addItemsToRelease('rel-1', [{ entity: 'article', id: 'art-1' }]);
    expect(res.success).toBe(false);
    expect(res.error).toContain('clôturée');
  });

  it('publie atomiquement les articles et hébergements et logge l’audit', async () => {
    const releaseWithItems: CmsRelease = {
      id: 'rel-batch-1',
      title: 'Collection Alentejo 2026',
      status: 'draft',
      items: [
        { entity: 'post', id: 'post-101', title: 'Guide Comporta' },
        { entity: 'accommodation', id: 'acc-202', title: 'Quinta do Sol' },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase!.from as any).mockImplementation((table: string) => {
      if (table === 'cms_releases') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: releaseWithItems, error: null }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'cms_blog_posts' || table === 'cms_accommodations') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return {};
    });

    const res = await executeReleasePublication('rel-batch-1', adminUser);

    expect(res.success).toBe(true);
    expect(res.publishedCount).toBe(2);
    expect(res.errors).toHaveLength(0);
    expect(logCmsAudit).toHaveBeenCalledTimes(2);
  });
});
