package fr.heldonica.mobile

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Client réseau pour le Cerveau Heldonica embarqué sur Poco X6 Pro.
 *
 * Principes (docs/SPEC_CERVEAU_APK_POCO_X6_PRO.md) :
 * 1. Zéro clé d'API dans l'APK : tous les appels passent par le proxy Cloud /api/ai/mobile-brain
 *    ou le pont local du PC quand la station de travail est allumée.
 * 2. Ordre des sources (voir ordreDesSources) :
 *    - IA du téléphone (défaut) : petit modèle embarqué (CerveauLocal), sans réseau.
 *    - Cloud 0€ : API gratuites, seulement si l'interrupteur « Cerveau boosté » est activé.
 *    - Station PC Locale : si le serveur Heldonica Brain (port 8440) répond sur le réseau local.
 */
data class MessageCerveau(
    val id: String = java.util.UUID.randomUUID().toString(),
    val estUtilisateur: Boolean,
    val texte: String,
    val dateMs: Long = System.currentTimeMillis(),
    val fournisseur: String? = null,
    val estErreur: Boolean = false
)

enum class SourceCerveau(val libelle: String, val badge: String) {
    CLOUD("Cloud 0€ (PC éteint)", "🟢 Cloud"),
    STATION_PC("Station PC (Local)", "💻 PC LAN"),
    HORS_LIGNE("Mémoire Embarquée", "📦 Local"),
    IA_TELEPHONE("IA du téléphone", "📱 Poco")
}

data class ReponseCerveau(
    val texte: String,
    val fournisseur: String,
    val modele: String,
    val source: SourceCerveau
)

object BrainClient {
    private const val TAG = "BrainClient"
    const val PREFS_AUTH = "heldonica_mobile_auth"
    const val PREF_KEY_CMS_PASSWORD = "cms_password"
    const val PREF_KEY_CERVEAU_BOOSTE = "cerveau_booste"
    const val PREF_KEY_CERVEAU_LIBRE = "cerveau_libre"

    fun estBooste(context: android.content.Context): Boolean =
        context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
            .getBoolean(PREF_KEY_CERVEAU_BOOSTE, false)

    fun definirBooste(context: android.content.Context, booste: Boolean) {
        context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
            .edit().putBoolean(PREF_KEY_CERVEAU_BOOSTE, booste).apply()
    }

    /** Mode libre : uniquement le modèle du téléphone, sans cadre de marque. */
    fun estLibre(context: android.content.Context): Boolean =
        context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
            .getBoolean(PREF_KEY_CERVEAU_LIBRE, false)

    fun definirLibre(context: android.content.Context, libre: Boolean) {
        context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
            .edit().putBoolean(PREF_KEY_CERVEAU_LIBRE, libre).apply()
    }

    /**
     * Sources à essayer, dans l'ordre. Sans boost, le Cloud n'est JAMAIS
     * appelé : le téléphone répond, et le PC (gratuit lui aussi) sert de repli.
     */
    fun ordreDesSources(
        booste: Boolean,
        forcerStationPc: Boolean,
        iaLocaleDisponible: Boolean
    ): List<SourceCerveau> {
        val ordre = mutableListOf<SourceCerveau>()
        if (forcerStationPc) ordre.add(SourceCerveau.STATION_PC)
        if (booste) ordre.add(SourceCerveau.CLOUD)
        if (iaLocaleDisponible && !booste) ordre.add(SourceCerveau.IA_TELEPHONE)
        ordre.add(SourceCerveau.STATION_PC)
        if (iaLocaleDisponible && booste) ordre.add(SourceCerveau.IA_TELEPHONE)
        return ordre.distinct()
    }

