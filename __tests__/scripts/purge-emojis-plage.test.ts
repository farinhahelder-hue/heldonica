import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DECORATIVE_EMOJI_RE } from '../../scripts/check-design-tics.mjs';

/**
 * Le 22/10, la purge #687 (migration 20261022230000) et le détecteur
 * `check-design-tics.mjs` ne couvraient PAS les mêmes plages Unicode : la purge
 * visait 2600-27BF + 10000-1FAFF, le détecteur refusait AUSSI 231A-231B,
 * 23E9-23FF, 2B1B-2B1C, 2B50 et 2B55. Le sablier « ⌛ » de highlight_2_emoji
 * est tombé dans ce trou : invisible pour la migration, refusé par la CI sur
 * les fichiers. Ces tests interdisent la réapparition de l'écart.
 */

/** Miroir des plages de DECORATIVE_EMOJI_RE. Vérifié plus bas contre le détecteur. */
const PLAGES_DETECTEUR = [
  [0x1f300, 0x1faff],
  [0x1f1e6, 0x1f1ff],
  [0x231a, 0x231b],
  [0x23e9, 0x23ff],
  [0x2600, 0x2604],
  [0x2606, 0x26ff],
  [0x2700, 0x27bf],
  [0x2b1b, 0x2b1c],
  [0x2b50, 0x2b50],
  [0x2b55, 0x2b55],
];

const DOSSIER = 'supabase/migrations';

/** Remplace les échappements ARE (\\uXXXX, \\UXXXXXXXX) par les caractères. */
function normaliserClasse(texte) {
  return texte
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\U([0-9a-fA-F]{8})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/** Découpe `[a-b c d-e]` en liste de [debut, fin]. */
function plagesDeClasse(classe) {
  const corps = classe.slice(1, -1);
  const points = [...corps];
  const plages = [];
  for (let i = 0; i < points.length; i += 1) {
    if (points[i + 1] === '-' && points[i + 2]) {
      plages.push([points[i].codePointAt(0), points[i + 2].codePointAt(0)]);
      i += 2;
    } else {
      const cp = points[i].codePointAt(0);
      plages.push([cp, cp]);
    }
  }
  return plages;
}

/** Toutes les classes Unicode des UPDATE de purge des emojis en base. */
function classesDePurge() {
  const classes = [];
  for (const f of readdirSync(DOSSIER)) {
    if (!f.endsWith('.sql')) continue;
    const sql = readFileSync(join(DOSSIER, f), 'utf8');
    if (!sql.includes('cms_editable_zones')) continue;
    for (const m of sql.matchAll(/value\s*~\s*'(\[[^\]]*\])'/g)) {
      classes.push({ fichier: f, plages: plagesDeClasse(normaliserClasse(m[1])) });
    }
  }
  return classes;
}

const couvre = (plages, cp) => plages.some(([a, b]) => cp >= a && cp <= b);

describe('purge des emojis en base — parité de plage avec le détecteur', () => {
  const classes = classesDePurge();

  it('trouve au moins une migration de purge des zones', () => {
    expect(classes.length).toBeGreaterThan(0);
  });

  it('le miroir des plages correspond bien au détecteur (sinon le test ment)', () => {
    // DECORATIVE_EMOJI_RE porte le flag `g` : `.test()` est alors stateful via
    // `lastIndex`. On en dérive une regex sans `g` pour tester proprement.
    const sansEtat = new RegExp(DECORATIVE_EMOJI_RE.source, 'u');
    for (const [debut, fin] of PLAGES_DETECTEUR) {
      for (const cp of [debut, fin]) {
        expect(
          sansEtat.test(String.fromCodePoint(cp)),
          `le détecteur ne matche pas U+${cp.toString(16).toUpperCase()}`
        ).toBe(true);
      }
    }
  });

  it('couvre les bornes de CHAQUE plage du détecteur (aucun trou)', () => {
    const trous = [];
    for (const [debut, fin] of PLAGES_DETECTEUR) {
      for (const cp of [debut, fin]) {
        const ok = classes.some((c) => couvre(c.plages, cp));
        if (!ok) trous.push(`U+${cp.toString(16).toUpperCase()}`);
      }
    }
    expect(trous, `plages du détecteur non purgées en base : ${trous.join(', ')}`).toEqual([]);
  });

  it('couvre les familles qui avaient échappé à #687 (⌛ ⏳ ⭐ ⭕)', () => {
    for (const cp of [0x231b, 0x23f3, 0x2b50, 0x2b55]) {
      expect(
        classes.some((c) => couvre(c.plages, cp)),
        `U+${cp.toString(16).toUpperCase()} non couvert par une migration`
      ).toBe(true);
    }
  });

  it('ne couvre aucune lettre ASCII ni accentuée (le motif ne mange pas du texte)', () => {
    for (const car of ['A', 'z', 'é', 'à', '0', ' ']) {
      const cp = car.codePointAt(0);
      expect(
        classes.some((c) => couvre(c.plages, cp)),
        `le caractère ${JSON.stringify(car)} est couvert par une purge`
      ).toBe(false);
    }
  });
});
