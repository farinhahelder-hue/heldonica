import { describe, it, expect } from 'vitest';
import { checkEditorialRules } from '../../../lib/editorial-checks';
import { render, screen } from '@testing-library/react';
import EditorialWarnings from '../../../components/admin/EditorialWarnings';

describe('lib/editorial-checks.ts', () => {
  it('should flag empty or short content', () => {
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Trop court</p>', 'Carnets Voyage');
    const shortWarning = warnings.find(w => w.id === 'short_content');
    expect(shortWarning).toBeDefined();
    expect(shortWarning?.priority).toBe('high');
  });

  it('should detect temporary markers', () => {
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Ceci est un test avec un lorem ipsum à changer</p>'.repeat(10), 'Carnets Voyage');
    const tempWarning = warnings.find(w => w.id === 'temp_marker_lorem ipsum');
    expect(tempWarning).toBeDefined();
    expect(tempWarning?.priority).toBe('high');
  });

  it('should detect forbidden words', () => {
    const warnings = checkEditorialRules('Titre incroyable', 'Extrait', '<p>Ceci est un texte long pour atteindre les 300 caractères requis, c\'est magnifique, vraiment magnifique. voyage organisé ici '.repeat(10) + '</p>', 'Carnets Voyage');
    const forbiddenWarning = warnings.find(w => w.id.startsWith('forbidden_word_magnifique'));
    expect(forbiddenWarning).toBeDefined();
    expect(forbiddenWarning?.priority).toBe('medium');
    expect(forbiddenWarning?.context).toContain('magnifique');

    const forbiddenWarning2 = warnings.find(w => w.id.startsWith('forbidden_word_incroyable'));
    expect(forbiddenWarning2).toBeDefined();

    const forbiddenWarning3 = warnings.find(w => w.id.startsWith('forbidden_word_voyage organisé'));
    expect(forbiddenWarning3).toBeDefined();
  });

  it('should detect mixed pronouns', () => {
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Je vous invite à lire ceci. Tu vas voir, c\'est sympa. '.repeat(10) + '</p>', 'Carnets Voyage');
    const pronounsWarning = warnings.find(w => w.id === 'mixed_pronouns');
    expect(pronounsWarning).toBeDefined();
    expect(pronounsWarning?.priority).toBe('low');
  });

  it('should warn about missing practical info in guides', () => {
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Ceci est un long guide mais il ne contient pas de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de de.</p>', 'Guides Pratiques');
    const practicalWarning = warnings.find(w => w.id === 'missing_practical_info');
    expect(practicalWarning).toBeDefined();
    expect(practicalWarning?.priority).toBe('low');
  });

  it('should handle null category', () => {
    // @ts-ignore
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Texte très long ici test</p>'.repeat(15), null);
    expect(warnings).toBeDefined();
  });

  it('should check for missing experience', () => {
    const warnings = checkEditorialRules('Titre', 'Extrait', '<p>Ce texte est très neutre et long et ne contient pas de première personne. '.repeat(10) + '</p>', 'Carnets Voyage');
    const experienceWarning = warnings.find(w => w.id === 'missing_experience');
    expect(experienceWarning).toBeDefined();
  });
});

describe('components/admin/EditorialWarnings', () => {
  it('renders nothing when there are no warnings', () => {
    const longContent = '<p>' + 'Ceci est un article avec notre avis, on a testé et on a moins aimé le prix. '.repeat(10) + '</p>';
    const { container } = render(
      <EditorialWarnings title="Titre" excerpt="Extrait" content={longContent} category="Carnets Voyage" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders warnings when there are issues', () => {
    render(<EditorialWarnings title="Titre" excerpt="Extrait" content="Trop court" category="Carnets Voyage" />);
    expect(screen.getByText(/Contrôle Éditorial/i)).toBeDefined();
    expect(screen.getByText(/Le contenu est vide ou très court/i)).toBeDefined();
  });
});
