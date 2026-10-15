# Heldonica Mobile — 0€ (Picker + OSM + EXIF)

App Android gratuite qui remplace `python scripts/import_media_roumanie.py` depuis le téléphone.

**0€ :** Photo Picker (sans scope Drive), OSM Nominatim, Supabase Storage `media`, pas de Google Places/MAPS facturé.

## Flux
1. Picker système → 1-10 photos/vidéos (EXIF GPS gardé)
2. ExifInterface lit GPS + date en local
3. Si pas de GPS → FusedLocationProvider (GPS live)
4. Reverse geocode gratuit → `nominatim.openstreetmap.org/reverse` (1 req/s, cache)
5. POST `https://www.heldonica.fr/api/cms/mobile-publish` → brouillon `published:false` + POI + `instagram_scheduled_posts` draft

## Écrans

- **Publier une photo** — le flux ci-dessus.
- **Monter une vidéo** — Media3 Transformer, local.
- **Écrire un carnet** — un titre, un récit, sans photo.
- **Tâches des agents** — lit et écrit le registre `agent_tasks` via
  `/api/agent-tasks` : lister, prendre, déposer. C'est ce qui permet de se passer
  du PC allumé pour la coordination.

### Authentification de l'écran « Tâches »

L'app envoie le mot de passe CMS déjà embarqué (`cms.password`, en-tête
`x-cms-auth`). Elle **ne porte pas** la clé service Supabase : un APK est
décompilable, et une clé service donnerait les droits d'administration de la base.
Le jeton vit côté serveur, dans la route. Voir `docs/ARCHITECTURE_SANS_PC.md`.

## Build

### En local (ligne de commande, sans Android Studio)

Prérequis : **JDK 17 ou 21** et le **SDK Android** (plateforme 34 + build-tools 34.0.0).

```bash
# 1. JDK + SDK (une fois)
export JAVA_HOME=/chemin/vers/jdk-21
export ANDROID_HOME=/chemin/vers/android-sdk
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 2. Pointer le SDK dans local.properties (fichier NON versionné)
echo "sdk.dir=$ANDROID_HOME" > local.properties

# 3. Construire
cd heldonica-mobile
./gradlew assembleDebug
# APK → app/build/outputs/apk/debug/app-debug.apk (sideload, pas besoin Play Store 25$)
```

Le wrapper (`gradlew` + `gradle/wrapper/gradle-wrapper.jar`) est **versionné** : pas besoin
d'Android Studio pour builder. Il fixe **Gradle 8.7**, la version attendue par la CI
(`.github/workflows/build-apk.yml`) et compatible avec l'AGP 8.4 du projet.

Si le wrapper devait être régénéré :
```bash
gradle wrapper --gradle-version 8.7
```

### Sur GitHub Actions (repli)

Le workflow **Build APK** (`.github/workflows/build-apk.yml`) construit l'APK et le
dépose en artefact `heldonica-mobile-debug`. Onglet **Actions** → dernier run vert →
**Artifacts**. Il a besoin du secret `CMS_PASSWORD` pour que l'APK puisse publier
(sans lui, l'APK se construit mais ne peut pas publier).

## Config
- `local.properties` (non versionné) : `cms.baseUrl=https://www.heldonica.fr` + `cms.password=<la valeur de CMS_PASSWORD sur Vercel>` — jamais en clair dans le dépôt, voir `local.properties.example`
- Aucune clé Google Cloud nécessaire pour le MVP. Pour OSM tu mets `User-Agent: Heldonica (contact@heldonica.fr)`.

## Structure
- `MainActivity.kt` : Picker + EXIF + Nominatim + upload WorkManager
- `UploadWorker.kt` : retry + multipart
- `AndroidManifest.xml` : permissions minimales

Voir `app/src/main/java/fr/heldonica/mobile/MainActivity.kt` pour le code complet.
