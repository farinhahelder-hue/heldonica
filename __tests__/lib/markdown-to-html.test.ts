import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '@/lib/markdown-to-html';

describe('markdownToHtml', () => {
  it('convertit les titres ## en <h2>', () => {
    const html = markdownToHtml('## La Poncha\n\nUn texte.');
    expect(html).toContain('<h2>La Poncha</h2>');
    expect(html).not.toContain('##');
  });

  it('respecte les niveaux de titre', () => {
    expect(markdownToHtml('# Un')).toContain('<h1>Un</h1>');
    expect(markdownToHtml('### Trois')).toContain('<h3>Trois</h3>');
  });

  it('convertit le gras ** en <strong>', () => {
    const html = markdownToHtml('Une **recette** authentique.');
    expect(html).toContain('<strong>recette</strong>');
    expect(html).not.toContain('**');
  });

  it('decoupe les paragraphes sur double retour a la ligne', () => {
    const html = markdownToHtml('Premier.\n\nSecond.');
    expect(html).toContain('<p>Premier.</p>');
    expect(html).toContain('<p>Second.</p>');
  });

  it('echappe le HTML brut present dans le texte', () => {
    const html = markdownToHtml('Un <script>alert(1)</script> texte.');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ne touche pas un contenu deja en HTML', () => {
    const source = '<p class="lead">Deja du HTML</p><h2>Titre</h2>';
    expect(markdownToHtml(source)).toBe(source);
  });

  it('gere les contenus vides', () => {
    expect(markdownToHtml('')).toBe('');
    expect(markdownToHtml(null)).toBe('');
    expect(markdownToHtml(undefined)).toBe('');
    expect(markdownToHtml('   ')).toBe('');
  });

  it('conserve le gras a l\'interieur d\'un titre', () => {
    const html = markdownToHtml('## Le **Vranac** local');
    expect(html).toBe('<h2>Le <strong>Vranac</strong> local</h2>');
  });

  it('convertit le contenu reel d\'un article markdown sans laisser de markdown', () => {
    const source = [
      '## La Poncha : le cocktail de Madère',
      '',
      "On l'a goûtée pour la première fois dans un bar de Ribeira Brava.",
      '',
      '## Qu\'est-ce que la poncha ?',
      '',
      'La boisson est préparée avec un **caralhinho**.',
    ].join('\n');
    const html = markdownToHtml(source);
    expect(html.match(/<h2>/g)).toHaveLength(2);
    expect(html).toContain('<strong>caralhinho</strong>');
    expect(html).not.toMatch(/^##\s/m);
    expect(html).not.toContain('**');
  });
});
