#!/usr/bin/env node
/**
 * media_auto — la chaîne complète en une commande, ou en surveillance continue.
 *
 * Le maillon manuel du pipeline est la sélection dans Google Photos : l'API
 * Picker l'impose (depuis mars 2025, Google interdit de lister une photothèque
 * entière). On la contourne non pas en forçant l'API, mais en déplaçant le
 * point d'entrée : tout média déposé dans le dossier surveillé est traité seul.
 *
 *   Déposer des fichiers  ─┐
 *   Export Google Takeout ─┼─→  public/images/destinations/<dest>/  ─→  chaîne
 *   scripts/photos_picker ─┘
 *
 * Chaîne : registre de preuves → publication CMS → vérification du vécu.
 *
 * Usage :
 *   node scripts/media_auto.mjs                 # une passe
 *   node scripts/media_auto.mjs --watch         # surveille et traite en continu
 *   node scripts/media_auto.mjs --dry-run       # simule la publication
 *   node scripts/media_auto.mjs --dest roumanie --interval 30
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const WATCH = args.includes('--watch');
const DRY = args.includes('--dry-run');
const DEST = arg('--dest', 'roumanie');
const INTERVAL = Number(arg('--interval', '30')) * 1000;
const MEDIA_DIR = `public/images/destinations/${DEST}`;

const MEDIA_EXT = /\.(jpe?g|png|heic|webp|tiff?|mp4|mov|avi|mkv|m4v)$/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function lancer(cmd, argv, etape) {
  return new Promise(resolve => {
    console.log(`\n── ${etape} ─────────────────────────────`);
    // shell:true — sous Windows « python » et « npx » passent par le PATH du shell.
    const p = spawn(cmd, argv, { stdio: 'inherit', shell: true });
    p.on('close', code => resolve(code ?? 1));
    p.on('error', () => resolve(1));
  });
}

/** Empreinte du dossier : sert à ne relancer la chaîne que si le contenu bouge. */
function empreinte(dir) {
  if (!existsSync(dir)) return '';
  return readdirSync(dir)
    .filter(f => MEDIA_EXT.test(f))
    .map(f => { const s = statSync(`${dir}/${f}`); return `${f}:${s.size}`; })
    .sort().join('|');
}

function compter(dir) {
  return existsSync(dir) ? readdirSync(dir).filter(f => MEDIA_EXT.test(f)).length : 0;
}

async function passe() {
  const n = compter(MEDIA_DIR);
  console.log(`\n📦 ${n} média(s) dans ${MEDIA_DIR}`);
  if (!n) {
    console.log('   Rien à traiter. Dépose des photos ici, ou lance :');
    console.log('   python scripts/photos_picker.py\n');
    return false;
  }

  // 1. Les métadonnées EXIF établissent où et quand — seuls faits de vécu
  //    qu'on s'autorise à publier sans intervention humaine.
  if (await lancer('python', ['scripts/photos_evidence.py', '--geocode'],
                   '1/3  Registre de preuves (GPS + horodatage)')) {
    console.log('\n⚠️  Registre non généré, on s\'arrête ici.');
    return false;
  }

  // 2. Une image n'est posée sur une page que si son GPS l'y situe vraiment.
  const pub = ['scripts/media_publish.mjs', '--dest', DEST];
  if (DRY) pub.push('--dry-run');
  await lancer('node', pub, `2/3  Publication CMS${DRY ? ' (simulation)' : ''}`);

  // 3. Le contrôle qui refuse ce que les photos ne prouvent pas.
  await lancer('node', ['scripts/check-content-evidence.mjs'],
               '3/3  Vérification du vécu');
  return true;
}

async function main() {
  if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true });

  console.log('\n' + '='.repeat(58));
  console.log(`  Heldonica — chaîne média « ${DEST} »${WATCH ? '  [surveillance]' : ''}`);
  console.log('='.repeat(58));

  if (!WATCH) { await passe(); return; }

  console.log(`\nSurveillance de ${MEDIA_DIR} toutes les ${INTERVAL / 1000}s.`);
  console.log('Dépose des photos : la chaîne repart seule. Ctrl+C pour arrêter.\n');

  let vue = '';
  let stableDepuis = 0;

  for (;;) {
    const actuelle = empreinte(MEDIA_DIR);

    if (actuelle !== vue) {
      // On attend que le dossier cesse de bouger : traiter pendant une copie
      // en cours donnerait un registre bâti sur des fichiers tronqués.
      stableDepuis = 0;
      vue = actuelle;
      console.log(`[${new Date().toLocaleTimeString('fr-FR')}] changement détecté, on laisse la copie finir…`);
    } else if (actuelle && ++stableDepuis === 2) {
      console.log(`[${new Date().toLocaleTimeString('fr-FR')}] dossier stable, traitement`);
      await passe();
      console.log(`\n[${new Date().toLocaleTimeString('fr-FR')}] en attente de nouveaux médias…\n`);
    }

    await sleep(INTERVAL);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
