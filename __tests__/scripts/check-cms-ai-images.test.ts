import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { referencesGenerees } from '../../scripts/check-cms-ai-images.mjs';

/**
 * Le garde-fou ne regardait que `public/`. Les octets vivent aussi hors du
 * dépôt : le 30/10/2026, une purge annoncée « définitive » des visuels générés
 * de Madère avait laissé six références dans le code (`heroImage`, `og:image`,
 * gabarits CMS, coffre RAG, coffre Android) pointant vers des objets toujours
 * présents dans le bucket. Ces tests verrouillent le second contrôle : l'URL
 * d'un objet généré connu est refusée, où qu'elle soit écrite.
 */
describe('check-cms-ai-images — références à un objet du stockage généré', () => {
  const avecFichier = (nom: string, contenu: string) => {
    const racine = mkdtempSync(join(tmpdir(), 'ai-images-'));
    const dossier = join(racine, 'lib');
    mkdirSync(dossier);
    writeFileSync(join(dossier, nom), contenu);
    return racine;
  };

  const objetGenere = 'destinations/madere/ponta_do_sol.jpg';

  it('signale une référence à un objet généré', () => {
    const racine = avecFichier(
      'page.tsx',
      `const heroImage = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/${objetGenere}'`,
    );
    try {
      const trouvees = referencesGenerees([join(racine, 'lib')]);
      expect(trouvees).toHaveLength(1);
      expect(trouvees[0].objet).toBe(objetGenere);
    } finally {
      rmSync(racine, { recursive: true, force: true });
    }
  });

  it('ne signale rien pour une photo de terrain', () => {
    const racine = avecFichier(
      'page.tsx',
      `const heroImage = 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg'`,
    );
    try {
      expect(referencesGenerees([join(racine, 'lib')])).toHaveLength(0);
    } finally {
      rmSync(racine, { recursive: true, force: true });
    }
  });

  it('ne signale rien quand le nom du dossier seulement est mentionné', () => {
    // `destinations/madere/` apparaît dans une URL de page et dans un chemin de
    // zone : le contrôle porte sur l'objet image, pas sur le dossier.
    const racine = avecFichier(
      'page.tsx',
      `const canonical = 'https://www.heldonica.fr/destinations/madere/ponta-do-sol'`,
    );
    try {
      expect(referencesGenerees([join(racine, 'lib')])).toHaveLength(0);
    } finally {
      rmSync(racine, { recursive: true, force: true });
    }
  });

  it('trouve la référence dans un coffre JSON (app Android)', () => {
    const racine = mkdtempSync(join(tmpdir(), 'ai-images-'));
    const dossier = join(racine, 'assets');
    mkdirSync(dossier);
    writeFileSync(
      join(dossier, 'knowledge_vault.json'),
      JSON.stringify({ content: `![Fanal](https://x.supabase.co/storage/v1/object/public/media/${objetGenere})` }),
    );
    try {
      expect(referencesGenerees([join(racine, 'assets')])).toHaveLength(1);
    } finally {
      rmSync(racine, { recursive: true, force: true });
    }
  });

  it('le dépôt lui-même est propre', () => {
    expect(referencesGenerees()).toHaveLength(0);
  });
});
