import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
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
    it('expose les 22 contrôles attendus', () => {
      expect(CHECKS).toHaveLength(22);
      expect(CHECKS.map((c) => c.key)).toContain('cms-migrations');
      expect(CHECKS.map((c) => c.key)).toContain('cms-cache');
      expect(CHECKS.map((c) => c.key)).toContain('brand-sync');
      expect(CHECKS.map((c) => c.key)).toContain('content-pages');
      expect(CHECKS.map((c) => c.key)).toContain('content-known-errors');
      expect(CHECKS.map((c) => c.key)).toContain('image-paths');
      expect(CHECKS.map((c) => c.key)).toContain('design-tics');
      expect(CHECKS.map((c) => c.key)).toContain('cms-emojis');
      expect(CHECKS.map((c) => c.key)).toContain('cms-hardcode');
      expect(CHECKS.map((c) => c.key)).toContain('content-html-escapes');
      expect(CHECKS.map((c) => c.key)).toContain('apk-signature');
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

  describe('couverture des médias servis (public/)', () => {
    // Le 30/10/2026, la CI ne contrôlait que `public/images` : les 3 posters de
    // capsule vidéo (`public/videos/…`) et les 6 chemins `/videos/` du code
    // échappaient aux deux garde-fous. Ces tests verrouillent l'élargissement.

    it('check-cms-ai-images scanne par défaut public/, pas seulement public/images', () => {
      const source = readFileSync('scripts/check-cms-ai-images.mjs', 'utf8');
      const defaut = source.match(/process\.argv\[2\]\s*\|\|\s*'([^']+)'/);
      expect(defaut?.[1]).toBe('public');
    });

    it('check-cms-ai-images détecte un marqueur IA sous public/videos/', () => {
      const dossier = 'public/videos/destinations/montenegro';
      const temoin = `${dossier}/_c2pa_temoin.test.jpg`;
      const original = `${dossier}/montenegro_cijevna_waterfall_poster.jpg`;
      writeFileSync(
        temoin,
        Buffer.concat([readFileSync(original), Buffer.from('trainedAlgorithmicMedia')])
      );
      try {
        let sortie = '';
        try {
          execFileSync('node', ['scripts/check-cms-ai-images.mjs'], { encoding: 'utf8' });
        } catch (e) {
          sortie = String(e.stdout || '') + String(e.stderr || '');
        }
        expect(sortie).toContain('_c2pa_temoin.test.jpg');
      } finally {
        rmSync(temoin, { force: true });
      }
    });

    it('check-image-paths collecte aussi les chemins /videos/', () => {
      const source = readFileSync('scripts/check-image-paths.mjs', 'utf8');
      expect(source).toMatch(/\/(?:images|videos)\//);
      expect(source).toMatch(/videoUrl|EXT_VIDEO/);
    });

    it('check-image-paths refuse un poster vidéo absent de public/', () => {
      const page = 'app/destinations/montenegro/podgorica-cijevna/page.tsx';
      const original = readFileSync(page, 'utf8');
      const casse = original.replace(
        'montenegro_cijevna_waterfall_poster.jpg',
        'montenegro_poster_inexistant.test.jpg'
      );
      expect(casse).not.toBe(original);
      writeFileSync(page, casse);
      try {
        let code = 0;
        try {
          execFileSync('node', ['scripts/check-image-paths.mjs'], { encoding: 'utf8' });
        } catch (e) {
          code = e.status ?? 1;
        }
        expect(code).toBe(1);
      } finally {
        writeFileSync(page, original);
      }
    });
  });
});
