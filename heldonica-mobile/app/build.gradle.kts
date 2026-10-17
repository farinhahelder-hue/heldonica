import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val cmsProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
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

        // Signature de release. Un vrai keystore si fourni — en CI par les
        // variables RELEASE_STORE_PASSWORD / RELEASE_KEY_ALIAS / RELEASE_KEY_PASSWORD,
        // en local par local.properties (release.*). Sinon repli sur le keystore de
        // debug versionne : la CI continue alors de produire un APK installable
        // par-dessus les precedents, sans secret supplementaire a configurer.
        // Le fichier attendu est keystore/heldonica-release.keystore (non versionne).
        create("release") {
            val cleRelease = rootProject.file("keystore/heldonica-release.keystore")
            val mdpStore = cmsProps.getProperty("release.storePassword")
                ?: System.getenv("RELEASE_STORE_PASSWORD")
            val alias = cmsProps.getProperty("release.keyAlias")
                ?: System.getenv("RELEASE_KEY_ALIAS")
                ?: "heldonica"
            val mdpCle = cmsProps.getProperty("release.keyPassword")
                ?: System.getenv("RELEASE_KEY_PASSWORD")
                ?: mdpStore
            if (cleRelease.exists() && !mdpStore.isNullOrBlank()) {
                storeFile = cleRelease
                storePassword = mdpStore
                keyAlias = alias
                keyPassword = mdpCle
            } else {
                val cle = rootProject.file("keystore/heldonica-debug.keystore")
                if (cle.exists()) {
                    storeFile = cle
                    storePassword = "heldonica"
                    keyAlias = "heldonica"
                    keyPassword = "heldonica"
                }
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
        // Numero de build de la CI : chaque APK produit est ainsi plus recent
        // que le precedent. Sans cela toutes les versions portent le meme
        // numero et Android ne les distingue pas.
        versionCode = maxOf(40, (System.getenv("GITHUB_RUN_NUMBER") ?: "40").toInt())
        versionName = "1.0." + (System.getenv("GITHUB_RUN_NUMBER") ?: "40")

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
            // Un vrai keystore de release si fourni, sinon le keystore de debug
            // versionne (mises a jour installables par-dessus les precedentes).
            signingConfig = signingConfigs.getByName("release")
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

    testImplementation("junit:junit:4.13.2")
}