    /**
     * Récupère le mot de passe CMS :
     * 1. Priorité aux SharedPreferences de l'application (configuré par l'utilisateur sur le téléphone).
     * 2. Repli sur BuildConfig.CMS_PASSWORD (si build développeur local avec local.properties).
     */
    fun obtenirMotDePasse(context: android.content.Context): String {
        val prefs = context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
        val stocke = prefs.getString(PREF_KEY_CMS_PASSWORD, null)
        if (!stocke.isNullOrBlank()) return stocke
        return BuildConfig.CMS_PASSWORD
    }

    /**
     * Enregistre le mot de passe CMS dans le stockage privé de l'application.
     */
    fun sauvegarderMotDePasse(context: android.content.Context, mdp: String) {
        val prefs = context.getSharedPreferences(PREFS_AUTH, android.content.Context.MODE_PRIVATE)
        prefs.edit().putString(PREF_KEY_CMS_PASSWORD, mdp.trim()).apply()
    }

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Teste rapidement (timeout 1.5s) si la station PC locale (port 8440) est allumée et joignable
     * soit via l'URL configurée (LAN Wi-Fi), soit via 127.0.0.1:8440 (câble USB avec adb reverse).
     */
    suspend fun verifierStationPcDisponible(baseUrlPc: String): Boolean = withContext(Dispatchers.IO) {
        val urlsATester = mutableListOf<String>()
        val url = baseUrlPc.trim().trimEnd('/')
        if (url.isNotBlank() && (url.startsWith("http://") || url.startsWith("https://"))) {
            urlsATester.add(url)
        }
        if (!url.contains("127.0.0.1")) {
            urlsATester.add("http://127.0.0.1:8440")
        }

        val pingClient = httpClient.newBuilder()
            .connectTimeout(1500, TimeUnit.MILLISECONDS)
            .readTimeout(1500, TimeUnit.MILLISECONDS)
            .build()

        for (u in urlsATester) {
            try {
                val req = Request.Builder()
                    .url("$u/api/system/status")
                    .get()
                    .build()
                val ok = pingClient.newCall(req).execute().use { it.isSuccessful }
                if (ok) return@withContext true
            } catch (e: Exception) {
                // Essayer l'adresse suivante
            }
        }
        false
    }

    /**
     * Envoie une invite au Cerveau, en suivant ordreDesSources.
     * [repondreLocalement] est le modèle embarqué (null s'il n'est pas installé) :
     * passé en paramètre pour que ce client reste sans dépendance au modèle.
     */
    suspend fun interrogerCerveau(
        cmsBaseUrl: String,
        brainBaseUrl: String,
        message: String,
        mode: String = "chat",
        historique: List<MessageCerveau> = emptyList(),
        forcerStationPc: Boolean = false,
        authSecret: String = BuildConfig.CMS_PASSWORD,
        booste: Boolean = true,
        repondreLocalement: (suspend () -> ReponseCerveau)? = null
    ): ReponseCerveau = withContext(Dispatchers.IO) {
        var derniereErreur: String? = null
        for (source in ordreDesSources(booste, forcerStationPc, repondreLocalement != null)) {
            when (source) {
                SourceCerveau.CLOUD -> try {
                    val repCloud = appelerCloud(cmsBaseUrl, message, mode, historique, authSecret)
                    if (repCloud != null) return@withContext repCloud
                } catch (e: Exception) {
                    derniereErreur = e.message
                    Log.w(TAG, "Échec Cloud, source suivante : ${e.message}")
                }
                SourceCerveau.STATION_PC -> {
                    // Wi-Fi ou USB ADB reverse
                    val repPc = appelerStationPcAvecFallback(brainBaseUrl, message, mode)
                    if (repPc != null) return@withContext repPc
                }
                SourceCerveau.IA_TELEPHONE -> try {
                    return@withContext repondreLocalement!!.invoke()
                } catch (e: Exception) {
                    derniereErreur = e.message
                    Log.w(TAG, "Échec du modèle embarqué : ${e.message}")
                }
                SourceCerveau.HORS_LIGNE -> Unit
            }
        }

        throw IOException(
            when {
                !booste && repondreLocalement == null ->
                    "Aucun modèle sur le téléphone (et PC éteint). Touche « Télécharger » au-dessus (1,6 Go, une seule fois) ou active ⚡ Cerveau boosté."
                !booste ->
                    "Le modèle du téléphone a échoué (${derniereErreur ?: "erreur inconnue"}). Active ⚡ Cerveau boosté pour passer par les API gratuites."
                else ->
                    "Impossible de joindre le Cerveau (Cloud 0€, Station PC et téléphone). ${derniereErreur ?: "Vérifie ta connexion."}"
            }
        )
    }

