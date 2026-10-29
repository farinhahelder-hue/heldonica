import { describe, it, expect } from 'vitest';
import { createDefaultBlock, type BlockType } from '@/types/cms-blocks';
import {
  BLOCK_SCHEMAS,
  blockSchemaFor,
  schemaTypes,
  validateBlock,
  validateBlocks,
} from '@/lib/cms-schema';

describe('registre de schemas de blocs', () => {
  it('couvre chaque type et ne declare pas de doublon', () => {
    const types = schemaTypes();
    expect(new Set(types).size).toBe(types.length);
    expect(types).toHaveLength(BLOCK_SCHEMAS.length);
    for (const schema of BLOCK_SCHEMAS) {
      expect(blockSchemaFor(schema.type)?.title).toBeTruthy();
    }
  });

  it('accepte les blocs que la fabrique produit par defaut', () => {
    // Si un defaut ne passe pas son propre schema, c'est le schema ou le
    // defaut qui ment — pas l'utilisateur qui remplit le formulaire.
    for (const schema of BLOCK_SCHEMAS) {
      const bloc = createDefaultBlock(schema.type as BlockType);
      expect(validateBlock(bloc, schema), schema.type).toEqual([]);
    }
  });

  it('signale un bloc texte sans contenu', () => {
    const { content: _ignore, ...sansContenu } = createDefaultBlock('text') as {
      content: string;
    } & Record<string, unknown>;
    const schema = blockSchemaFor('text');
    expect(schema).toBeDefined();
    const issues = validateBlock(sansContenu, schema!);
    expect(issues.map((i) => i.path)).toContain('content');
  });

  it('refuse une valeur hors liste pour le cadrage d’image', () => {
    const schema = blockSchemaFor('image')!;
    const issues = validateBlock(
      {
        id: 'blk_img_1',
        type: 'image',
        url: 'https://heldonica.fr/photo.jpg',
        alt: 'Falaises',
        layout: 'pleine-largeur',
      },
      schema
    );
    expect(issues.map((i) => i.path)).toContain('layout');
  });

  it('borne l’anecdote d’une preuve photo a 200 caracteres', () => {
    const schema = blockSchemaFor('photo_evidence')!;
    const bloc = {
      id: 'blk_photo_1',
      type: 'photo_evidence',
      imageUrl: 'https://heldonica.fr/preuve.jpg',
      location: 'Madere',
      date: '2026-10-29',
      anecdote: 'a'.repeat(201),
    };
    const issues = validateBlock(bloc, schema);
    expect(issues.map((i) => i.path)).toContain('anecdote');
    expect(validateBlock({ ...bloc, anecdote: 'a'.repeat(200) }, schema)).toEqual([]);
  });

  it('remonte l’index et le type des blocs fautifs dans un document', () => {
    // Une URL vide reste un etat d'edition (le bloc par defaut en a une) :
    // c'est l'absence complete du champ qui est fautive.
    const issues = validateBlocks([
      createDefaultBlock('text'),
      { id: 'blk_x', type: 'bloc_inconnu' },
      { id: 'blk_img', type: 'image', alt: 'Falaises', layout: 'inline' },
    ]);

    expect(issues.some((i) => i.index === 1 && i.message.includes('inconnu'))).toBe(true);
    expect(issues.some((i) => i.index === 2 && i.path === 'url')).toBe(true);
  });

  it('refuse autre chose qu’un tableau de blocs', () => {
    expect(validateBlocks({ type: 'text' })[0].message).toContain('tableau');
  });
});
