# Keystore de release Heldonica Mobile

## Pourquoi ce dossier existe

`heldonica-debug.keystore` est **versionné volontairement** — mais c'est une clé de **debug**,
publique. Elle ne protège rien : elle sert seulement à ce que les APK d'une même série se
reconnaissent entre eux (sinon Android refuse chaque mise à jour avec
`INSTALL_FAILED_UPDATE_INCOMPATIBLE`, et il faut désinstaller — donc perdre ses réglages).

**Une release ne se signe jamais avec elle.** Le dépôt est ouvert : n'importe qui peut signer un
APK avec cette clé, et Android accepterait la mise à jour forgée comme légitime. Constat du
2026-10-20 : les 7 APK publiés l'étaient (empreinte SHA-256 du certificat
`15:71:BD:5C:CE:90:FF:94:32:79:C7:D2:D6:80:88:5B:0C:00:84:4E:CE:B2:97:CC:45:39:06:EB:DD:C1:02:4F`,
lue directement dans `heldonica-debug.keystore`). `app/build.gradle.kts` **échoue** désormais
plutôt que de produire un APK falsifiable.

## Créer le keystore de release

À faire **une seule fois**, sur une machine de confiance. Le fichier produit ne doit
**jamais** entrer dans le dépôt (il est déjà dans `.gitignore`).

```bash
cd heldonica-mobile
keytool -genkeypair -v \
  -keystore keystore/heldonica-release.keystore \
  -alias heldonica \
  -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` vient d'un JDK (Temurin 17 convient). Choisissez un mot de passe fort et
**conservez-le** : sans lui, le keystore est inutilisable et l'application ne pourra plus
être mise à jour sur le Play Store.

> `-validity 10000` couvre environ 27 ans. Google exige que le certificat reste valide après
> la dernière mise à jour prévue : ne pas mettre moins.

## Relever le SHA-1 (nécessaire au client OAuth Android)

```bash
keytool -list -v -keystore keystore/heldonica-release.keystore -alias heldonica
```

Repérer la ligne `SHA1:`. Google réclame le SHA-1 **et** le nom de paquet `fr.heldonica.mobile`
pour créer un client OAuth Android. Le SHA-256 est utile pour vérifier une signature, mais
Google demande le SHA-1 pour l'enregistrement Android.

## Poser les secrets de CI

Le workflow `.github/workflows/build-apk.yml` reconstruit le keystore depuis un secret unique.

```bash
base64 -w0 keystore/heldonica-release.keystore
```

Coller le résultat dans le secret GitHub **`RELEASE_KEYSTORE_BASE64`**, puis poser :

| Secret | Valeur |
|---|---|
| `RELEASE_STORE_PASSWORD` | le mot de passe du keystore |
| `RELEASE_KEY_ALIAS` | `heldonica` (ou l'alias choisi) |
| `RELEASE_KEY_PASSWORD` | le mot de passe de la clé (souvent identique au précédent) |

Tant que `RELEASE_KEYSTORE_BASE64` est absent, la CI construit un APK **non signé** pour la
validation (R8, proguard, lint) et **refuse de publier** — c'est voulu.

## Build local de validation, sans clé

Pour vérifier R8 et proguard sans engager la clé de publication :

```bash
./gradlew assembleRelease -PallowUnsignedRelease
```

## Où renseigner le client OAuth dans l'application

`local.properties` (non versionné, gabarit dans `local.properties.example`) :

```properties
google.signinClientId=<ID du client OAuth *web* du projet>
```

Le client **web** — pas le client Android. Google place cet ID dans l'audience du jeton, et
c'est lui que le serveur vérifie. Laissez vide pour garder le mot de passe seul : l'écran du
CMS reste alors exactement celui d'avant.

## Vérifications déjà faites

Les commandes ci-dessus ont été exécutées sur un keystore de test jetable : création,
extraction du SHA-1 et du SHA-256, encodage base64 et aller-retour octet pour octet. Elles
fonctionnent telles quelles.