    private fun appelerCloud(
        cmsBaseUrl: String,
        message: String,
        mode: String,
        historique: List<MessageCerveau>,
        authSecret: String = BuildConfig.CMS_PASSWORD
    ): ReponseCerveau? {
        val urlPropre = cmsBaseUrl.trim().trimEnd('/')
        val endpoint = "$urlPropre/api/ai/mobile-brain"

        val payload = JSONObject().apply {
            put("message", message)
            put("mode", mode)
            val histArray = JSONArray()
            historique.takeLast(6).forEach { m ->
                histArray.put(JSONObject().apply {
                    put("role", if (m.estUtilisateur) "user" else "assistant")
                    put("content", m.texte)
                })
            }
            put("history", histArray)
        }

        val requestBuilder = Request.Builder()
            .url(endpoint)
            .addHeader("x-heldonica-client", "mobile-poco-x6pro")

        if (authSecret.isNotBlank()) {
            requestBuilder.addHeader("x-cms-auth", authSecret)
        }

        val request = requestBuilder
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        httpClient.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                val err = runCatching { JSONObject(body).optString("error") }.getOrNull() ?: body
                throw IOException("HTTP ${response.code} ($endpoint) : $err")
            }
            val json = JSONObject(body)
            val texte = json.optString("reply")
            val fournisseur = json.optString("provider", "cloud")
            val modele = json.optString("model", "cloud-llm")
            return ReponseCerveau(
                texte = texte,
                fournisseur = fournisseur,
                modele = modele,
                source = SourceCerveau.CLOUD
            )
        }
    }

    private fun appelerStationPcAvecFallback(
        brainBaseUrl: String,
        message: String,
        mode: String
    ): ReponseCerveau? {
        // 1. Tente l'URL configurée (LAN Wi-Fi)
        val repConfig = appelerStationPc(brainBaseUrl, message, mode)
        if (repConfig != null) return repConfig

        // 2. Tente le tunnel local USB (ADB reverse tcp:8440 tcp:8440) si l'URL configurée différait
        if (!brainBaseUrl.contains("127.0.0.1")) {
            val repUsb = appelerStationPc("http://127.0.0.1:8440", message, mode)
            if (repUsb != null) return repUsb
        }
        return null
    }

    private fun appelerStationPc(
        brainBaseUrl: String,
        message: String,
        mode: String
    ): ReponseCerveau? {
        val url = brainBaseUrl.trim().trimEnd('/')
        if (url.isBlank()) return null
        val endpoint = "$url/api/chat"

        val payload = JSONObject().apply {
            put("message", message)
            put("mode", mode)
            put("session_id", "mobile-poco")
            put("use_vault", true)
        }

        try {
            val req = Request.Builder()
                .url(endpoint)
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            httpClient.newCall(req).execute().use { response ->
                if (!response.isSuccessful) return null
                val body = response.body?.string().orEmpty()
                val json = JSONObject(body)
                val texte = json.optString("reply", json.optString("response", body))
                return ReponseCerveau(
                    texte = texte,
                    fournisseur = "station_pc",
                    modele = json.optString("model", "pc-local"),
                    source = SourceCerveau.STATION_PC
                )
            }
        } catch (e: Exception) {
            Log.d(TAG, "Station PC inaccessible : ${e.message}")
            return null
        }
    }
}
