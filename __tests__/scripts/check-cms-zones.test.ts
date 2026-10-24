import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';

/**
 * check:cms-zones doit distinguer « aucune zone orpheline » de « je n'ai pas pu
 * lire la base ». Les deux produisaient auparavant la même sortie « ✓ Aucune
 * zone orpheline » : le 2026-10-12, un HTTP 504 de Supabase faisait afficher ce
 * ✓ alors que `rows` avait été vidé faute de lecture.
 *
 * On ne mocke pas le script : on le lance réellement, contre un serveur HTTP
 * local qui joue le rôle de la base. La seule chose simulée est le service
 * externe, jamais le code testé.
 *
 * `spawn` asynchrone, pas `spawnSync` : le serveur tourne dans le même processus
 * que le test, et une attente synchrone gèlerait la boucle d'événements — le
 * serveur ne pourrait plus répondre, et l'enfant attendrait une réponse qui ne
 * viendrait jamais. Interblocage garanti.
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

describe('check-cms-zones — lecture de la base impossible', () => {
  let serveur: Server;
  let url: string;
  let statut: number;

  beforeAll(async () => {
    serveur = createServer((_req, res) => {
      res.setHeader('Connection', 'close');
      res.writeHead(statut, { 'content-type': 'application/json' });
      res.end(statut >= 500 ? '' : '[]');
      // Undici (fetch Node) garde sinon la socket keep-alive ouverte, et le
      // process enfant ne rend jamais la main. On coupe la connexion nous-memes.
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

  it('un 504 ne doit PAS produire « ✓ Aucune zone orpheline »', async () => {
    statut = 504;
    const r = await lancer(url);

    // Le script sort en 2 : ni succès, ni échec de conformité.
    expect(r.status).toBe(2);
    expect(r.stdout).toContain('INCONNU');
    expect(r.stdout).not.toContain('✓ Aucune zone orpheline');
    // Le détail de l'erreur reste visible pour le diagnostic.
    expect(r.stderr).toContain('HTTP 504');
  }, 30_000);

  it('une lecture réussie et vide conserve le ✓ normal', async () => {
    statut = 200;
    const r = await lancer(url);

    expect(r.status).toBe(0);
    expect(r.stdout).toContain('✓ Aucune zone orpheline');
    expect(r.stdout).not.toContain('INCONNU');
  }, 30_000);

  /**
   * Une zone active à valeur vide n'affiche pas son fallback : le composant
   * calcule `zones[zoneKey] ?? fallback`, et `''` n'est pas `null`. Constat du
   * 2026-10-23 : 37 zones dans ce cas, dont 23 `local_tip` (bloc « Notre
   * conseil » vide sur 23 pages), produites par les générateurs de zones.
   */
  describe('check-cms-zones — zones actives à valeur vide', () => {
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

    it('signale une zone active à valeur vide et sort en échec', async () => {
      lignes = [{ page: 'destinations-x', zone_key: 'local_tip', value: '' }];
      const r = await lancer(url);

      expect(r.status).toBe(1);
      expect(r.stdout).toContain('VALEUR VIDE');
      expect(r.stdout).toContain('destinations-x');
      expect(r.stdout).toContain('is_active = false');
    }, 30_000);

    it('ne signale PAS une valeur NULL (le fallback joue)', async () => {
      lignes = [{ page: 'destinations-x', zone_key: 'local_tip', value: null }];
      const r = await lancer(url);

      expect(r.stdout).toContain('✓ Aucune zone active à valeur vide');
    }, 30_000);
  });
});
