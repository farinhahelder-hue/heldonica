import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val cmsProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

// Taches demandees sur la ligne de commande. Capture ici, au niveau du script
// (receveur = Project), car `gradle` ne se resout pas de facon fiable depuis un
// lambda imbrique comme `create("release") { }`. Sert a n'exiger le keystore de
// release que lorsqu'on construit reellement une release : `testDebugUnitTest`
// configure ce bloc sans avoir besoin du keystore.
val tachesDemandees: List<String> = gradle.startParameter.taskNames

// Validation de CI (PR, push) : on construit la variante release SANS signature,
// pour verifier R8, proguard et lint sans engager de cle de publication. Sans ce
// drapeau, une release exige un keystore dedie et echoue si elle n'en a pas.
val autoriserNonSigne: Boolean = providers.gradleProperty("allowUnsignedRelease").isPresent

val cleRelease = rootProject.file("keystore/heldonica-release.keystore")
val mdpStoreRelease = cmsProps.getProperty("release.storePassword")
    ?: System.getenv("RELEASE_STORE_PASSWORD")
val releaseSignable = cleRelease.exists() && !mdpStoreRelease.isNullOrBlank()

if (tachesDemandees.any { it.lowercase().contains("release") } && !releaseSignable && !autoriserNonSigne) {
    throw GradleException(
        "Aucun keystore de release. Poser keystore/heldonica-release.keystore " +
            "et RELEASE_STORE_PASSWORD (voir .github/workflows/build-apk.yml). " +
            "Refus de signer une release avec le keystore de debug public."
    )
}

