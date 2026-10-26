import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';

/**
 * Le 25/10/2026, la liste blanche `CONSUMED_ZONE_KEYS` a été retirée de
 * `getGlobalZones()` : elle obligeait à modifier le code pour chaque zone créée
 * depuis le CMS. Le filtre a été remplacé par une déclaration
 * (`lib/public-global-zones.json`) : une zone `global` n'est servie que si son
 * préfixe est reconnu, ou si sa clé exacte est listée ; le préfixe réservé
 * `_prive_` marque une exclusion assumée.
 *
 * `check:cms-zones` doit refuser de laisser passer une zone `global` active qui
 * n'est ni déclarée publique ni réservée : elle serait éditable, renseignée, et
 * invisible dans le HTML — indiscernable d'un contenu laissé au fallback.
 *
 * On lance le script réel contre un serveur HTTP local qui joue la base. Seul le
 * service externe est simulé, jamais le code testé.
 */
function lancer(url: string) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve) => {
    const p = spawn('node', ['scripts/check-cms-zones.mjs'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: url,
        SUPABASE_SERVICE_ROLE_KEY: 'cle-de-test-non-jwt',
      },
    });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    const minuteur = setTimeout(() => {
      p.kill('SIGKILL');
      resolve({ status: null, stdout, stderr: stderr + '\nTIMEOUT' });
    }, 20_000);
    p.on('close', (code) => {
      clearTimeout(minuteur);
      resolve({ status: code, stdout, stderr });
    });
  });
}

describe('check-cms-zones — déclaration publique des zones global', () => {
  let serveur: Server;
  let url: string;
  let lignes: unknown[];

  beforeAll(async () => {
    serveur = createServer((_req, res) => {
      res.setHeader('Connection', 'close');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(lignes));
      setImmediate(() => res.socket?.destroy());
    });
    serveur.keepAliveTimeout = 1;
    await new Promise<void>((r) => serveur.listen(0, '127.0.0.1', r));
    const addr = serveur.address();
    url = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
  });

  afterAll(async () => {
    serveur.closeAllConnections?.();
    await new Promise<void>((r) => serveur.close(() => r()));
  });

  it('passe une zone global dont le préfixe est déclaré', async () => {
    lignes = [{ page: 'global', zone_key: 'header_site_name', value: 'Heldonica' }];
    const r = await lancer(url);

    expect(r.status).toBe(0);
    expect(r.stdout).toContain('toutes déclarées publiques ou réservées');
  }, 30_000);

  it('passe une zone global listée par sa clé exacte', async () => {
    lignes = [{ page: 'global', zone_key: 'nav_footer_title', value: 'Explorer' }];
    const r = await lancer(url);

    expect(r.status).toBe(0);
    expect(r.stdout).not.toContain('NON déclarée');
  }, 30_000);

  /**
   * Le cœur du garde-fou : une clé neuve, hors des familles déclarées, doit faire
   * échouer le contrôle au lieu de disparaître du rendu en silence.
   */
  it('ÉCHOUE sur une zone global active non déclarée', async () => {
    lignes = [{ page: 'global', zone_key: 'residu_ancien_projet', value: 'Monica Schneider' }];
    const r = await lancer(url);

    expect(r.status).toBe(1);
    expect(r.stdout).toContain('NON déclarée');
    expect(r.stdout).toContain('residu_ancien_projet');
  }, 30_000);

  it('tolère une zone au préfixe réservé _prive_ (exclusion assumée)', async () => {
    lignes = [{ page: 'global', zone_key: '_prive_monica_schneider', value: 'Executive Coach' }];
    const r = await lancer(url);

    expect(r.status).toBe(0);
    expect(r.stdout).not.toContain('NON déclarée');
  }, 30_000);

  it('ignore les zones non global (le contrôle ne porte que sur elles)', async () => {
    lignes = [{ page: 'expert-hotelier', zone_key: 'cle_inconnue', value: 'x' }];
    const r = await lancer(url);

    expect(r.stdout).not.toContain('NON déclarée');
  }, 30_000);
});
