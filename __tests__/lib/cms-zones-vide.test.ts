import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Relevé du 20/10/2026 : `/destinations/roumanie/bucarest` affichait « Notre conseil »
 * sans texte, et `/destinations/alentejo` un kicker vide. Les deux zones existent en
 * base, actives, avec une valeur vide. `EditableZone` fait `zones[clé] ?? fallback` :
 * une chaîne vide n'est pas `undefined`, donc elle écrasait le fallback.
 */
const mockRows: any[] = [];

vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      if (table === 'cms_editable_zones') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: mockRows, error: null }),
            }),
          }),
        };
      }
      // cms_zone_variants : aucune variante dans ce test
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      };
    },
  }),
}));

import { getPageZones } from '@/lib/cms-zones';

describe('getPageZones — une zone active vide laisse jouer le fallback', () => {
  beforeEach(() => {
    mockRows.length = 0;
  });

  it('ignore une valeur vide et n’écrase pas le fallback', async () => {
    mockRows.push(
      { page: 'destinations-roumanie-bucarest', zone_key: 'local_tip', value: '' },
      { page: 'destinations-roumanie-bucarest', zone_key: 'local_tip_kicker', value: 'Notre conseil' },
    );

    const zones = await getPageZones('destinations-roumanie-bucarest');

    expect(zones['destinations-roumanie-bucarest__local_tip']).toBeUndefined();
    expect(zones['destinations-roumanie-bucarest__local_tip_kicker']).toBe('Notre conseil');
  });

  it('ignore une valeur faite d’espaces seuls', async () => {
    mockRows.push({ page: 'destinations-alentejo', zone_key: 'intro_label', value: '   ' });

    const zones = await getPageZones('destinations-alentejo');

    expect(zones['destinations-alentejo__intro_label']).toBeUndefined();
  });

  it('ignore une valeur nulle', async () => {
    mockRows.push({ page: 'home', zone_key: 'hero_title', value: null });

    const zones = await getPageZones('home');

    expect(zones['home__hero_title']).toBeUndefined();
  });

  it('conserve une valeur non vide, espaces autour compris', async () => {
    mockRows.push({ page: 'home', zone_key: 'hero_title', value: 'Slow travel vécu' });

    const zones = await getPageZones('home');

    expect(zones['home__hero_title']).toBe('Slow travel vécu');
  });
});
