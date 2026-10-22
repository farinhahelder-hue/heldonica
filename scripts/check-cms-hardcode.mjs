/**
 * check-cms-hardcode — garde-fou « à cliquet » contre le texte visible écrit en
 * dur dans les pages publiques.
 *
 * Pourquoi ce script existe
 * -------------------------
 * La règle du site : tout texte visible se modifie depuis le CMS. Un texte
 * passe par le CMS quand il est rendu par <EditableZone> (ou l'accesseur local
 * `Z(…)`), lu par `getCmsOrSetting` / `getZoneLinks`, ou par `useZoneText` ;
 * la valeur écrite dans le code n'est alors qu'un repli. Le 22/10/2026, on
 * comptait ~1 560 textes visibles hors de ces chemins, contre 967 zones.
 *
 * Tout migrer d'un coup n'est pas réaliste. Le contrôle fige donc, fichier par
 * fichier, le nombre de textes en dur (scripts/cms-hardcode-baseline.json) et
 * refuse toute hausse : on ne peut plus en ajouter, on peut seulement en
 * retirer. Quand un fichier baisse, `--update` abaisse la référence pour
 * verrouiller le gain.
 *
 * Ce qui compte comme texte en dur
 *   - un texte JSX contenant un mot ;
 *   - un attribut visible littéral : alt, placeholder, title, label ;
 *   - une chaîne-phrase (deux mots d'au moins trois lettres) en position de
 *     donnée : tableau, objet, ternaire, return, argument d'un setter React.
 *
 * Ce qui ne compte pas
 *   - les replis passés aux helpers CMS (getCmsOrSetting, getZoneLinks, Z,
 *     useZoneText, fallback= d'EditableZone) ;
 *   - les métadonnées SEO et le JSON-LD ;
 *   - les classes CSS et valeurs de style ;
 *   - aria-label : il nomme une commande pour les lecteurs d'écran (« Fermer
 *     le menu ») et reste dans le code, à dessein.
 *
 * Usage :
 *   node scripts/check-cms-hardcode.mjs            contrôle (exit 1 si hausse)
 *   node scripts/check-cms-hardcode.mjs --update   abaisse la référence
 *   node scripts/check-cms-hardcode.mjs --list <fichier>   détaille un fichier
 */

import ts from 'typescript';
import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PUBLIC_DESIGN_TARGETS } from './check-design-tics.mjs';

export const CMS_HARDCODE_TARGETS = [...PUBLIC_DESIGN_TARGETS, 'components/CookieConsentBanner.tsx'];
export const BASELINE_PATH = 'scripts/cms-hardcode-baseline.json';

