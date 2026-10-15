# Heldonica Mobile — 0€ (Picker + OSM + EXIF)

App Android gratuite qui remplace `python scripts/import_media_roumanie.py` depuis le téléphone.

**0€ :** Photo Picker (sans scope Drive), OSM Nominatim, Supabase Storage `media`, pas de Google Places/MAPS facturé.

## Flux
1. Picker système → 1-10 photos/vidéos (EXIF GPS gardé)
2. ExifInterface lit GPS + date en local
3. Si pas de GPS → FusedLocationProvider (GPS live)
4. Reverse geocode gratuit → `nominatim.openstreetmap.org/reverse` (1 req/s, cache)
5. POST `https://www.heldonica.fr/api/cms/mobile-publish` → brouillon `published:false` + POI + `instagram_scheduled_posts` draft

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
**Artifacts**. Aucun secret n'est compilé dans l'APK de CI : le mot de passe CMS se
configure directement sur le téléphone (enregistré de façon chiffrée/privée dans les
SharedPreferences) ou via `local.properties` pour un build local personnel.

## Config
- `local.properties` (non versionné, pour build développeur) : `cms.baseUrl=https://www.heldonica.fr` + `cms.password=<mot de passe personnel>` — jamais en clair dans le dépôt, voir `local.properties.example`
- Sur mobile (APK CI) : configuration du mot de passe CMS directement dans l'interface (icône ⚙️ / 🔑 de l'onglet Cerveau).
- Aucune clé Google Cloud nécessaire pour le MVP. Pour OSM tu mets `User-Agent: Heldonica (contact@heldonica.fr)`.

## Structure
- `MainActivity.kt` : Picker + EXIF + Nominatim + upload WorkManager
- `UploadWorker.kt` : retry + multipart
- `AndroidManifest.xml` : permissions minimales

Voir `app/src/main/java/fr/heldonica/mobile/MainActivity.kt` pour le code complet.

## Studio Mobile (slice 1, depuis 10/2026)
- `StudioActivity.kt` : coque 4 onglets (Cerveau / CMS / Studio / Insta), nouveau point d'entree de l'appli.
- Onglet Cerveau : console Brain en vue web (`brain.webUrl` dans `local.properties`, connexion manuelle, aucun secret embarque).
- Onglet CMS : ouvre `EditeurActivity` (session deja geree).
- Onglets Studio / Insta : ecrans d'attente, slices 2 et 3.
- Test JVM sans emulateur : `StudioTabsTest` (`./gradlew :app:testDebugUnitTest`).
