import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { extraireMotsBannisTS, blocPython, appliquerBloc } from '../../scripts/sync-brand-voice.mjs';
import { CRITIQUES } from '../../scripts/check-workspace-sync.mjs';
import { CHECKS } from '../../scripts/garde-fous.mjs';

/**
 * Ces quatre scripts sont référencés par package.json (npm run preflight /
 * garde-fous / check:workspace / check:brand-sync) mais n'avaient jamais été
 * committés : les commandes échouaient en MODULE_NOT_FOUND. Ces tests
 * verrouillent leur existence et leur comportement.
 */
describe('outillage garde-fous — scripts du pré-vol', () => {
  describe('existence des fichiers référencés par package.json', () => {
    it('chaque script npm du pré-vol pointe vers un fichier réel', () => {
      const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
      const cles = ['preflight', 'garde-fous', 'check:workspace', 'check:brand-sync', 'sync:brand'];
      for (const c of cles) {
        const fichier = scripts[c].split(/\s+/)[1];
        expect(existsSync(fichier), `${c} -> ${fichier} manquant`).toBe(true);
      }
    });
  });

  describe('check-workspace-sync — modules critiques', () => {
    it('tous les modules critiques existent dans le dépôt', () => {
      const manquants = CRITIQUES.filter((f) => !existsSync(f));
      expect(manquants).toEqual([]);
    });

    it('sort en 0 sur un espace sain', () => {
      const out = execFileSync('node', ['scripts/check-workspace-sync.mjs'], { encoding: 'utf8' });
      expect(out).toContain('Espace de travail sain');
    });
  });

  describe('sync-brand-voice — extraction des mots bannis', () => {
    it('extrait la liste du TypeScript et gère les apostrophes échappées', () => {
      const mots = extraireMotsBannisTS(readFileSync('lib/brand-voice.ts', 'utf8'));
      expect(mots.length).toBeGreaterThan(40);
      expect(mots).toContain('incontournable');
      // « n\'attendez plus » : l'échappement doit être retiré.
      expect(mots).toContain("n'attendez plus");
      expect(mots.some((m) => m.includes("\\'"))).toBe(false);
    });

    it('produit un bloc Python réimportable tel quel', () => {
      const bloc = blocPython(['a', "b'c"]);
      expect(bloc).toContain('FORBIDDEN_WORDS = [');
      expect(bloc).toContain('"a"');
      expect(bloc).toContain('"b\'c"');
    });

    it('remplace le bloc balisé et est idempotent', () => {
      const py = readFileSync('lib/brand.py', 'utf8');
      const bloc = blocPython(extraireMotsBannisTS(readFileSync('lib/brand-voice.ts', 'utf8')));
      const une = appliquerBloc(py, bloc);
      const deux = appliquerBloc(une, bloc);
      expect(deux).toBe(une);
    });

    it('échoue si les balises ont disparu', () => {
      expect(() => appliquerBloc('FORBIDDEN_WORDS = []', 'bloc')).toThrow(/Balises/);
    });
  });

  describe('check-brand-sync — parité TS ↔ Python', () => {
    it('sort en 0 et annonce la liste alignée', () => {
      const out = execFileSync('node', ['scripts/check-brand-sync.mjs'], { encoding: 'utf8' });
      expect(out).toContain('Voix de marque synchronisée');
      expect(out).toContain('48 mots bannis');
    });
  });

  describe('garde-fous — agrégateur', () => {
    it('expose les 19 contrôles attendus', () => {
      expect(CHECKS).toHaveLength(19);
      expect(CHECKS.map((c) => c.key)).toContain('cms-migrations');
      expect(CHECKS.map((c) => c.key)).toContain('cms-cache');
      expect(CHECKS.map((c) => c.key)).toContain('brand-sync');
      expect(CHECKS.map((c) => c.key)).toContain('content-pages');
      expect(CHECKS.map((c) => c.key)).toContain('content-known-errors');
      expect(CHECKS.map((c) => c.key)).toContain('image-paths');
      expect(CHECKS.map((c) => c.key)).toContain('design-tics');
      expect(CHECKS.map((c) => c.key)).toContain('cms-hardcode');
      expect(CHECKS.map((c) => c.key)).toContain('content-html-escapes');
    });

    it('--preflight ne retient que les contrôles rapides et sans base', () => {
      const rapides = CHECKS.filter((c) => c.preflight);
      expect(rapides.length).toBeGreaterThanOrEqual(6);
      expect(rapides.every((c) => !c.needsDb)).toBe(true);
    });

    it('câble dans la CI tout contrôle de CHECKS qui ne dépend pas de la base', () => {
      // Un contrôle présent dans l'agrégateur mais lancé par aucun workflow est vert
      // en local et absent en CI : c'est ainsi que check:cms-cache a vérifié 119 pages
      // pendant des semaines sans que la CI le sache. Les contrôles needsDb sont
      // l'exception assumee (ils tournent derriere un if: selon les secrets).
      const yml = readFileSync('.github/workflows/garde-fous.yml', 'utf8');
      const statiques = CHECKS.filter((c) => !c.needsDb && c.script);
      const nonCables = statiques.map((c) => c.script).filter((s) => !yml.includes(`npm run ${s}`));
      expect(nonCables).toEqual([]);
    });
  });
});