const VISIBLE_ATTRS = new Set(['alt', 'placeholder', 'title', 'label']);
const CMS_HELPERS = new Set(['getCmsOrSetting', 'getZoneLinks', 'Z', 'useZoneText', 'buildPageMetadata']);
const SETTER_RE = /^(set[A-Z]\w*|alert|toast)$/;
const NON_TEXT_PROP = /^(className|class|href|src|url|id|key|type|slug|icon|image|img|cover|zone|page|as|variant|color|bg|rel|target|name|role|tag|category|lang|locale|format|unit|value|path|route|hash|anchor|width|height|ratio|priority|sizes|lat|lng|coords|query|status|kind|layout|mode|animation|transition|transform|style|fontFamily|background|backgroundImage|border|boxShadow|filter|gridTemplateColumns|objectPosition)$/i;
const SCHEMA_VAR = /schema|jsonld|metadata/i;
const HAS_WORD = /\p{L}{2,}/u;
const PHRASE = /\p{L}{3,}[^]*\s[^]*\p{L}{3,}/u;
const TOKEN = /^[\w./:#?=&%-]+$/;
// Liste de classes Tailwind ou valeur CSS : aucun mot accentué, et au moins un
// jeton technique reconnaissable (préfixe utilitaire, variante, valeur arbitraire).
const CSS_LIKE = /^[a-z0-9!:_\-/[\]#.%(),'"=>~*+\s]+$/i;
const CSS_HINT = /(^|\s)!?-?(?:[a-z]+:)*(?:bg|text|border|ring|outline|hover|focus|group|px|py|pt|pb|pl|pr|p|mx|my|mt|mb|ml|mr|m|flex|grid|col|row|w|h|min|max|rounded|opacity|translate|-translate|scale|rotate|-rotate|backdrop|shadow|gap|space|items|justify|self|place|font|tracking|leading|z|inset|top|left|right|bottom|pointer|cursor|transition|duration|ease|delay|animate|object|aspect|overflow|whitespace|line|decoration|underline|sr|block|inline|hidden|absolute|relative|fixed|sticky|order|fill|stroke|blur|brightness|from|via|to)(?:-[\w[\]/#.%-]+)?(?=\s|$)|\[[^\]]+\]|\d(?:s|ms|px|rem|em|vh|vw|%)\b/i;
// Bloc CSS (styled-jsx, @keyframes) : accolades, deux-points et points-virgules.
const CSS_BLOCK = /[{}][^]*:[^]*;/;

function isCssLike(text) {
  if (/[À-ÿ]/.test(text)) return false;
  return CSS_BLOCK.test(text) || (CSS_LIKE.test(text) && CSS_HINT.test(text));
}

/** Attribut JSX englobant, s'il y en a un (ex. aria-label={open ? 'a' : 'b'}). */
function enclosingJsxAttribute(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxAttribute(p)) return p;
    if (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p) || ts.isFunctionLike(p)) return null;
  }
  return null;
}

function calleeName(call) {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return '';
}

/** Vrai si le nœud est un argument (même imbriqué) d'un helper CMS. */
function insideCmsHelper(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isCallExpression(p) && CMS_HELPERS.has(calleeName(p))) return true;
    if (ts.isFunctionLike(p) || ts.isSourceFile(p)) return false;
  }
  return false;
}

function insideSchema(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxAttribute(p) && p.name.getText() === 'dangerouslySetInnerHTML') return true;
    if (ts.isVariableDeclaration(p) && SCHEMA_VAR.test(p.name.getText())) return true;
    if (ts.isPropertyAssignment(p) && /^['"]?@/.test(p.name.getText())) return true;
    if (ts.isFunctionDeclaration(p) && p.name && /generateMetadata/.test(p.name.text)) return true;
    if (ts.isCallExpression(p) && /^console$/.test(p.expression.expression?.getText?.() ?? '')) return true;
  }
  return false;
}

