import { describe, it, expect } from 'vitest';
import {
  computeReadingMetrics,
  countWords,
  extractPlainText,
  SLOW_READING_WPM,
} from '@/lib/cms-reading-metrics';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Reading Metrics & Slow Travel Analysis', () => {
  it('extrait le texte brut sans balises HTML ni blocs de sérialisation', () => {
    const raw = `
      <h2>Voyage à Madère</h2>
      <p>Un sentier au cœur de la laurissilva.</p>
      <!-- heldonica:blocks [{"id":"b1","type":"text"}] -->
    `;
    const cleaned = extractPlainText(raw);
    expect(cleaned).toContain('Voyage à Madère');
    expect(cleaned).toContain('Un sentier au cœur de la laurissilva.');
    expect(cleaned).not.toContain('heldonica:blocks');
    expect(cleaned).not.toContain('<h2>');
  });

  it('compte précisément les mots avec apostrophes françaises', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords("L'aventure commence à l'aube sur les crêtes.")).toBe(9);
  });

  it('calcule les métriques pour un article structuré par blocs', () => {
    const blocks: CmsBlock[] = [
      { id: 'b1', type: 'heading', level: 2, text: 'Halte à Paul do Mar' },
      {
        id: 'b2',
        type: 'text',
        content: 'Nous arrivons dans ce village de pêcheurs au crépuscule. Le silence n’est troublé que par le ressac de l’Atlantique.',
      },
      {
        id: 'b3',
        type: 'photo_evidence',
        imageUrl: 'https://cdn.heldonica.fr/paul-do-mar.jpg',
        location: 'Paul do Mar, Madère',
        date: '2026-05-14',
        anecdote: 'Rencontre avec le gardien du phare au coucher du soleil.',
      },
      {
        id: 'b4',
        type: 'vault_spot',
        title: 'Café da Vila',
        location: 'Paul do Mar',
        livedExperience: 'Dégustation d’un bolo do caco encore tiède.',
      },
    ];

    const metrics = computeReadingMetrics({
      title: 'Madère secrète',
      blocks,
      season: 'Printemps doux',
      mobility: 'Marche & bus local',
      budget_level: 'Local & mesuré',
    });

    expect(metrics.wordCount).toBeGreaterThan(30);
    expect(metrics.headingCount).toBe(1);
    expect(metrics.photoEvidenceCount).toBe(1);
    expect(metrics.vaultSpotCount).toBe(1);
    expect(metrics.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(metrics.slowScoreBreakdown.visualEvidence).toBe(20);
    expect(metrics.slowScoreBreakdown.slowTaxonomy).toBe(20);
    expect(metrics.slowScoreBreakdown.bannedWordsPurity).toBe(20);
    expect(metrics.detectedForbiddenWords).toHaveLength(0);
  });

  it('détecte les mots bannis et ajuste le score et les recommandations', () => {
    const content = `
      Voici un véritable bon plan et un lieu incontournable pour les voyageurs.
      Une expérience magique vous attend.
    `;

    const metrics = computeReadingMetrics({
      content,
    });

    expect(metrics.detectedForbiddenWords).toContain('bon plan');
    expect(metrics.detectedForbiddenWords).toContain('incontournable');
    expect(metrics.slowScoreBreakdown.bannedWordsPurity).toBe(0);
    expect(metrics.recommendations.some((r) => r.includes('bannis'))).toBe(true);
  });

  it('adapte le libellé du temps de lecture selon la durée', () => {
    const shortText = 'Quelques mots simples.';
    const shortMetrics = computeReadingMetrics({ content: shortText });
    expect(shortMetrics.readingTimeFormatted).toBe('< 1 min de lecture');
    expect(shortMetrics.readingPace).toBe('rapide');

    // 800 mots -> ~4-5 minutes
    const longWords = Array.from({ length: 800 }, () => 'montagne').join(' ');
    const longMetrics = computeReadingMetrics({ content: longWords });
    expect(longMetrics.readingTimeFormatted).toContain('min de lecture calme');
    expect(longMetrics.readingPace).toBe('calme');
  });
});
