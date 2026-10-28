import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  collectReferencedTables,
  collectMigratedTables,
  findUnmigrated,
} from '../../scripts/check-cms-migrations.mjs';

/**
 * Ce contrôle existe parce qu'un commit rouge (a48552a, 2026-10-10) a atterri
 * sur main avec 9 tables jamais migrées. On teste donc deux choses : qu'il
 * détecte une table non migrée, et qu'il ne crie pas au loup sur une table
 * migrée ou explicitement exceptionnée.
 */
describe('check-cms-migrations — toute table référencée doit être migrée', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'cms-migrations-'));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('détecte une table référencée sans migration', () => {
    const dir = join(root, 'cas-1');
    mkdirSync(join(dir, 'lib'), { recursive: true });
    mkdirSync(join(dir, 'migrations'), { recursive: true });
    writeFileSync(
      join(dir, 'lib', 'code.ts'),
      "const r = await sb.from('table_non_migree').select('*');\n"
    );
    writeFileSync(
      join(dir, 'migrations', '0001.sql'),
      'CREATE TABLE IF NOT EXISTS autre_table (id uuid);\n'
    );

    const referenced = collectReferencedTables(['lib'], (d) => [join(dir, d, 'code.ts')]);
    const migrated = collectMigratedTables(join(dir, 'migrations'));

    expect([...referenced.keys()]).toContain('table_non_migree');
    expect(findUnmigrated(referenced, migrated, new Set())).toEqual(['table_non_migree']);
  });

  it('accepte une table migrée', () => {
    const dir = join(root, 'cas-2');
    mkdirSync(join(dir, 'lib'), { recursive: true });
    mkdirSync(join(dir, 'migrations'), { recursive: true });
    writeFileSync(join(dir, 'lib', 'code.ts'), "await sb.from('table_migree').insert({});\n");
    writeFileSync(
      join(dir, 'migrations', '0001.sql'),
      'CREATE TABLE IF NOT EXISTS public.table_migree (id uuid);\n'
    );

    const referenced = collectReferencedTables(['lib'], (d) => [join(dir, d, 'code.ts')]);
    const migrated = collectMigratedTables(join(dir, 'migrations'));

    expect(findUnmigrated(referenced, migrated, new Set())).toEqual([]);
  });

  it('accepte une table inscrite dans les exceptions', () => {
    const referenced = new Map([['table_legacy', new Set(['lib/x.ts'])]]);
    const migrated = new Set<string>();
    expect(findUnmigrated(referenced, migrated, new Set(['table_legacy']))).toEqual([]);
  });

  it('ignore storage.from(), qui vise un bucket et non une table', () => {
    const dir = join(root, 'cas-4');
    mkdirSync(join(dir, 'lib'), { recursive: true });
    writeFileSync(
      join(dir, 'lib', 'code.ts'),
      "await sb.storage.from('media').upload(path, file);\nawait sb.from('vraie_table').select('*');\n"
    );
    const referenced = collectReferencedTables(['lib'], (d) => [join(dir, d, 'code.ts')]);
    expect([...referenced.keys()]).toEqual(['vraie_table']);
  });

  it('lit CREATE TABLE, IF NOT EXISTS et le préfixe public.', () => {
    const dir = join(root, 'cas-5');
    mkdirSync(join(dir, 'migrations'), { recursive: true });
    writeFileSync(
      join(dir, 'migrations', '0001.sql'),
      [
        'CREATE TABLE a_table (id uuid);',
        'CREATE TABLE IF NOT EXISTS b_table (id uuid);',
        'CREATE TABLE IF NOT EXISTS public.c_table (id uuid);',
      ].join('\n')
    );
    const migrated = collectMigratedTables(join(dir, 'migrations'));
    expect([...migrated].sort()).toEqual(['a_table', 'b_table', 'c_table']);
  });

  it('compte les vues comme des objets migrés (destinations_public)', () => {
    // Une vue se lit par .from() comme une table et a sa migration : sans cette
    // reconnaissance, toute vue référencée passait pour une table non migrée.
    const dir = join(root, 'cas-6');
    mkdirSync(join(dir, 'migrations'), { recursive: true });
    writeFileSync(
      join(dir, 'migrations', '0002.sql'),
      [
        'CREATE OR REPLACE VIEW d_public AS SELECT 1;',
        'CREATE VIEW public.e_public AS SELECT 1;',
      ].join('\n')
    );
    const migrated = collectMigratedTables(join(dir, 'migrations'));
    expect([...migrated].sort()).toEqual(['d_public', 'e_public']);
  });

  it('protège le dépôt : aucune table référencée sans migration', () => {
    const referenced = collectReferencedTables();
    const migrated = collectMigratedTables();
    const unmigrated = findUnmigrated(referenced, migrated);

    // Un échec ici signifie qu'une table vient d'être référencée sans migration.
    // Écrire la migration, ou l'inscrire dans LEGACY_UNMIGRATED avec la raison.
    expect(unmigrated).toEqual([]);
    expect(referenced.size).toBeGreaterThan(40);
  });
});
