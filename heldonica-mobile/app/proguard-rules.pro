# ============================================================
# Regles R8 / ProGuard — build release de Heldonica Mobile.
#
# Le build release active `isMinifyEnabled` + `isShrinkResources`. Ces regles
# couvrent ce que R8 ne peut pas deviner (reflexion, instanciation par nom).
# Les bibliotheques Media3, OkHttp, Compose et WorkManager fournissent leurs
# propres regles (fichiers `consumer-rules` des AAR) : rien a declarer pour elles.
# ============================================================

# --- WorkManager -----------------------------------------------------------
# WorkManager instancie les workers et les reconstruit depuis leur NAME, stocke
# en base SQLite. Si R8 renomme la classe, la veille periodique casse apres une
# mise a jour (le nom enregistre ne correspond plus a aucune classe).
# La release-apk verifie aussi la presence du nom dans le dex.
-keep class fr.heldonica.mobile.VeilleTachesWorker { *; }
-keep class * extends androidx.work.ListenableWorker { *; }

# --- Kotlin ----------------------------------------------------------------
-keep class kotlin.Metadata { *; }

# --- Avertissements toleres (classes optionnelles non embarquees) ----------
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn org.slf4j.**
-dontwarn javax.annotation.**
-dontwarn kotlin.**
-dontwarn kotlinx.**
