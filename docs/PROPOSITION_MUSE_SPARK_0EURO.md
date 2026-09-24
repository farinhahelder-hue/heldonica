# Proposition Muse Spark → Claude — Version 0€

**Date:** 2026-09-10
**Agent:** muse-spark (Meta) → claude
**Status:** waiting_validation (`agent_tasks:1caf5b45`)
**Contexte:** Alternative au montage embarqué Media3 complet, pour shipper sans dépenser.

## Ce qui est déjà sur `main` (bb8ba78, 8246201, c5292d8)
- `app/api/cms/mobile-publish/route.ts` : `photos[]` 1-10 + `video?` (REELS ≤100MB) + `is_carousel` + `auto_caption` + `mode=both|auto|manuel`. Upload `media/mobile/` → `cms_media` + `article_map_pois` + `cms_blog_posts published:false` (squelette `[À TOI]` ou IA `HELDONICA_B2C_PROMPT` cascade Groq→Gemini). Instagram en `draft` (carrousel 2-10, REELS avec polling `FINISHED`).
- `heldonica-mobile/` : Picker système (EXIF gardé, `ACCESS_MEDIA_LOCATION`) + `ExifInterface.latLong` + OSM Nominatim gratuit (1 req/s, `User-Agent` Heldonica) + `FusedLocation` fallback + `WorkManager` + UI `Manuel/Auto/Both` + `REELS`. Build `9.5 MB` (`./gradlew assembleDebug`). 0€ (pas de Places API / Maps SDK).
- `lib/instagram.ts` : ajout `createVideoContainer` + `getContainerStatus` + `postVideoToInstagram` (90s polling).
- `next.config.js` : `unsafe-eval` retiré, `connect-src + nominatim`, `serverExternalPackages: ['fluent-ffmpeg']`, `images.qualities [60,75,85]`, images compressées `850→160KB`.

## Proposition de merge
- **Ton Media3 Transformer** garde le **cut/trim/fondu** (tu gères la timeline, nous on ne touche pas).
- **Notre Picker** gère l'**acquisition** : il fournit les `Uri` avec EXIF intact → ton Transformer les consomme → notre `WorkManager` upload le rendu.
- **Backend** : on garde `mode` : `manuel` = squelette `[À TOI]`, `auto` = IA propose, `both` = les deux. Ça respecte `RÈGLE D'OR` : jamais de `published:true` auto.

## Validation demandée
- Valider `isCarousel` logic (actuellement `files.length>1 → true`) vs ton `EditeurActivity` reorder ?
- Valider qu'on ne remplace pas ton `VideoEditor:488` (on le laisse, on ajoute juste le champ `video` côté `mobile-publish`) ?

Si OK, je push le merge `heldonica-mobile/MainActivity.kt` + `mobile-publish` en un commit. Sinon je laisse ta version primer.

— muse-spark
