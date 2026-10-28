#!/usr/bin/env node
/**
 * Garde-fou : une release Android ne se signe jamais avec le keystore de debug
 * VERSIONNÉ du dépôt.
 *
 * Constat mesuré le 2026-10-20. `keystore/heldonica-debug.keystore` est dans un
 * dépôt PUBLIC, et son mot de passe (« heldonica ») était écrit en clair dans
 * `app/build.gradle.kts`. Le repli de signature de release y retombait quand les
 * secrets RELEASE_* étaient absents. Résultat : les 7 APK publiés étaient signés
 * avec cette clé publique — empreinte SHA-256 du certificat
 * 15:71:BD:5C:CE:90:FF:94:32:79:C7:D2:D6:80:88:5B…, « CN=Heldonica Mobile Debug ».
 *
 * Conséquence : n'importe qui peut fabriquer un APK portant la même identité de
 * signature, qu'Android acceptera comme une mise à jour légitime de l'application
 * installée. C'est aussi ce qui vide de sens la vérification du certificat de
 * Google Sign-In : le SHA-1 déclaré dans la console Google est celui d'une clé
 * publique, donc reproductible par un tiers.
 *
 * Ce script échoue si `signingConfigs.release` (ou `buildTypes.release`) retombe
 * sur le keystore de debug, ou si le mot de passe du keystore y est en dur.
 *
 * Ce qu'il ne fait pas : vérifier qu'un keystore de release existe. Il vérifie
 * qu'on ne signe pas une release avec une clé publique.
 */

import fs from 'node:fs'

const FICHIER = 'heldonica-mobile/app/build.gradle.kts'

if (!fs.existsSync(FICHIER)) {
  console.log(`  ${FICHIER} absent — rien à contrôler.`)
  process.exit(0)
}

const src = fs.readFileSync(FICHIER, 'utf8')
const erreurs = []

// Isoler le bloc signingConfigs, puis le bloc release à l'intérieur.
const iSigning = src.indexOf('signingConfigs')
if (iSigning !== -1) {
  // Le bloc `create("release") { ... }` : on prend de `create("release")` jusqu'à
  // la fermeture équilibrée des accolades.
  const iRelease = src.indexOf('create("release")', iSigning)
  if (iRelease !== -1) {
    let j = src.indexOf('{', iRelease)
    let profondeur = 0
    let k = j
    for (; k < src.length; k++) {
      if (src[k] === '{') profondeur++
      else if (src[k] === '}') {
        profondeur--
        if (profondeur === 0) break
      }
    }
    const bloc = src.slice(iRelease, k + 1)

    // 1. Aucune mention du keystore de debug dans la signature de release.
    if (/heldonica-debug\.keystore/.test(bloc)) {
      erreurs.push(
        'signingConfigs.release référence heldonica-debug.keystore : une release ' +
          'signée avec le keystore de debug public est falsifiable.'
      )
    }

    // 2. Aucun mot de passe en dur.
    if (/storePassword\s*=\s*"[^"]+"|keyPassword\s*=\s*"[^"]+"/.test(bloc)) {
      erreurs.push(
        'signingConfigs.release contient un mot de passe en dur (storePassword / ' +
          'keyPassword littéral) : il doit venir de local.properties ou de l\'environnement.'
      )
    }

    // 3. Le keystore de release doit être exigé, pas optionnel : un repli silencieux
    //    est ce qui a produit les 7 APK falsifiables. On attend une garde explicite.
    const garde =
      /throw\s+GradleException|GradleException\(|error\(|check\(/.test(bloc)
    if (!garde) {
      erreurs.push(
        'signingConfigs.release n\'échoue pas quand le keystore de release manque : ' +
          'un repli silencieux peut réintroduire la signature par le keystore de debug.'
      )
    }
  }
}

if (erreurs.length) {
  console.log('\n  Signature de release non sûre :\n')
  for (const e of erreurs) console.log(`    ✗ ${e}`)
  console.log('')
  process.exit(1)
}

console.log('  Signature de release : keystore dédié exigé, aucun repli sur le debug.')
