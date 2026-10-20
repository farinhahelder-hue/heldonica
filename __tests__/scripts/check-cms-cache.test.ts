import { describe, it, expect } from 'vitest';
import { pageFigee } from '../../scripts/check-cms-cache.mjs';

/**
 * Le 20/10/2026 (audit éditorial lot 2), sept mots bannis ont été purgés en base
 * sur des pages publiées — et le site a continué de servir l'ancien texte
 * pendant plus de 10 heures. Les pages destinations étaient prérendues
 * statiques sans `export const revalidate` : figées pour toujours. Le CMS
 * appelle bien `revalidateCmsTarget()` à chaque écriture, mais revalider une
 * page qui n'expire jamais ne fait rien.
 *
 * On teste la règle qui ferme cet angle mort : une page prérendue qui lit le
 * contenu CMS doit avoir une fenêtre de revalidation.
 */
describe('check-cms-cache — page lisant le CMS sans fenêtre de revalidation', () => {
  it('signale une page CMS prérendue sans revalidate', () => {
    const src = `import { getPageZones } from '@/lib/cms-zones';\nexport default async function Page() { await getPageZones('x'); }`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(true);
  });

  it('accepte une fenêtre propre', () => {
    const src = `import { getPageZones } from '@/lib/cms-zones';\nexport const revalidate = 300;\nawait getPageZones('x');`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(false);
  });

  it('accepte une fenêtre héritée du layout parent', () => {
    // C'est le mécanisme qui a couvert les ~70 pages destinations d'un seul coup.
    const src = `import { getPageZones } from '@/lib/cms-zones';\nawait getPageZones('x');`;
    expect(pageFigee({ src, fenetreHeritee: 300, exempte: false })).toBe(false);
  });

  it('accepte `revalidate = 0` (rendu dynamique, jamais figé)', () => {
    const src = `import { getPageZones } from '@/lib/cms-zones';\nexport const revalidate = 0;\nawait getPageZones('x');`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(false);
  });

  it('accepte force-dynamic', () => {
    const src = `import { getPageZones } from '@/lib/cms-zones';\nexport const dynamic = 'force-dynamic';\nawait getPageZones('x');`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(false);
  });

  it('ignore une page sans accès CMS (rien à revalider)', () => {
    const src = `export default function Page() { return null; }`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(false);
  });

  it("ignore une page 'use client' (rendue côté navigateur)", () => {
    const src = `'use client';\nimport { getPageZones } from '@/lib/cms-zones';\nexport default function P() { getPageZones('x'); }`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: false })).toBe(false);
  });

  it('respecte une exemption motivée', () => {
    const src = `import { getPageZones } from '@/lib/cms-zones';\nawait getPageZones('maintenance');`;
    expect(pageFigee({ src, fenetreHeritee: null, exempte: true })).toBe(false);
  });
});