function isDataPosition(node) {
  const p = node.parent;
  if (ts.isPropertyAssignment(p)) {
    if (p.name === node) return false;
    return !NON_TEXT_PROP.test(p.name.getText().replace(/['"]/g, ''));
  }
  if (ts.isArrayLiteralExpression(p) || ts.isVariableDeclaration(p) || ts.isReturnStatement(p)
    || ts.isConditionalExpression(p) || ts.isTemplateSpan(p) || ts.isParenthesizedExpression(p)) return true;
  if (ts.isJsxExpression(p)) return !ts.isJsxAttribute(p.parent);
  if (ts.isBinaryExpression(p)) {
    const op = p.operatorToken.kind;
    return op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.PlusToken;
  }
  if (ts.isCallExpression(p)) return SETTER_RE.test(calleeName(p));
  return false;
}

/**
 * Analyse un fichier TSX et retourne la liste des textes visibles en dur.
 * Exporté pour les tests unitaires.
 */
export function scanSourceForHardcodedText(source, filePath = 'inline.tsx') {
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const found = [];
  const visit = (n) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n) || ts.isTypeNode(n)) return;
    if (ts.isJsxText(n)) {
      const text = n.getText().replace(/\s+/g, ' ').trim();
      if (HAS_WORD.test(text)) found.push({ line: line(n), kind: 'jsx', text });
    } else if (ts.isJsxAttribute(n)) {
      const init = n.initializer;
      const tag = n.parent.parent.tagName?.getText?.() ?? '';
      if (init && ts.isStringLiteral(init) && VISIBLE_ATTRS.has(n.name.getText())
        && /\p{L}{3,}/u.test(init.text) && tag !== 'EditableZone') {
        found.push({ line: line(n), kind: 'attr', text: `${n.name.getText()}="${init.text}"` });
      }
    } else if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
      && PHRASE.test(n.text) && !TOKEN.test(n.text) && !isCssLike(n.text)
      && isDataPosition(n) && !insideCmsHelper(n) && !insideSchema(n)) {
      // Valeur calculée d'un attribut : ne compte que pour un attribut visible.
      const attr = enclosingJsxAttribute(n);
      if (!attr || VISIBLE_ATTRS.has(attr.name.getText())) {
        found.push({ line: line(n), kind: 'data', text: n.text });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

function collectFiles(target, acc = []) {
  let st;
  try { st = statSync(target); } catch { return acc; }
  if (st.isFile()) {
    if (target.endsWith('.tsx')) acc.push(target.split('\\').join('/'));
    return acc;
  }
  for (const name of readdirSync(target)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    collectFiles(join(target, name), acc);
  }
  return acc;
}

/** Compte les textes en dur de chaque fichier cible. */
export function countHardcodedText(targets = CMS_HARDCODE_TARGETS) {
  const files = [...new Set(targets.flatMap((t) => collectFiles(t)))].sort();
  const counts = {};
  for (const f of files) counts[f] = scanSourceForHardcodedText(readFileSync(f, 'utf8'), f).length;
  return counts;
}

/**
 * Compare aux références : un fichier au-dessus de sa référence (ou nouveau
 * fichier non nul) est une régression ; en dessous, un gain à verrouiller.
 */
export function compareToBaseline(counts, baseline) {
  const regressions = [];
  const gains = [];
  for (const [file, n] of Object.entries(counts)) {
    const ref = baseline[file] ?? 0;
    if (n > ref) regressions.push({ file, ref, n });
    else if (n < ref) gains.push({ file, ref, n });
  }
  return { regressions, gains };
}

function readBaseline() {
  return existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : {};
}

function writeBaseline(obj) {
  const sorted = Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

function main() {
  const args = process.argv.slice(2);
  const listIdx = args.indexOf('--list');
  if (listIdx >= 0) {
    const f = args[listIdx + 1];
    for (const v of scanSourceForHardcodedText(readFileSync(f, 'utf8'), f)) console.log(`${f}:${v.line} [${v.kind}] ${v.text}`);
    return;
  }

  const counts = countHardcodedText();
  const baseline = readBaseline();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (args.includes('--init')) {
    writeBaseline(counts);
    console.log(`Référence initialisée : ${total} texte(s) en dur sur ${Object.keys(counts).length} fichiers.`);
    return;
  }

  const { regressions, gains } = compareToBaseline(counts, baseline);

  if (args.includes('--update')) {
    if (regressions.length) {
      console.error('✗ --update refusé : des fichiers ont augmenté. Le cliquet ne remonte pas.');
      for (const r of regressions) console.error(`  - ${r.file} : ${r.ref} → ${r.n}`);
      process.exit(1);
    }
    const next = { ...baseline };
    for (const [file, n] of Object.entries(counts)) next[file] = n;
    for (const file of Object.keys(next)) if (!(file in counts)) delete next[file];
    writeBaseline(next);
    console.log(`Référence abaissée : ${gains.length} fichier(s), ${total} texte(s) en dur au total.`);
    return;
  }

  if (regressions.length) {
    console.error(`\n✗ check-cms-hardcode : texte visible ajouté en dur dans ${regressions.length} fichier(s).\n`);
    for (const r of regressions) {
      console.error(`  - ${r.file} : ${r.ref} → ${r.n}`);
      for (const v of scanSourceForHardcodedText(readFileSync(r.file, 'utf8'), r.file).slice(0, 12)) {
        console.error(`      L${v.line} [${v.kind}] ${v.text.slice(0, 90)}`);
      }
    }
    console.error('\nFaire passer ce texte par le CMS : <EditableZone>, Z(…), useZoneText, getCmsOrSetting ou getZoneLinks.');
    console.error('Détail d\'un fichier : node scripts/check-cms-hardcode.mjs --list <fichier>');
    process.exit(1);
  }
  const gainNote = gains.length
    ? ` ${gains.length} fichier(s) en baisse : lancer \`node scripts/check-cms-hardcode.mjs --update\` pour verrouiller le gain.`
    : '';
  console.log(`✓ check-cms-hardcode : ${Object.keys(counts).length} fichiers, ${total} texte(s) en dur, aucune hausse.${gainNote}`);
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-hardcode.mjs')) {
  main();
}
