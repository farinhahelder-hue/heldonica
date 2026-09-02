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
```bash
# Android Studio Hedgehog+ / Gradle 8
cd heldonica-mobile
./gradlew assembleDebug
# APK → app/build/outputs/apk/debug/app-debug.apk (sideload, pas besoin Play Store 25$)
```

## Config
- `local.properties` : `cms.baseUrl=https://www.heldonica.fr` + `cms.password=HELDONICA2026` (ou token session)
- Aucune clé Google Cloud nécessaire pour le MVP. Pour OSM tu mets `User-Agent: Heldonica (contact@heldonica.fr)`.

## Structure
- `MainActivity.kt` : Picker + EXIF + Nominatim + upload WorkManager
- `UploadWorker.kt` : retry + multipart
- `AndroidManifest.xml` : permissions minimales

Voir `app/src/main/java/fr/heldonica/mobile/MainActivity.kt` pour le code complet.
