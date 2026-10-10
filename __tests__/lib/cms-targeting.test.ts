import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCurrentSeason,
  matchesTargetingRules,
  selectBestVariant,
  ZoneVariant,
  TargetingRules,
} from '@/lib/cms-targeting';

describe('CMS Targeting — Moteur de Variantes & Personnalisation Slow Travel', () => {
  it('détermine avec précision la saison selon la date', () => {
    expect(getCurrentSeason(new Date('2026-04-15'))).toBe('spring');
    expect(getCurrentSeason(new Date('2026-07-20'))).toBe('summer');
    expect(getCurrentSeason(new Date('2026-10-08'))).toBe('autumn');
    expect(getCurrentSeason(new Date('2026-01-10'))).toBe('winter');
  });

  it('valide des règles de ciblage universelles (vides)', () => {
    const rules: TargetingRules = {};
    expect(matchesTargetingRules(rules, {})).toBe(true);
  });

  it('valide ou rejette selon la saison ciblée', () => {
    const autumnRules: TargetingRules = { season: 'autumn' };
    const dateAutumn = new Date('2026-10-08');
    const dateSpring = new Date('2026-05-02');

    expect(matchesTargetingRules(autumnRules, { date: dateAutumn })).toBe(true);
    expect(matchesTargetingRules(autumnRules, { date: dateSpring })).toBe(false);
  });

  it('valide ou rejette selon le persona / audience ciblée', () => {
    const coupleRules: TargetingRules = { audience: 'couple_slow_travel' };

    expect(matchesTargetingRules(coupleRules, { audience: 'couple_slow_travel' })).toBe(true);
    expect(matchesTargetingRules(coupleRules, { audience: 'hotelier_b2b' })).toBe(false);
  });

  it('valide les sources UTM sans distinction de casse', () => {
    const utmRules: TargetingRules = { utm_source: 'newsletter' };

    expect(matchesTargetingRules(utmRules, { utm_source: 'Newsletter_Septembre' })).toBe(true);
    expect(matchesTargetingRules(utmRules, { utm_source: 'instagram' })).toBe(false);
  });

  it('sélectionne la variante active ayant la priorité la plus élevée', () => {
    const variants: ZoneVariant[] = [
      {
        id: 'var-1',
        page: 'home',
        zone_key: 'hero_title',
        variant_name: 'Standard Automne',
        value: 'L’automne au ralenti',
        rules: { season: 'autumn' },
        priority: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'var-2',
        page: 'home',
        zone_key: 'hero_title',
        variant_name: 'Automne Couple Campagne Spéciale',
        value: 'Retrouvez-vous à deux cet automne',
        rules: { season: 'autumn', audience: 'couple_slow_travel' },
        priority: 50,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'var-3',
        page: 'home',
        zone_key: 'hero_title',
        variant_name: 'Variante Désactivée',
        value: 'Ne pas afficher',
        rules: { season: 'autumn' },
        priority: 100,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Contexte avec audience couple : doit choisir var-2 (priorité 50)
    const bestCouple = selectBestVariant(variants, {
      date: new Date('2026-10-08'),
      audience: 'couple_slow_travel',
    });
    expect(bestCouple?.id).toBe('var-2');
    expect(bestCouple?.value).toBe('Retrouvez-vous à deux cet automne');

    // Contexte sans audience spécifique : doit choisir var-1 (priorité 10)
    const bestGeneric = selectBestVariant(variants, {
      date: new Date('2026-10-08'),
    });
    expect(bestGeneric?.id).toBe('var-1');
  });
});
