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

  /**
   * Le 2026-11-01, 76 pages de destination ont été réécrites et le gabarit
   * partagé `SubDestinationTemplate` a disparu au profit de code autonome. Deux
   * défauts du contrôle en sont sortis, que ces tests fixent :
   *
   *   1. `<EditableZone page={PAGE} zone="intro_text">` n'était pas résolu : la
   *      zone ressortait orpheline alors que la page la rendait (le helper
   *      `Z(...)` de la même page, lui, était bien lu).
   *   2. Une page en quarantaine (lib/unpublished-pages.ts) rend « Bientôt » :
   *      ses zones ne sont pas orphelines, elles sont en attente. Les compter
   *      comme orphelines faisait échouer le contrôle à chaque réécriture.
   *
   * On lance le vrai script contre un serveur local : seule la base est simulée.
   */
  describe('check-cms-zones — page={PAGE}, et pages en quarantaine', () => {
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

    it('résout <EditableZone page={PAGE} zone="…"> : la zone n\'est pas orpheline', async () => {
      // `app/destinations/roumanie/bucarest/page.tsx` écrit
      // `<EditableZone page={PAGE} zone="intro_text" …/>` avec
      // `const PAGE = 'destinations-roumanie-bucarest'`. Avant le correctif,
      // cette ligne échappait à la passe 1 et la zone sortait orpheline.
      lignes = [{ page: 'destinations-roumanie-bucarest', zone_key: 'intro_text', value: 'Un récit.' }];
      const r = await lancer(url);

      expect(r.stdout).not.toContain('ORPHELINES NOUVELLES');
      expect(r.status).toBe(0);
    }, 30_000);

    it('une zone non lue d\'une page en quarantaine est « en attente », non bloquante', async () => {
      // `destinations-idf-paris` figure dans UNPUBLISHED_CMS_PAGES : la page
      // rend « Bientôt », donc ses zones ne sont pas rendues — sans être
      // orphelines pour autant.
      lignes = [{ page: 'destinations-idf-paris', zone_key: 'zone_jamais_lue_du_tout', value: 'x' }];
      const r = await lancer(url);

      expect(r.stdout).toContain('en ATTENTE');
      expect(r.stdout).not.toContain('ORPHELINES NOUVELLES');
      expect(r.status).toBe(0);
    }, 30_000);

    it('une zone non lue d\'une page PUBLIÉE reste une orpheline bloquante', async () => {
      // Le correctif ne doit pas éteindre le garde-fou : hors quarantaine, une
      // zone qu'aucun composant ne lit doit toujours faire échouer le contrôle.
      lignes = [{ page: 'destinations-zurich', zone_key: 'zone_jamais_lue_du_tout', value: 'x' }];
      const r = await lancer(url);

      expect(r.stdout).toContain('ORPHELINES NOUVELLES');
      expect(r.status).toBe(1);
    }, 30_000);
  });
});
