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
 * 2. Détection intelligente de la source disponible :
 *    - Cloud 0€ (défaut) : fonctionne en 4G/5G/Wi-Fi même si le PC est éteint.
 *    - Station PC Locale (optionnel) : si le serveur Heldonica Brain (port 8440) répond sur le réseau local.
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
    HORS_LIGNE("Mémoire Embarquée", "📦 Local")
}

data class ReponseCerveau(
    val texte: String,
    val fournisseur: String,
    val modele: String,
    val source: SourceCerveau
)

object BrainClient {
    private const val TAG = "BrainClient"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Teste rapidement (timeout 1.5s) si la station PC locale (port 8440) est allumée et joignable sur le LAN.
     */
    suspend fun verifierStationPcDisponible(baseUrlPc: String): Boolean = withContext(Dispatchers.IO) {
        val url = baseUrlPc.trim().trimEnd('/')
        if (url.isBlank() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            return@withContext false
        }
        val pingClient = httpClient.newBuilder()
            .connectTimeout(1500, TimeUnit.MILLISECONDS)
            .readTimeout(1500, TimeUnit.MILLISECONDS)
            .build()
        try {
            val req = Request.Builder()
                .url("$url/api/system/status")
                .get()
                .build()
            pingClient.newCall(req).execute().use { it.isSuccessful }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Envoie une invite au Cerveau (priorité au Cloud 0€ sécurisé, avec repli PC si configuré).
     */
    suspend fun interrogerCerveau(
        cmsBaseUrl: String,
        brainBaseUrl: String,
        message: String,
        mode: String = "chat",
        historique: List<MessageCerveau> = emptyList(),
        forcerStationPc: Boolean = false,
        authSecret: String = BuildConfig.CMS_PASSWORD
    ): ReponseCerveau = withContext(Dispatchers.IO) {
        if (forcerStationPc) {
            val reponsePc = appelerStationPc(brainBaseUrl, message, mode)
            if (reponsePc != null) return@withContext reponsePc
        }

        // 1. Appel prioritaire : Cloud 0€ (Next.js /api/ai/mobile-brain)
        try {
            val repCloud = appelerCloud(cmsBaseUrl, message, mode, historique, authSecret)
            if (repCloud != null) return@withContext repCloud
        } catch (e: Exception) {
            Log.w(TAG, "Échec Cloud, tentative de repli vers la station PC : ${e.message}")
        }

        // 2. Repli : Station PC locale si le Cloud est injoignable
        val repPc = appelerStationPc(brainBaseUrl, message, mode)
        if (repPc != null) return@withContext repPc

        throw IOException("Impossible de joindre le Cerveau (Cloud 0€ et Station PC injoignables). Vérifie ta connexion.")
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
            requestBuilder.addHeader("x-api-key", authSecret)
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
