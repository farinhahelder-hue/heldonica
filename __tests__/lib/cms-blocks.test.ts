import { describe, it, expect } from 'vitest';
import { htmlToBlocks, blocksToHtml } from '@/lib/cms-blocks-converter';
import { createDefaultBlock } from '@/types/cms-blocks';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Blocks Module & Converter', () => {
  it('should generate valid default blocks for all 8 types', () => {
    const types = ['heading', 'text', 'image', 'gallery', 'button', 'list', 'video', 'vault_spot'] as const;
    types.forEach((type) => {
      const block = createDefaultBlock(type);
      expect(block.id).toBeDefined();
      expect(block.type).toBe(type);
    });
  });

  it('should convert raw text with double newlines into TextBlocks and HeadingBlocks', () => {
    const raw = `
## Titre de section

Premier paragraphe du carnet de voyage.

Deuxième paragraphe avec plus de détails authentiques.
    `.trim();

    const blocks = htmlToBlocks(raw);
    expect(blocks.length).toBe(3);
    expect(blocks[0].type).toBe('heading');
    if (blocks[0].type === 'heading') {
      expect(blocks[0].text).toBe('Titre de section');
      expect(blocks[0].level).toBe(2);
    }
    expect(blocks[1].type).toBe('text');
    expect(blocks[2].type).toBe('text');
  });

  it('should convert HTML tags into structured blocks', () => {
    const html = `
<h2>Miradouro da Ponta do Rosto</h2>
<p>Un panorama à couper le souffle au lever du soleil sur Madère.</p>
<figure><img src="https://images.unsplash.com/photo-12345" alt="Falaise de Madère" /><figcaption>Brume matinale</figcaption></figure>
<ul><li>Prendre une veste coupe-vent</li><li>Arriver 20 minutes avant l'aube</li></ul>
    `.trim();

    const blocks = htmlToBlocks(html);
    expect(blocks.length).toBe(4);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[1].type).toBe('text');
    expect(blocks[2].type).toBe('image');
    if (blocks[2].type === 'image') {
      expect(blocks[2].caption).toBe('Brume matinale');
      expect(blocks[2].url).toBe('https://images.unsplash.com/photo-12345');
    }
    expect(blocks[3].type).toBe('list');
    if (blocks[3].type === 'list') {
      expect(blocks[3].items).toEqual(['Prendre une veste coupe-vent', "Arriver 20 minutes avant l'aube"]);
    }
  });

  it('should serialize blocks back into clean semantic HTML', () => {
    const blocks: CmsBlock[] = [
      { id: 'b1', type: 'heading', level: 2, text: 'Notre halte secrète' },
      { id: 'b2', type: 'text', content: 'Le village de Paul do Mar au crépuscule.' },
      { id: 'b3', type: 'button', label: 'Voir la carte', url: '/carte', variant: 'primary_gold' },
    ];

    const html = blocksToHtml(blocks);
    expect(html).toContain('<h2>Notre halte secrète</h2>');
    expect(html).toContain('<p>Le village de Paul do Mar au crépuscule.</p>');
    expect(html).toContain('<a href="/carte" class="btn-heldonica">Voir la carte</a>');
  });

  it('should achieve 100% lossless round-trip serialization and deserialization', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'blk_h1', type: 'heading', level: 1, text: 'Traversée du Monténégro', subtitle: 'Notes de carnet' },
      { id: 'blk_txt1', type: 'text', content: 'Un matin brumeux sur la Moraca.' },
      {
        id: 'blk_vault1',
        type: 'vault_spot',
        spotId: 'spot_stara_varos',
        title: 'Stara Varoš & Sahat Kula',
        location: 'Podgorica, Monténégro',
        livedExperience: 'Quartier ottoman silencieux au lever du jour.',
      },
      {
        id: 'blk_photo1',
        type: 'photo_evidence',
        imageUrl: 'https://www.heldonica.fr/photos/moraca.jpg',
        location: 'Podgorica, Monténégro',
        date: '2026-05-28',
        anecdote: 'L’eau turquoise sous le pont du Millénaire.',
        albumLink: '/albums/montenegro-podgorica-2026',
      },
    ];

    const html = blocksToHtml(initialBlocks);
    const restoredBlocks = htmlToBlocks(html);

    expect(restoredBlocks).toEqual(initialBlocks);
    expect(restoredBlocks[0].id).toBe('blk_h1');
    expect(restoredBlocks[2].type).toBe('vault_spot');
    expect((restoredBlocks[2] as any).spotId).toBe('spot_stara_varos');
    expect(restoredBlocks[3].type).toBe('photo_evidence');
    expect((restoredBlocks[3] as any).albumLink).toBe('/albums/montenegro-podgorica-2026');
  });

  it('should parse legacy HTML aside vault-spot and figure photo-evidence without embedded comments', () => {
    const legacyHtml = `
<h2>Halte recommandée</h2>
<aside class="vault-spot-highlight">
  <strong>Café Laika</strong> (Bucarest, Roumanie)
  <blockquote>Pause café de quartier authentique loin du tumulte.</blockquote>
</aside>
<figure class="photo-evidence">
  <img src="https://www.heldonica.fr/bucarest.jpg" alt="Café" />
  <figcaption>📍 Bucarest – 📅 2026-06-15</figcaption>
  <blockquote>Terrasse ombragée.</blockquote>
</figure>
    `.trim();

    const blocks = htmlToBlocks(legacyHtml);
    expect(blocks.length).toBe(3);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[1].type).toBe('vault_spot');
    if (blocks[1].type === 'vault_spot') {
      expect(blocks[1].title).toBe('Café Laika');
      expect(blocks[1].location).toBe('Bucarest, Roumanie');
      expect(blocks[1].livedExperience).toBe('Pause café de quartier authentique loin du tumulte.');
    }
    expect(blocks[2].type).toBe('photo_evidence');
    if (blocks[2].type === 'photo_evidence') {
      expect(blocks[2].location).toBe('Bucarest');
      expect(blocks[2].date).toBe('2026-06-15');
      expect(blocks[2].anecdote).toBe('Terrasse ombragée.');
    }
  });

  it('should gracefully fallback to HTML parser if embedded comment is corrupted', () => {
    const corruptedHtml = `
<h2>Titre valide</h2>
<p>Contenu récupérable</p>
<!-- heldonica:blocks { corrupt json ] -->
    `.trim();

    const blocks = htmlToBlocks(corruptedHtml);
    expect(blocks.length).toBe(2);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[1].type).toBe('text');
  });
});
