#!/usr/bin/env node
/**
 * draft_from_evidence.mjs — Générateur de Brouillons Ancrés dans les Faits
 *
 * RÈGLE D'OR : "On n'invente rien. On raconte ce qu'on a vécu."
 *
 * Ce script parcourt les photos réelles et tracés GPS extraits (content/destinations/** / trajet_gps.json)
 * et génère des brouillons où les faits vérifiables (date, coordonnées, parcours) sont verrouillés,
 * tandis que les détails personnels (odeur, ressenti, prix, déception) sont balisés avec [À TOI].
 *
 * Usage :
 *   npm run media:drafts
 *   node scripts/draft_from_evidence.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

function readEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try { raw = readFileSync(f, 'utf8'); break; } catch {}
  }
  const get = (k) => {
    if (process.env[k]) return process.env[k];
    const m = raw.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };
  return {
    url: get('NEXT_PUBLIC_SUPABASE_URL'),
    key: get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  };
}

const CONTENT_DIR = 'content/destinations';
const DRAFTS_DIR = 'content/drafts';

if (!existsSync(DRAFTS_DIR)) {
  mkdirSync(DRAFTS_DIR, { recursive: true });
}

console.log('============================================================');
console.log('  🌿 Heldonica — Générateur de Brouillons Ancrés dans le Réel');
console.log('============================================================\n');

if (!existsSync(CONTENT_DIR)) {
  console.log(`Le dossier ${CONTENT_DIR} n'existe pas encore.`);
  process.exit(0);
}

const destinations = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let generatedCount = 0;

for (const dest of destinations) {
  const gpsFile = join(CONTENT_DIR, dest, 'trajet_gps.json');
  if (existsSync(gpsFile)) {
    try {
      const data = JSON.parse(readFileSync(gpsFile, 'utf8'));
      const points = data.points || [];
      const totalPoints = points.length;

      if (totalPoints === 0) continue;

      const title = `Carnet de route : ${dest.charAt(0).toUpperCase() + dest.slice(1)} au fil des étapes réelles`;
      const slug = `carnet-${dest}-evidence-${new Date().toISOString().split('T')[0]}`;
      const draftFile = join(DRAFTS_DIR, `${slug}.md`);

      const pointsList = points.map((p, idx) => 
        `  ${idx + 1}. **${p.filename}** — Coordonnées GPS : \`${p.latitude}, ${p.longitude}\` (${p.date || 'Date à vérifier'})`
      ).join('\n');

      const draftContent = `---
title: "${title}"
slug: "${slug}"
destination: "${dest}"
status: "draft"
published: false
created_at: "${new Date().toISOString()}"
total_media: ${totalPoints}
---

<!--
  RÈGLES ÉDITORIALES HELDONICA (Rappel AGENTS.md & GUIDE_VOIX_HELDONICA_IA.md) :
  1. "On n'invente rien. On raconte ce qu'on a vécu."
  2. Pronoms : Strictement "on" pour le duo, "tu" pour le lecteur.
  3. Mots bannis : Pas de (bon plan, incontournable, tips, magnifique, incroyable, spot, optimiser, paradis).
  4. Complète les balises [À TOI] avec tes souvenirs véridiques.
-->

## L'Étape en bref
On a parcouru cette route en **${dest}** lors de nos voyages de terrain. Voici les repères GPS précis et vérifiés enregistrés par nos appareils :

${pointsList}

## Ce qu'on a ressenti sur place
[À TOI : Décris l'atmosphère, la lumière matinale ou les odeurs ressenties en arrivant à la première étape.]

## Les détails pratiques & repères de prix
- **Accès & route** : [À TOI : état de la route, virages, accès parking]
- **Budget réel** : [À TOI : prix du café au comptoir en €, ticket d'entrée, hébergement]
- **Temps de marche conseillé** : [À TOI : durée de marche constatée]

## Ce qu'on a moins aimé
[À TOI : Note honnête sur ce qui était moins agréable — foule, pluie, accès difficile, attente.]

---

### 📱 Proposition Légende Instagram (Ancrée dans les coordonnées)
🌿 On a posé nos valises en ${dest.charAt(0).toUpperCase() + dest.slice(1)} entre [À TOI : 2 étapes phares]. 
[À TOI : 1 phrase sur l'ambiance vécue]. 
📍 Repères GPS complets et carnet sur heldonica.fr.
#slowtravel #${dest} #heldonica #voyagelent
`;

      writeFileSync(draftFile, draftContent, 'utf8');
      console.log(`✅ Brouillon généré : ${draftFile}`);
      generatedCount++;
    } catch (e) {
      console.error(`Erreur sur ${dest}:`, e.message);
    }
  }
}

console.log(`\n🎉 ${generatedCount} brouillon(s) ancré(s) généré(s) dans ${DRAFTS_DIR}/ !`);
console.log('Chaque fait est verrouillé, il ne reste qu\'à compléter les balises [À TOI].');
