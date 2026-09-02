import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// local.properties porte l'URL et le mot de passe du CMS, et reste hors du
// depot. Rien ne le lisait : l'application embarquait un mot de passe ecrit en
// dur dans MainActivity, avec la mention « a mettre dans local.properties en
// prod ». Ce mot de passe etait celui du repli public, retire depuis du code
// serveur — l'application n'aurait donc plus pu s'authentifier.
val cmsProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "fr.heldonica.mobile"
    compileSdk = 34
    buildFeatures { buildConfig = true }
    defaultConfig {
        applicationId = "fr.heldonica.mobile"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0-oss"

        buildConfigField(
            "String",
            "CMS_BASE_URL",
            "\"${cmsProps.getProperty("cms.baseUrl") ?: "https://www.heldonica.fr"}\""
        )
        // Valeur vide par defaut plutot qu'un mot de passe de secours : une
        // authentification qui echoue franchement vaut mieux qu'un identifiant
        // publie dans un depot ouvert.
        buildConfigField(
            "String",
            "CMS_PASSWORD",
            "\"${cmsProps.getProperty("cms.password") ?: ""}\""
        )
    }
    buildTypes {
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("com.google.android.gms:play-services-location:21.2.0")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    // OSM : pas de SDK Google, on affiche via MapLibre ou simple TextView adresse
}
