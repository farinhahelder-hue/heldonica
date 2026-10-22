import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key';
});

const mockInsertHistory = vi.fn();
const mockUpsertZones = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'cms_zone_history') {
        return {
          insert: mockInsertHistory,
        };
      }
      if (table === 'cms_editable_zones') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mockMaybeSingle,
              })),
            })),
          })),
          upsert: mockUpsertZones,
        };
      }
      return {};
    },
  })),
}));

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn(),
}));

vi.mock('@/lib/revalidate', () => ({
  revalidateCmsTarget: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
}));

import { PATCH, POST } from '@/app/api/cms/zones/route';
import { requireCmsAuth } from '@/lib/cms-auth';
import { revalidateTag } from 'next/cache';
import { revalidateCmsTarget } from '@/lib/revalidate';

describe('API /api/cms/zones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertHistory.mockResolvedValue({ error: null });
    mockUpsertZones.mockResolvedValue({ error: null });
    mockMaybeSingle.mockResolvedValue({
      data: { id: '00000000-0000-0000-0000-000000000001', value: 'Ancienne valeur' },
    });
  });

  describe('PATCH - mise à jour rapide et historisation (Fiche cf31fe6d)', () => {
    it('refuse les requêtes non authentifiées (401)', async () => {
      (requireCmsAuth as any).mockResolvedValue(
        NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      );

      const req = new NextRequest('http://localhost:3000/api/cms/zones', {
        method: 'PATCH',
        body: JSON.stringify({ page: 'home', zone_key: 'hero_title', value: 'Test' }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
      expect(mockInsertHistory).not.toHaveBeenCalled();
      expect(mockUpsertZones).not.toHaveBeenCalled();
    });

    it('refuse une requête sans page ou zone_key (400)', async () => {
      (requireCmsAuth as any).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/cms/zones', {
        method: 'PATCH',
        body: JSON.stringify({ value: 'Test' }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it('insère dans cms_zone_history avec les colonnes exactes de la table', async () => {
      (requireCmsAuth as any).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/cms/zones', {
        method: 'PATCH',
        body: JSON.stringify({
          page: 'destinations-sardaigne',
          zone_key: 'period_1',
          value: 'Mai – Juin : idéal',
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Vérification des noms de colonnes : page, zone_key, old_value, new_value, changed_at
      expect(mockInsertHistory).toHaveBeenCalledTimes(1);
      const payload = mockInsertHistory.mock.calls[0][0];

      expect(payload).toEqual({
        page: 'destinations-sardaigne',
        zone_key: 'period_1',
        old_value: 'Ancienne valeur',
        new_value: 'Mai – Juin : idéal',
        changed_at: expect.any(String),
      });

      // Prouver l'absence des 3 anciennes colonnes fautives
      expect(payload.zone_id).toBeUndefined();
      expect(payload.previous_value).toBeUndefined();
      expect(payload.created_at).toBeUndefined();

      // Vérifier l'invalidation instantanée du cache
      expect(revalidateTag).toHaveBeenCalledWith('cms-zones');
      expect(revalidateCmsTarget).toHaveBeenCalledWith({ page: 'destinations-sardaigne' });
    });

    it('ne crée pas d\'historique si la valeur est inchangée', async () => {
      (requireCmsAuth as any).mockResolvedValue(null);
      mockMaybeSingle.mockResolvedValue({
        data: { id: '00000000-0000-0000-0000-000000000001', value: 'Valeur identique' },
      });

      const req = new NextRequest('http://localhost:3000/api/cms/zones', {
        method: 'PATCH',
        body: JSON.stringify({
          page: 'home',
          zone_key: 'hero_title',
          value: 'Valeur identique',
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(mockInsertHistory).not.toHaveBeenCalled();
      expect(mockUpsertZones).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST - sauvegarde complète', () => {
    it('invalide le cache on-demand via revalidateTag', async () => {
      (requireCmsAuth as any).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/cms/zones', {
        method: 'POST',
        body: JSON.stringify({
          page: 'global',
          zone_key: 'instagram_cta_text',
          value: 'Nous suivre sur Instagram @heldonica',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockUpsertZones).toHaveBeenCalledTimes(1);
      expect(revalidateTag).toHaveBeenCalledWith('cms-zones');
      expect(revalidateCmsTarget).toHaveBeenCalledWith({ page: 'global' });
    });
  });
});
