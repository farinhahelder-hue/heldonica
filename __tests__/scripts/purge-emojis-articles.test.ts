import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DECORATIVE_EMOJI_RE } from '../../scripts/check-design-tics.mjs';

/**
 * La purge des brouillons d'articles (lot 3) reprend la plage du détecteur
 * `DECORATIVE_EMOJI_RE` MAIS en exclut nommement les glyphes conservés par la
 * politique : ✓ (2713), ✗ (2717), ⚠ (26A0), ➔ (2794) et le wordmark de marque
 * ✦ (2726). Le test de parité `purge-emojis-plage.test.ts` ne voit pas cette
 * migration (il ne regarde que les migrations contenant `cms_editable_zones`),
 * et il exigerait l'inverse — la couverture TOTALE. D'où ce test dédié.
 *
 * Ce qu'il interdit : que la classe de retrait se décale et emporte un glyphe de
 * marque, ou qu'elle laisse un trou dans la plage du détecteur.
 */

const FICHIER = 'supabase/migrations/20261027220000_purge_emojis_articles_brouillons.sql';

/** Glyphes conservés par la politique — la migration ne doit PAS les purger. */
const GARDES = new Set([0x2713, 0x2717, 0x26a0, 0x2794, 0x2726]);

/** Bornes des plages du détecteur (miroir de DECORATIVE_EMOJI_RE). */
const PLAGES_DETECTEUR = [
  [0x1f300, 0x1faff], [0x1f1e6, 0x1f1ff], [0x231a, 0x231b], [0x23e9, 0x23ff],
  [0x2600, 0x2604], [0x2606, 0x26ff], [0x2700, 0x27bf], [0x2b1b, 0x2b1c],
  [0x2b50, 0x2b50], [0x2b55, 0x2b55],
];

const estDrapeau = (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff;

/** `\+XXXXXX` (ARE de Postgres) -> caractère. */
function normaliser(texte) {
  return texte.replace(/\\\+([0-9a-fA-F]{6})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/** Découpe `[a-b c d-e]` en liste de [début, fin]. */
function plagesDeClasse(classe) {
  const corps = normaliser(classe).slice(1, -1);
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

const sql = readFileSync(FICHIER, 'utf8');
const classes = [...sql.matchAll(/U&'(\[[^\]]*\])'/g)].map((m) => m[1]);
const plages = plagesDeClasse(classes[0] ?? '[]');
const couvre = (cp) => plages.some(([a, b]) => cp >= a && cp <= b);

describe('purge des emojis des brouillons d’articles (lot 3)', () => {
  it('la migration porte une seule classe, répétée à l’identique', () => {
    expect(classes.length).toBeGreaterThan(0);
    expect(new Set(classes).size).toBe(1);
  });

  it('la classe ne couvre AUCUN glyphe de marque (✓ ✗ ⚠ ➔ ✦)', () => {
    const emportes = [...GARDES].filter((cp) => couvre(cp));
    expect(emportes.map((c) => `U+${c.toString(16).toUpperCase()}`)).toEqual([]);
  });

  it('la classe ne couvre AUCUN drapeau (indicateur régional)', () => {
    const drapeaux = [];
    for (let cp = 0x1f1e6; cp <= 0x1f1ff; cp += 1) if (couvre(cp)) drapeaux.push(cp);
    expect(drapeaux).toEqual([]);
  });

  it('couvre chaque borne du détecteur qui n’est ni garde ni drapeau', () => {
    const trous = [];
    for (const [debut, fin] of PLAGES_DETECTEUR) {
      for (const cp of [debut, fin]) {
        if (GARDES.has(cp) || estDrapeau(cp)) continue;
        if (!couvre(cp)) trous.push(`U+${cp.toString(16).toUpperCase()}`);
      }
    }
    expect(trous, `bornes du détecteur non purgées : ${trous.join(', ')}`).toEqual([]);
  });

  it('ne mange ni lettre ASCII, ni accent, ni ponctuation', () => {
    for (const car of ['A', 'z', 'é', 'à', '0', ' ', '\u2019', '-']) {
      expect(couvre(car.codePointAt(0)), `${JSON.stringify(car)} couvert par la purge`).toBe(false);
    }
  });

  it('le miroir des plages correspond bien au détecteur (sinon le test ment)', () => {
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

  it('ne vise QUE les brouillons (published = false), jamais les articles publiés', () => {
    // On retire les commentaires SQL : l'en-tête explique la portée et contient
    // le mot « published = true » en prose, qui ne doit pas déclencher ce test.
    const instructions = sql.replace(/--[^\n]*/g, '');
    expect(instructions).toMatch(/WHERE\s+published\s*=\s*false/i);
    expect(instructions).not.toMatch(/published\s*=\s*true/i);
  });

  it('ne touche pas cms_editable_zones (pour ne pas fausser le test de parité des zones)', () => {
    expect(sql).not.toContain('cms_editable_zones');
  });
});
