import { describe, it, expect } from 'vitest';
import {
  generatePhotoInterviewQuestions,
  synthesizePhotoInterview,
} from '@/lib/cms-photo-interview';

/**
 * Règle n°1 du projet : « on n'invente rien ». Ces tests verrouillent les endroits
 * où le moteur d'interview affirmait des choses qu'il n'avait pas observées.
 */
describe('interview photo — aucune invention', () => {
  describe('indices visuels', () => {
    it('n’affirme rien sur une photo qu’il n’a pas regardée', () => {
      const q = generatePhotoInterviewQuestions({
        imageUrl: 'https://exemple.test/photo.jpg',
      });

      expect(q.visualClues).toEqual([]);
    });

    it('ne prétend pas voir une lumière ou un cadrage sans analyse', () => {
      const q = generatePhotoInterviewQuestions({
        imageUrl: 'https://exemple.test/photo.jpg',
        location: 'Stoos',
        date: '2025-07-15',
      });

      const tout = q.visualClues.join(' ');
      expect(tout).not.toMatch(/lumière naturelle/i);
      expect(tout).not.toMatch(/cadrage de terrain/i);
    });

    it('reprend les indices fournis par une analyse visuelle réelle', () => {
      const q = generatePhotoInterviewQuestions({
        imageUrl: 'https://exemple.test/photo.jpg',
        location: 'Stoos',
        visualClues: ['mur de pierre sèche', 'une seule chaise rouge'],
      });

      expect(q.visualClues).toContain('mur de pierre sèche');
      expect(q.visualClues).toContain('une seule chaise rouge');
      expect(q.visualClues).toContain('Localisation repérée : Stoos');
    });

    it('écarte les indices vides', () => {
      const q = generatePhotoInterviewQuestions({
        imageUrl: 'https://exemple.test/photo.jpg',
        visualClues: ['  ', ''],
      });

      expect(q.visualClues).toEqual([]);
    });
  });

  describe('synthèse', () => {
    it('ne fabrique aucune phrase quand le duo n’a rien répondu', () => {
      const s = synthesizePhotoInterview(
        { sensory: '', concrete: '', counterpoint: '' },
        { location: 'Stoos', imageUrl: 'https://exemple.test/photo.jpg' }
      );

      expect(s.anecdote).toBe('');
      expect(s.richParagraph).toBe('');
      expect(s.richParagraph).not.toMatch(/on s'est posés/i);
      expect(s.richParagraph).not.toMatch(/on a pris le temps/i);
    });

    it('ne date pas la photo du jour de rédaction quand la date est inconnue', () => {
      const s = synthesizePhotoInterview(
        { sensory: 'Le silence d’alpage.', concrete: '' },
        { location: 'Stoos', imageUrl: 'https://exemple.test/photo.jpg' }
      );

      const bloc = s.suggestedBlocks.find((b) => b.type === 'photo_evidence');
      const aujourdhui = new Date().toISOString().split('T')[0];

      expect(bloc?.data.date).toBe('');
      expect(bloc?.data.date).not.toBe(aujourdhui);
    });

    it('ne remplace pas un lieu inconnu par un lieu inventé', () => {
      const s = synthesizePhotoInterview(
        { sensory: 'Le silence d’alpage.', concrete: '' },
        { imageUrl: 'https://exemple.test/photo.jpg' }
      );

      const bloc = s.suggestedBlocks.find((b) => b.type === 'photo_evidence');
      expect(bloc?.data.location).toBe('');
      expect(bloc?.data.location).not.toBe('Lieu vérifié');
    });

    it('ne restitue que les réponses du duo, dans leur ordre', () => {
      const s = synthesizePhotoInterview({
        sensory: 'Le silence d’alpage.',
        concrete: 'Funiculaire à 22 CHF.',
        counterpoint: 'La chaleur au parking.',
      });

      expect(s.richParagraph).toBe('Le silence d’alpage. Funiculaire à 22 CHF.');
    });
  });
});