android {
    namespace = "fr.heldonica.mobile"
    compileSdk = 34

    // Cle de signature stable, versionnee volontairement. Sans elle, chaque
    // execution de la CI fabrique une cle de debug differente : Android refuse
    // alors la mise a jour (INSTALL_FAILED_UPDATE_INCOMPATIBLE) et il faut
    // desinstaller l'application - donc perdre ses reglages - a chaque version.
    // C'est une cle de debug : elle ne protege rien, elle identifie seulement
    // les APK de cette serie entre eux.
    signingConfigs {
        getByName("debug") {
            val cle = rootProject.file("keystore/heldonica-debug.keystore")
            if (cle.exists()) {
                storeFile = cle
                storePassword = "heldonica"
                keyAlias = "heldonica"
                keyPassword = "heldonica"
            }
        }

        // Signature de release. Le keystore vient de la CI (secrets RELEASE_*) ou de
        // local.properties (release.*). Fichier attendu : keystore/heldonica-release.keystore,
        // non versionne.
        //
        // Il n'y a PLUS de repli sur le keystore de debug versionne. Ce fichier est
        // public (depot ouvert) : un APK de release signe avec lui peut etre imite par
        // n'importe qui, et Android accepterait la mise a jour forgee comme legitime.
        // Constat du 2026-10-20 : les 7 APK publies l'etaient (empreinte SHA-256 du
        // certificat 15:71:BD:5C:...). Sans keystore de release, on echoue (ferme)
        // plutot que de produire un APK falsifiable.
        create("release") {
            if (releaseSignable) {
                storeFile = cleRelease
                storePassword = mdpStoreRelease
                keyAlias = cmsProps.getProperty("release.keyAlias")
                    ?: System.getenv("RELEASE_KEY_ALIAS")
                    ?: "heldonica"
                keyPassword = cmsProps.getProperty("release.keyPassword")
                    ?: System.getenv("RELEASE_KEY_PASSWORD")
                    ?: mdpStoreRelease
            }
        }
    }

    buildFeatures {
        buildConfig = true
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    defaultConfig {
        applicationId = "fr.heldonica.mobile"
        minSdk = 26
        targetSdk = 34
        // Minutes ecoulees depuis 1970, a la construction : chaque APK est plus
        // recent que tous ceux construits avant lui, quel que soit le workflow.
        // GITHUB_RUN_NUMBER ne convenait pas : chaque workflow a son propre
        // compteur. Les artefacts de « Build APK » portaient 125, les releases
        // (« Release APK », run 8 ou 9) retombaient sur le plancher de 40 :
        // Android refusait la release comme un retour en arriere (« This app
        // can't be installed on your device »). Plafond Android : 2,1 milliards,
        // atteint vers l'an 5900.
        versionCode = (System.currentTimeMillis() / 60_000L).toInt()
        versionName = "1.0." + (System.getenv("GITHUB_RUN_NUMBER") ?: "40")
        // Le moteur LLM embarque (tasks-genai) livre ~27 Mo de .so par ABI : on
        // ne garde que l'arm64 du Poco X6 Pro (l'x86_64 doublerait l'APK).
        ndk {
            abiFilters += "arm64-v8a"
        }

        buildConfigField(
            "String",
            "CMS_BASE_URL",
            "\"${cmsProps.getProperty("cms.baseUrl") ?: "https://www.heldonica.fr"}\""
        )
        buildConfigField(
            "String",
            "CMS_PASSWORD",
            "\"${cmsProps.getProperty("cms.password") ?: ""}\""
        )
        buildConfigField(
            "String",
            "BRAIN_BASE_URL",
            "\"${cmsProps.getProperty("brain.baseUrl") ?: "http://10.10.145.61:8440"}\""
        )
        buildConfigField(
            "String",
            "BRAIN_WEB_URL",
            "\"${cmsProps.getProperty("brain.webUrl") ?: ""}\""
        )
    }

    buildTypes {
        release {
            // Un APK publie ne doit pas etre debogable : `debuggable=true` ouvre
            // `adb run-as` et expose les SharedPreferences (dont le mot de passe
            // CMS). Le build de release de la CI a longtemps ete un `assembleDebug`
            // faute de config release : c'est corrige ici.
            isDebuggable = false
            // R8 retire le code mort et obfusque les identifiants.
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Un vrai keystore de release si fourni. Sinon `null` : la variante
            // release n'est pas signee (validation de CI), et jamais signee avec le
            // keystore de debug versionne, qui est public. Assigner la
            // signingConfig "release" vide ferait echouer :app:packageRelease
            // (« SigningConfig "release" is missing required property "storeFile" »).
            signingConfig = if (releaseSignable) signingConfigs.getByName("release") else null
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    // lifecycleScope, utilise par l'editeur pour obtenir la session avant de
    // charger la vue web.
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("com.google.android.gms:play-services-location:21.2.0")
    // play-services-base 18.3.0 / play-services-basement 18.3.0 tirent
    // androidx.fragment:fragment:1.1.0, sous le seuil 1.3.0 exigé par l'API
    // registerForActivityResult utilisee dans MainActivity. Or c'est un
    // controleur lint FATAL : assembleDebug passe, assembleRelease non. On force
    // donc une version courante (1.6.2, derniere compatible compileSdk 34 / AGP 8.4).
    implementation("androidx.fragment:fragment:1.6.2")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Montage video, sur le telephone.
    //
    // L'assemblage vivait cote serveur, dans une route qui appelait
    // fluent-ffmpeg : elle ne pouvait pas fonctionner, les fonctions Vercel
    // n'embarquant pas le binaire ffmpeg. Media3 Transformer s'appuie sur
    // MediaCodec, donc sur l'encodeur materiel du telephone - rien a embarquer,
    // contrairement a ffmpeg-kit, retire en 2025.
    //
    // Version 1.4.1 et non la derniere : a partir de 1.5, Media3 exige
    // compileSdk 36, que l'AGP 8.4 de ce projet ne sait pas viser. Monter toute
    // la chaine de build pour cette seule dependance serait disproportionne.
    implementation("androidx.media3:media3-transformer:1.4.1")
    implementation("androidx.media3:media3-effect:1.4.1")
    implementation("androidx.media3:media3-common:1.4.1")

    // Cerveau embarque : petit LLM sur le telephone (CerveauLocal.kt). Le modele
    // (.task) n'est pas dans l'APK, il est importe depuis l'application.
    // 0.10.29 et non 0.10.35 : meme API, mais l'AAR double de taille (~40 Mo).
    implementation("com.google.mediapipe:tasks-genai:0.10.29")

    testImplementation("junit:junit:4.13.2")
    // org.json est un stub vide dans les tests JVM Android : sans cette version
    // reelle, TimelineGoogle.analyser rendrait toujours une liste vide.
    testImplementation("org.json:json:20231013")
}
