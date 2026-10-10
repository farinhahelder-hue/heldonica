import { describe, it, expect } from 'vitest';
import {
  generatePhotoInterviewQuestions,
  synthesizePhotoInterview,
} from '@/lib/cms-photo-interview';

describe('CMS Photo Interview Module (lib/cms-photo-interview.ts)', () => {
  it('génère 3 questions d\'interview ciblées ancrées dans la photo et le lieu', () => {
    const questions = generatePhotoInterviewQuestions({
      imageUrl: 'https://images.unsplash.com/photo-test-alps.jpg',
      location: 'Stoos, Schwyz',
      date: '2025-07-15',
    });

    expect(questions.imageUrl).toBe('https://images.unsplash.com/photo-test-alps.jpg');
    expect(questions.location).toBe('Stoos, Schwyz');
    expect(questions.date).toBe('2025-07-15');
    expect(questions.questions.sensory).toContain('Stoos, Schwyz');
    expect(questions.questions.sensory).toContain('son');
    expect(questions.questions.concrete).toContain('prix');
    expect(questions.questions.counterpoint).toContain('moins aimé');
    expect(questions.visualClues.length).toBeGreaterThan(0);
  });

  it('tisse un récit slow travel conforme à la charte et sans mot banni', () => {
    const synthesis = synthesizePhotoInterview(
      {
        sensory: 'Le silence d\'alpage était total avec le tintement des clarines des vaches en contrebas.',
        concrete: 'Funiculaire à 22 CHF après 16h, sentier de crête raide mais praticable.',
        counterpoint: 'La chaleur étouffante au parking dans la vallée avant de monter.',
      },
      {
        location: 'Crête de Stoos',
        date: '2025-07-15',
        imageUrl: 'https://images.unsplash.com/photo-test-alps.jpg',
      }
    );

    expect(synthesis.anecdote).toContain('silence d\'alpage');
    expect(synthesis.anecdote.length).toBeLessThanOrEqual(200);
    expect(synthesis.richParagraph).toContain('Crête de Stoos');
    expect(synthesis.counterpointNote).toContain('chaleur étouffante');
    expect(synthesis.isBrandConform).toBe(true);
    expect(synthesis.forbiddenWordsDetected).toEqual([]);
    expect(synthesis.suggestedBlocks.length).toBe(2);
    expect(synthesis.suggestedBlocks[0].type).toBe('photo_evidence');
    expect(synthesis.suggestedBlocks[1].type).toBe('text');
  });

  it('détecte les mots bannis si l\'utilisateur emploie un tic de langage', () => {
    const synthesis = synthesizePhotoInterview(
      {
        sensory: 'Un spot magnifique et paradisiaque.',
        concrete: 'Un bon plan incontournable.',
        counterpoint: 'Rien, c\'était une aventure inoubliable.',
      },
      {
        location: 'Madère',
      }
    );

    expect(synthesis.forbiddenWordsDetected.length).toBeGreaterThan(0);
    expect(synthesis.isBrandConform).toBe(false);
  });
});
