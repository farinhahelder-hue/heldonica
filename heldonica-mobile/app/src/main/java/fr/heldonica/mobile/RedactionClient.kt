package fr.heldonica.mobile

import android.content.Context
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

data class Brouillon(val id: String, val titre: String, val contenu: String) {
    val lacunes: Int get() = RedactionBrouillon.nombreDeLacunes(contenu)
}

/** Ce que l'IA propose, et ce qu'elle a ajouté que les notes ne disaient pas. */
data class PropositionIa(val contenu: String, val ajoutsNonSources: List<String>)

/**
 * Réseau de l'écran Rédaction. Passe par les routes CMS existantes avec le mot
 * de passe saisi sur le téléphone (aucun secret compilé). Rien ici ne publie :
 * l'enregistrement n'envoie que `content`, l'article reste dans son statut.
 */
object RedactionClient {
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS) // la rédaction IA peut durer
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val json = "application/json; charset=utf-8".toMediaType()

    private fun base() = BuildConfig.CMS_BASE_URL.trimEnd('/')

    private fun mdp(context: Context): String =
        BrainClient.obtenirMotDePasse(context).also {
            if (it.isBlank()) throw IllegalStateException("Mot de passe CMS non configuré (icône 🔑 de l'onglet Cerveau).")
        }

    private fun erreur(corps: String, code: Int): String =
        runCatching { JSONObject(corps).optString("error") }.getOrNull()?.takeIf { it.isNotBlank() }
            ?: "HTTP $code"

    suspend fun listerBrouillons(context: Context): Result<List<Brouillon>> = withContext(Dispatchers.IO) {
        runCatching {
            val req = Request.Builder()
                .url("${base()}/api/cms/articles?status=draft&limit=50")
                .header("x-cms-auth", mdp(context)).get().build()
            http.newCall(req).execute().use { r ->
                val corps = r.body?.string().orEmpty()
                if (!r.isSuccessful) throw Exception(erreur(corps, r.code))
                val arr = JSONObject(corps).optJSONArray("articles") ?: JSONArray()
                (0 until arr.length()).map { arr.getJSONObject(it) }.map {
                    Brouillon(it.optString("id"), it.optString("title"), it.optString("content"))
                }
            }
        }
    }

    suspend fun completer(
        context: Context,
        contenu: String,
        notes: String,
        lieux: List<String>
    ): Result<PropositionIa> = withContext(Dispatchers.IO) {
        runCatching {
            val corps = JSONObject()
                .put("action", "fill_gaps")
                .put("audience", "b2c")
                .put("text", notes)
                .put("context", JSONObject().put("brouillon", contenu).put("lieux", JSONArray(lieux)))
            val req = Request.Builder().url("${base()}/api/cms/ai-assist")
                .header("x-cms-auth", mdp(context))
                .post(corps.toString().toRequestBody(json)).build()
            http.newCall(req).execute().use { r ->
                val reponse = r.body?.string().orEmpty()
                if (!r.isSuccessful) throw Exception(erreur(reponse, r.code))
                val o = JSONObject(reponse)
                val ajouts = o.optJSONArray("ajouts_non_sources") ?: JSONArray()
                PropositionIa(
                    contenu = o.optString("data").trim()
                        .removePrefix("```html").removePrefix("```").removeSuffix("```").trim(),
                    ajoutsNonSources = (0 until ajouts.length()).map { ajouts.getString(it) }
                )
            }
        }
    }

    suspend fun enregistrer(context: Context, id: String, contenu: String): Result<Unit> =
        withContext(Dispatchers.IO) {
            runCatching {
                val req = Request.Builder().url("${base()}/api/cms/articles/$id")
                    .header("x-cms-auth", mdp(context))
                    .put(JSONObject().put("content", contenu).toString().toRequestBody(json)).build()
                http.newCall(req).execute().use { r ->
                    if (!r.isSuccessful) throw Exception(erreur(r.body?.string().orEmpty(), r.code))
                }
            }
        }

    /** Dépose les photos dans le stockage (URL signées) et rend leurs URL publiques, dans l'ordre. */
    suspend fun televerser(context: Context, uris: List<Uri>): Result<List<String>> =
        withContext(Dispatchers.IO) {
            val temporaires = mutableListOf<File>()
            runCatching {
                for (uri in uris) {
                    val tmp = File.createTempFile("redaction_", ".jpg", context.cacheDir)
                    context.contentResolver.openInputStream(uri)?.use { it.copyTo(tmp.outputStream()) }
                        ?: throw Exception("Photo illisible")
                    temporaires += tmp
                }
                val noms = JSONArray(temporaires.map { it.name })
                val demande = Request.Builder().url("${base()}/api/cms/mobile-publish/upload-url")
                    .header("x-cms-auth", mdp(context))
                    .post(JSONObject().put("fichiers", noms).put("dossier", "redaction").toString().toRequestBody(json))
                    .build()
                val cibles = http.newCall(demande).execute().use { r ->
                    val corps = r.body?.string().orEmpty()
                    if (!r.isSuccessful) throw Exception(erreur(corps, r.code))
                    JSONObject(corps).getJSONArray("cibles")
                }
                temporaires.mapIndexed { i, fichier ->
                    val cible = cibles.getJSONObject(i)
                    val envoi = Request.Builder().url(cible.getString("signedUrl"))
                        .put(fichier.asRequestBody("image/jpeg".toMediaType())).build()
                    http.newCall(envoi).execute().use { r ->
                        if (!r.isSuccessful) throw Exception("Dépôt refusé (HTTP ${r.code})")
                    }
                    cible.getString("url")
                }
            }.also { temporaires.forEach { runCatching { it.delete() } } }
        }

    /** Date de prise de vue EXIF (« 2026:08:28 09:14:00 »), ou null. */
    fun dateExif(context: Context, uri: Uri): String? = runCatching {
        context.contentResolver.openInputStream(uri)?.use {
            val exif = ExifInterface(it)
            exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL) ?: exif.getAttribute(ExifInterface.TAG_DATETIME)
        }
    }.getOrNull()

    /** Commune d'une coordonnée, via Nominatim (gratuit, 1 requête/s). Null si introuvable. */
    suspend fun nomDuLieu(lat: Double, lng: Double): String? = withContext(Dispatchers.IO) {
        runCatching {
            val req = Request.Builder()
                .url("https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=jsonv2&zoom=14&accept-language=fr")
                .header("User-Agent", "Heldonica Mobile (contact@heldonica.fr)").build()
            http.newCall(req).execute().use { r ->
                if (!r.isSuccessful) return@use null
                val adresse = JSONObject(r.body?.string().orEmpty()).optJSONObject("address") ?: return@use null
                listOf("village", "town", "city", "municipality", "county")
                    .firstNotNullOfOrNull { adresse.optString(it).takeIf { v -> v.isNotBlank() } }
            }
        }.getOrNull()
    }
}
