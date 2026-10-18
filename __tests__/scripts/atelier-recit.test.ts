/**
 * atelier_recit — la garantie qui compte : l'outil ne peut pas inventer.
 *
 * Ce test lance le script Python reel (pas une imitation) et verifie les deux
 * proprietes sur lesquelles repose la regle 1 :
 *   1. un questionnaire vide ne produit AUCUNE phrase ;
 *   2. une reponse fournie est reprise telle quelle, mots bannis retires.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RACINE = process.cwd();
const SCRIPT = join(RACINE, 'scripts', 'atelier_recit.py');

/** Un voyage minimal : deux journees, chacune avec un moment date. */
function voyageMinimal() {
  return {
    slug: 'test-atelier',
    genere_le: '2026-10-18T10:00:00',
    source: { fichier: null, format: 'aucune', lieux: 'visites-timeline', photos: null },
    resume: {
      jours: 2,
      premier_jour: '2026-08-27',
      dernier_jour: '2026-08-31',
      lieux: 0,
      lieux_nommes: 0,
      distance_km_total: 0,
      photos: 2,
      photos_placees: 0,
      photos_sans_date: [],
    },
    jours: [
      {
        date: '2026-08-27',
        lieux: [],
        trajets: [],
        distance_km: null,
        distance_source: null,
        marche_km: null,
        positions: 0,
        photos_sans_lieu: [
          { fichier: 'a.jpg', prise_de_vue: '2026-08-27T13:46:00+00:00', raison: 'test' },
          { fichier: 'b.jpg', prise_de_vue: '2026-08-27T13:50:00+00:00', raison: 'test' },
        ],
      },
      {
        date: '2026-08-31',
        lieux: [],
        trajets: [],
        distance_km: null,
        distance_source: null,
        marche_km: null,
        positions: 0,
        photos_sans_lieu: [
          { fichier: 'c.jpg', prise_de_vue: '2026-08-31T10:15:00+00:00', raison: 'test' },
        ],
      },
    ],
  };
}

function lancer(args) {
  return execFileSync('python3', [SCRIPT, ...args], {
    cwd: RACINE,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('atelier_recit', () => {
  let dossier;

  beforeAll(() => {
    dossier = mkdtempSync(join(tmpdir(), 'atelier-'));
    writeFileSync(join(dossier, 'voyage.json'), JSON.stringify(voyageMinimal()), 'utf8');
  });

  it('le script existe et se compile', () => {
    expect(existsSync(SCRIPT)).toBe(true);
    expect(() => execFileSync('python3', ['-m', 'py_compile', SCRIPT], { cwd: RACINE })).not.toThrow();
  });

  it('ecrit un questionnaire avec une section par jour et les questions par moment', () => {
    lancer(['--voyage', join(dossier, 'voyage.json'), '--questions', '--out', dossier]);
    const q = readFileSync(join(dossier, 'questions.md'), 'utf8');
    expect(q).toContain('27 aout 2026');
    expect(q).toContain('31 aout 2026');
    expect(q).toContain('### Moment 1');
    expect(q).toContain('REPONSE lieu :');
    expect(q).toContain('REPONSE moins_aime :');
  });

  it("REGLES 1 : un questionnaire vide ne produit AUCUNE phrase ni bloc", () => {
    const vide = mkdtempSync(join(tmpdir(), 'atelier-vide-'));
    writeFileSync(join(vide, 'voyage.json'), JSON.stringify(voyageMinimal()), 'utf8');
    lancer(['--voyage', join(vide, 'voyage.json'), '--questions', '--out', vide]);
    lancer(['--voyage', join(vide, 'voyage.json'), '--tisser', '--out', vide]);

    const b = readFileSync(join(vide, 'brouillon.md'), 'utf8');
    expect(b).toContain('<!-- heldonica:blocks [] -->');
    // Le seul texte autorise est le titre et l'avertissement : aucune phrase de recit.
    expect(b).not.toMatch(/on cherchait|On s'est arretes|Odeur de/);
  });

  it("fonctionne sans Pillow : l'import d'une bibliotheque ne tue pas le processus", () => {
    // Le runner CI n'a pas Pillow. photos_evidence.py est une bibliotheque :
    // il ne doit pas appeler sys.exit a l'import, sinon atelier_recit.py meurt
    // alors qu'il ne lit que du JSON.
    const faux = mkdtempSync(join(tmpdir(), 'faux-pil-'));
    mkdirSync(join(faux, 'PIL'));
    writeFileSync(
      join(faux, 'PIL', '__init__.py'),
      'raise ImportError("PIL masque (simulation CI)")\n',
      'utf8',
    );
    const dossierSansPillow = mkdtempSync(join(tmpdir(), 'atelier-sans-pil-'));
    writeFileSync(join(dossierSansPillow, 'voyage.json'), JSON.stringify(voyageMinimal()), 'utf8');

    const sortie = execFileSync(
      'python3',
      [SCRIPT, '--voyage', join(dossierSansPillow, 'voyage.json'), '--questions', '--out', dossierSansPillow],
      { cwd: RACINE, encoding: 'utf8', env: { ...process.env, PYTHONPATH: faux } },
    );

    expect(sortie).toContain('Questionnaire ecrit');
    const q = readFileSync(join(dossierSansPillow, 'questions.md'), 'utf8');
    expect(q).toContain('### Moment 1');
  });

  it('reprend une reponse fournie telle quelle et retire les mots bannis', () => {
    const rempli = mkdtempSync(join(tmpdir(), 'atelier-rempli-'));
    writeFileSync(join(rempli, 'voyage.json'), JSON.stringify(voyageMinimal()), 'utf8');
    lancer(['--voyage', join(rempli, 'voyage.json'), '--questions', '--out', rempli]);

    const qf = join(rempli, 'questions.md');
    let q = readFileSync(qf, 'utf8');
    q = q.replace('REPONSE lieu :', 'REPONSE lieu : Brasov');
    q = q.replace('REPONSE faisait :', 'REPONSE faisait : on cherchait un endroit');
    q = q.replace('REPONSE sensoriel :', 'REPONSE sensoriel : odeur de pain chaud');
    q = q.replace('REPONSE moins_aime :', 'REPONSE moins_aime : la circulation, magnifique');
    writeFileSync(qf, q, 'utf8');

    lancer(['--voyage', join(rempli, 'voyage.json'), '--tisser', '--out', rempli]);
    const b = readFileSync(join(rempli, 'brouillon.md'), 'utf8');

    expect(b).toContain('A Brasov, on cherchait un endroit.');
    expect(b).toContain('Odeur de pain chaud');
    expect(b).not.toContain('magnifique');
    // Le pronom de duo n'est pas double (« on on »).
    expect(b).not.toContain('on on ');
    expect(b).toContain('<!-- heldonica:blocks [{');
  });
});
