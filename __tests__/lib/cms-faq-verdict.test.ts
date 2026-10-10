import { describe, it, expect } from 'vitest';
import {
  generateFaqItems,
  generateVerdict,
  generateFaqVerdictBundle,
} from '@/lib/cms-faq-verdict-generator';

describe('CMS FAQ & Verdict Generator (lib/cms-faq-verdict-generator.ts)', () => {
  it('génère des questions-réponses spécifiques ancrées dans le vécu sans blabla générique', () => {
    const faqs = generateFaqItems({
      destination: 'Stoos',
      season: 'été calme',
      mobility: 'funiculaire et marche',
    });

    expect(faqs.length).toBe(3);
    expect(faqs[0].question).toContain('meilleure heure');
    expect(faqs[0].answer).toContain('lever du soleil ou après 16h30');
    expect(faqs[1].question).toContain('mobilités douces');
    expect(faqs[2].question).toContain('chien');
  });

  it('génère un verdict sans complaisance avec score et piège à éviter', () => {
    const verdict = generateVerdict({
      destination: 'Crêtes de Stoos',
      highlight: 'Le calme retrouvé dès 19h quand les remontées s\'arrêtent.',
      pitfall: 'Monter en plein cagnard à midi au milieu des groupes.',
      idealSeason: 'Automne doré',
      score: 9.0,
    });

    expect(verdict.destination).toBe('Crêtes de Stoos');
    expect(verdict.verdictScore).toBe(9.0);
    expect(verdict.highlight).toContain('19h');
    expect(verdict.pitfall).toContain('cagnard');
    expect(verdict.isBrandConform).toBe(true);
    expect(verdict.forbiddenWordsDetected).toEqual([]);
  });

  it('génère un pack complet FAQ + Verdict cohérent', () => {
    const bundle = generateFaqVerdictBundle({
      destination: 'Madère',
      season: 'automne',
      mobility: 'marche le long des levadas',
    });

    expect(bundle.faqs.length).toBe(3);
    expect(bundle.verdict.destination).toBe('Madère');
    expect(bundle.verdict.verdictScore).toBeGreaterThanOrEqual(7);
  });
});
