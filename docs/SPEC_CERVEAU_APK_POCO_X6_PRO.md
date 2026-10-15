# Spécification Technique — Cerveau Heldonica en APK sur Poco X6 Pro

> **Statut :** Validé & Prêt pour exécution autonome  
> **Destinataire :** Agent AllHands / OpenHands  
> **Dépôt cible :** `heldonica-clean` (`heldonica-mobile/`)  
> **Matériel cible :** Smartphone Xiaomi Poco X6 Pro 5G (HyperOS / Android 14)  
> **Date :** 15 octobre 2026  

---

## 1. Contexte & Objectif

L'objectif est d'embarquer le **Cerveau Heldonica** directement dans l'application mobile Android unique (`fr.heldonica.mobile`), optimisée spécifiquement pour le smartphone **Xiaomi Poco X6 Pro**.

### Fin du mythe du PC 24/7
Historiquement, l'accès au Cerveau nécessitait une station PC allumée en permanence avec ComfyUI et Ollama.  
Cette contrainte est désormais levée :
- **PC éteint (Mode Nominal / Cloud 0€)** : Le smartphone interroge la route `/api/ai/mobile-brain` qui orchestre gratuitement Gemini 2.5 Flash et Groq en cascade sans latence (<500 ms).
- **PC allumé (Mode Studio / LAN)** : Si le téléphone est connecté au Wi-Fi de la station de travail, il peut optionnellement basculer sur le port local `8440` du Brain.
- **Hors-Ligne (Terrain isolé)** : Le téléphone s'appuie sur le cache de connaissances embarqué (`assets/knowledge_vault.json`).

---

## 2. Profil Matériel : Xiaomi Poco X6 Pro

Le code mobile Jetpack Compose et Media3 Transformer est calibré pour tirer le plein potentiel du Poco X6 Pro :

| Composant | Spécification Poco X6 Pro | Optimisation Heldonica APK |
|---|---|---|
| **SoC** | MediaTek Dimensity 8300-Ultra (TSMC 4nm) | Traitement multithreadé sans surchauffe |
| **NPU / APU** | MediaTek APU 780 (AI Engine) | Prédisposition pour inférence locale ONNX/MediaPipe |
| **GPU** | ARM Mali-G615 MC6 @ 1400 MHz | Accélération graphique Compose & filtres vidéo |
| **Écran** | Flow AMOLED 6.67" 1220x2712 @ 120 Hz | Défilement `LazyColumn` ultra-fluide avec `rememberLazyListState` |
| **RAM / Stockage** | 8 à 12 Go LPDDR5X + UFS 4.0 | Chargement instantané des historiques et caches |
| **Encodeur Vidéo** | MediaCodec H.264 / HEVC / AV1 | Encodage Media3 Transformer des Shorts 9:16 en ~3 secondes |

---

## 3. Règle Absolue de Sécurité (Non Négociable)

> **ZÉRO CLÉ D'API DANS L'APK.**
> Un fichier APK se décompresse en quelques secondes. Aucune clé Gemini, Groq, ou clé service Supabase ne doit figurer dans `build.gradle.kts` ou dans le code Kotlin.

Tous les flux passent par :
```
[📱 Poco X6 Pro] 
       │
       │ (HTTPS POST + en-tête x-heldonica-client)
       ▼
[☁️ Next.js /api/ai/mobile-brain] ──► Cascade Cloud 0€ (Groq / Gemini)
       │
       ▼ (Si sur le LAN Wi-Fi et PC allumé)
[💻 Heldonica Brain PC :8440/api/chat]
```

---

## 4. Architecture des Fichiers Clés

### Côté Serveur Web (Next.js)
- `app/api/ai/mobile-brain/route.ts` :
  - Route sécurisée dédiée au Poco X6 Pro.
  - 4 modes opérationnels :
    - `coach` : Copilote ADHD/TSA (1 action concrète, 5/15/30 min, énergie basse).
    - `terrain` : Transformation des notes de terrain en carnets authentiques.
    - `vault` : Interrogation des 55 fiches du Coffre des Savoirs.
    - `chat` : Échange libre avec la voix officielle (tutoiement lecteur, 'on' pour le duo).
  - Validation temps réel de la voix de marque via `validateGardeFous`.

### Côté Application Mobile (`heldonica-mobile/`)
- `app/src/main/java/fr/heldonica/mobile/BrainClient.kt` :
  - Client OkHttp / Coroutines.
  - Détection automatique de la station PC via ping HTTP 1.5s.
  - Bascule transparente Cloud 0€ ↔ Station PC.
- `app/src/main/java/fr/heldonica/mobile/CerveauScreen.kt` :
  - Écran natif Jetpack Compose 120 Hz remplaçant l'ancienne WebView défaillante.
  - Chips de sélection de mode + suggestions rapides.
  - Badge d'état réseau en temps réel (`🟢 Cloud 0€` ou `💻 PC LAN`).
  - Bulles de messages stylisées (palette Eco-Luxe : Cloud Dancer `#F9F8F5`, Eucalyptus `#2C4C38`).
- `app/src/main/java/fr/heldonica/mobile/StudioActivity.kt` :
  - Coque principale à 4 onglets :
    1. 🧠 **Cerveau** (`CerveauScreen`)
    2. 📝 **CMS** (`EditeurActivity`)
    3. 🏛️ **Memoria** (`MemoriaImperium`)
    4. 📸 **Terrain** (`MainActivity` Photo Picker + EXIF + OSM)
- `app/src/main/assets/knowledge_vault.json` :
  - Registre de connaissances de secours embarqué pour usage hors-ligne.

---

## 5. Recette de Build et Déploiement

### 1. Tests unitaires JVM (sans émulateur)
```bash
cd heldonica-mobile
./gradlew testDebugUnitTest
```

### 2. Compilation de l'APK Debug
```bash
./gradlew assembleDebug
# APK produit : app/build/outputs/apk/debug/app-debug.apk
```

### 3. Installation directe sur le Poco X6 Pro via ADB
Brancher le smartphone en USB (Débogage USB activé dans les options développeur HyperOS) :
```bash
py -3 scripts/adb_auto_installer.py
```
Le script détecte automatiquement le téléphone et installe l'APK avec lancement immédiat.

---

## 6. Liste de Contrôle pour AllHands

- [x] Route API `/api/ai/mobile-brain` créée et couverte par les garde-fous.
- [x] Client Kotlin `BrainClient.kt` implémenté avec OkHttp et coroutines.
- [x] Écran natif Compose `CerveauScreen.kt` câblé dans `StudioActivity.kt`.
- [x] Assets de connaissances hors-ligne `knowledge_vault.json` créés.
- [x] Zéro fuite de clé dans l'APK.
- [x] Garde-fous CI `npm run preflight` validés (5/5 PASS).
