package fr.heldonica.mobile

import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.exifinterface.media.ExifInterface
import androidx.work.*
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * Heldonica Mobile — 0€ : Photo Picker + EXIF + Nominatim + POST /api/cms/mobile-publish
 * Aucun Google Places/MAPS payant. OSM Nominatim gratuit (1 req/s, cache).
 */
class MainActivity : ComponentActivity() {

    private var pickedUris by mutableStateOf<List<Uri>>(emptyList())
    private var placeTitle by mutableStateOf("")
    private var placeAddress by mutableStateOf("")
    private var placeLat by mutableStateOf<Double?>(null)
    private var placeLng by mutableStateOf<Double?>(null)
    private var caption by mutableStateOf("")
    private var mode by mutableStateOf("both") // both | manuel | auto
    private var isCarousel by mutableStateOf(false)
    private var status by mutableStateOf("Prêt — choisis 1 à 10 photos/vidéos")

    private val picker = registerForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(10)) { uris ->
        if (uris.isNotEmpty()) {
            pickedUris = uris
            // Lit EXIF du premier pour auto-remplir lieu
            uris.firstOrNull()?.let { uri -> readExifAndReverseGeocode(uri) }
            status = "${uris.size} photo(s) sélectionnée(s)"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { HeldonicaScreen() }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun HeldonicaScreen() {
        val scope = rememberCoroutineScope()
        MaterialTheme {
            Scaffold(topBar = { TopAppBar(title = { Text("Heldonica Mobile — 0€") }) }) { pad ->
                Column(Modifier.padding(pad).padding(16.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) }) {
                        Text("Choisir photos/vidéos (Picker système)")
                    }
                    Text(status, style = MaterialTheme.typography.bodySmall)
                    if (pickedUris.isNotEmpty()) Text("${pickedUris.size} média(s) prêts", color = MaterialTheme.colorScheme.primary)

                    OutlinedTextField(value = placeTitle, onValueChange = { placeTitle = it }, label = { Text("Lieu — ex: Gârda de Sus") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = placeAddress, onValueChange = { placeAddress = it }, label = { Text("Adresse (auto via OSM)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = caption, onValueChange = { caption = it }, label = { Text("Note [À TOI] — ressenti, prix") }, modifier = Modifier.fillMaxWidth(), minLines = 3)

                    // Mode auto/manuel/both
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("manuel" to "Manuel [À TOI]", "auto" to "Auto IA", "both" to "Both").forEach { (v, label) ->
                            FilterChip(selected = mode == v, onClick = { mode = v }, label = { Text(label, style = MaterialTheme.typography.labelSmall) })
                        }
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Checkbox(checked = isCarousel, onCheckedChange = { isCarousel = it })
                        Text("Carrousel (2-10) — sinon image/vidéo simple", style = MaterialTheme.typography.bodySmall)
                    }
                    if (pickedUris.size > 1) LaunchedEffect(pickedUris.size) { isCarousel = true }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = {
                            scope.launch { useLiveLocationAsFallback() }
                        }) { Text("GPS live") }
                        OutlinedButton(onClick = {
                            scope.launch { reverseGeocodeNominatim() }
                        }) { Text("Adresse OSM") }
                    }

                    Button(
                        enabled = pickedUris.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            enqueueUpload(publishInstagram = false)
                            status = "Upload en file d'attente (WorkManager) — mode $mode, carrousel=$isCarousel..."
                        }
                    ) { Text("Créer brouillon Heldonica (${mode})") }

                    Button(
                        enabled = pickedUris.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        onClick = {
                            enqueueUpload(publishInstagram = true)
                            status = "Brouillon + brouillon Instagram en file — mode $mode..."
                        }
                    ) { Text("Brouillon + Instagram (draft, ${mode})") }

                    Text("Règle: published:false toujours. Valide dans /panel-manager avant publication.", style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }

    private fun readExifAndReverseGeocode(uri: Uri) {
        try {
            contentResolver.openInputStream(uri)?.use { input ->
                val exif = ExifInterface(input)
                val latLong = exif.latLong
                val date = exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL)
                if (latLong != null) {
                    placeLat = latLong[0]; placeLng = latLong[1]
                    // Nominatim gratuit
                    kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                        reverseGeocodeNominatim()
                    }
                }
                if (date != null) status = "EXIF: $date @ ${latLong?.joinToString() ?: "GPS manquant"}"
            }
        } catch (_: Exception) {}
    }

    private suspend fun reverseGeocodeNominatim() {
        val lat = placeLat ?: return
        val lng = placeLng ?: return
        try {
            val client = OkHttpClient()
            val req = Request.Builder()
                .url("https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=jsonv2&zoom=14&accept-language=fr")
                .header("User-Agent", "Heldonica Mobile (contact@heldonica.fr)")
                .build()
            val resp = client.newCall(req).execute()
            val body = resp.body?.string() ?: return
            // parse minimal : display_name
            val name = Regex("\"display_name\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1)
            if (name != null) {
                placeAddress = name
                if (placeTitle.isBlank()) {
                    // village/town
                    val village = Regex("\"village\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1)
                        ?: Regex("\"town\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1)
                    if (village != null) placeTitle = village
                }
            }
            kotlinx.coroutines.delay(1100) // respect 1 req/s
        } catch (_: Exception) {}
    }

    private suspend fun useLiveLocationAsFallback() {
        try {
            val fused = LocationServices.getFusedLocationProviderClient(this)
            // permission déjà demandée via manifest, request si besoin
            fused.lastLocation.addOnSuccessListener { loc ->
                if (loc != null) { placeLat = loc.latitude; placeLng = loc.longitude }
            }
        } catch (_: Exception) {}
    }

    private fun enqueueUpload(publishInstagram: Boolean) {
        val urisStr = pickedUris.joinToString(",") { it.toString() }
        val isVideo = pickedUris.any { applicationContext.contentResolver.getType(it)?.startsWith("video") == true }
        val data = workDataOf(
            "uris" to urisStr,
            "placeTitle" to placeTitle,
            "placeAddress" to placeAddress,
            "placeLat" to (placeLat?.toString() ?: ""),
            "placeLng" to (placeLng?.toString() ?: ""),
            "caption" to caption,
            "publishInstagram" to publishInstagram,
            "isCarousel" to isCarousel,
            "isVideo" to isVideo,
            "mode" to mode,
            "autoCaption" to (mode != "manuel"),
            // Valeurs issues de local.properties via BuildConfig, plutôt
            // qu'écrites en dur : le mot de passe précédent était celui du repli
            // public, retiré du code serveur — l'envoi échouait en 401.
            "baseUrl" to BuildConfig.CMS_BASE_URL,
            "cmsPassword" to BuildConfig.CMS_PASSWORD
        )
        val req = OneTimeWorkRequestBuilder<UploadWorker>()
            .setInputData(data)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
            .build()

        val wm = WorkManager.getInstance(this)
        wm.enqueue(req)
        status = "Envoi en cours…"

        // L'envoi se faisait en aveugle : le travail partait en arriere-plan et
        // rien ne revenait a l'ecran, qu'il reussisse, echoue ou boucle. On
        // suit son etat pour dire ce qui se passe.
        wm.getWorkInfoByIdLiveData(req.id).observe(this) { info ->
            status = when (info?.state) {
                WorkInfo.State.SUCCEEDED -> "Brouillon cree sur le site"
                WorkInfo.State.FAILED ->
                    info.outputData.getString(UploadWorker.ERREUR) ?: "Envoi impossible"
                WorkInfo.State.RUNNING -> "Envoi en cours…"
                WorkInfo.State.ENQUEUED -> "En attente du reseau…"
                else -> status
            }
        }
    }
}

class UploadWorker(ctx: android.content.Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {

    companion object {
        const val TAG = "Heldonica"
        const val ERREUR = "erreur"

        /** Extrait le champ `error` de la reponse JSON, sinon renvoie le brut tronque. */
        fun messageLisible(corps: String): String {
            val m = Regex("\"error\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"").find(corps)
            return m?.groupValues?.get(1)?.replace("\\\"", "\"")
                ?: corps.take(140).ifBlank { "reponse vide" }
        }
    }

    override suspend fun doWork(): Result {
        val urisStr = inputData.getString("uris") ?: return Result.failure()
        val uris = urisStr.split(",").mapNotNull { runCatching { Uri.parse(it) }.getOrNull() }
        val baseUrl = inputData.getString("baseUrl") ?: "https://www.heldonica.fr"
        val password = inputData.getString("cmsPassword") ?: ""
        val placeTitle = inputData.getString("placeTitle") ?: ""
        val placeAddress = inputData.getString("placeAddress") ?: ""
        val placeLat = inputData.getString("placeLat") ?: ""
        val placeLng = inputData.getString("placeLng") ?: ""
        val caption = inputData.getString("caption") ?: ""
        val publishInstagram = inputData.getBoolean("publishInstagram", false)
        val isCarousel = inputData.getBoolean("isCarousel", false)
        val isVideo = inputData.getBoolean("isVideo", false)
        val mode = inputData.getString("mode") ?: "both"
        val autoCaption = inputData.getBoolean("autoCaption", false)

        return try {
            val client = OkHttpClient.Builder().callTimeout(300, TimeUnit.SECONDS).build()

            // Les octets ne passent plus par l'API : les fonctions Vercel
            // plafonnent la requete a 4,5 Mo, et une photo de telephone la
            // depasse souvent — le serveur repondait FUNCTION_PAYLOAD_TOO_LARGE
            // avant meme d'executer la moindre ligne. On demande des URL
            // signees, on depose les fichiers directement dans le stockage,
            // puis on n'envoie a l'API que leur description.
            val deposes = televerserDirect(client, baseUrl, password, uris)
                ?: return Result.failure(workDataOf(ERREUR to "Preparation du televersement impossible"))

            if (deposes.isEmpty()) {
                return Result.failure(workDataOf(ERREUR to "Aucun media n'a pu etre televerse"))
            }

            val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
            builder.addFormDataPart("uploaded", deposes.toString())
            builder.addFormDataPart("place_title", placeTitle)
            builder.addFormDataPart("place_address", placeAddress)
            builder.addFormDataPart("place_lat", placeLat)
            builder.addFormDataPart("place_lng", placeLng)
            builder.addFormDataPart("caption", caption)
            builder.addFormDataPart("publish_instagram", if (publishInstagram) "1" else "0")
            builder.addFormDataPart("is_carousel", if (isCarousel) "1" else "0")
            builder.addFormDataPart("auto_caption", if (autoCaption) "1" else "0")
            builder.addFormDataPart("mode", mode)

            val req = Request.Builder()
                .url("$baseUrl/api/cms/mobile-publish")
                .header("x-cms-auth", password)
                .post(builder.build())
                .build()
            val resp = client.newCall(req).execute()
            val corps = resp.body?.string().orEmpty()

            when {
                resp.isSuccessful -> {
                    Log.i(TAG, "Envoi reussi (${uris.size} media)")
                    Result.success()
                }

                // 401, 400, 413… : reessayer ne changera rien. Un mot de passe
                // faux ou un fichier trop lourd le resteront a la tentative
                // suivante. On rend la main avec le message du serveur, qui
                // explique la cause — il etait jusqu'ici lu puis jete.
                resp.code in 400..499 -> {
                    Log.e(TAG, "Refus du serveur ${resp.code} : $corps")
                    Result.failure(workDataOf(ERREUR to "Erreur ${resp.code} : ${messageLisible(corps)}"))
                }

                // 5xx : panne passagere, la nouvelle tentative a du sens.
                else -> {
                    Log.w(TAG, "Erreur serveur ${resp.code}, nouvelle tentative : $corps")
                    Result.retry()
                }
            }
        } catch (e: Exception) {
            // Tout echec devenait un retry silencieux : reseau coupe, mot de
            // passe refuse ou plantage donnaient le meme resultat invisible,
            // et l'envoi bouclait indefiniment en arriere-plan sans que rien
            // ne l'indique a l'ecran.
            Log.e(TAG, "Echec de l'envoi", e)
            if (runAttemptCount >= 3) {
                Result.failure(workDataOf(ERREUR to "Envoi impossible : ${e.message ?: "reseau indisponible"}"))
            } else {
                Result.retry()
            }
        }
    }

    /**
     * Demande une URL signee par fichier, y depose les octets, et renvoie la
     * description des medias deposes — celle que l'API attend dans `uploaded`.
     *
     * Le GPS et la date de prise de vue sont lus ici, dans le fichier : le
     * serveur ne voyant plus passer les octets, il ne peut plus les extraire.
     * Ce sont eux qui alimentent le registre de preuves.
     */
    private fun televerserDirect(
        client: OkHttpClient,
        baseUrl: String,
        password: String,
        uris: List<Uri>
    ): org.json.JSONArray? {
        val noms = org.json.JSONArray()
        val temporaires = mutableListOf<Pair<Uri, File>>()

        for (uri in uris) {
            val tmp = copyUriToTemp(uri) ?: continue
            temporaires += uri to tmp
            noms.put(tmp.name)
        }
        if (temporaires.isEmpty()) return null

        val demande = Request.Builder()
            .url("$baseUrl/api/cms/mobile-publish/upload-url")
            .header("x-cms-auth", password)
            .post(
                org.json.JSONObject().put("fichiers", noms).toString()
                    .toRequestBody("application/json".toMediaType())
            )
            .build()

        val cibles = client.newCall(demande).execute().use { r ->
            if (!r.isSuccessful) {
                Log.e(TAG, "URL signees refusees ${r.code} : ${r.body?.string()}")
                return null
            }
            org.json.JSONObject(r.body?.string().orEmpty()).getJSONArray("cibles")
        }

        val deposes = org.json.JSONArray()

        for (i in 0 until minOf(cibles.length(), temporaires.size)) {
            val cible = cibles.getJSONObject(i)
            val (uri, fichier) = temporaires[i]
            val mime = applicationContext.contentResolver.getType(uri) ?: "image/jpeg"

            val envoi = Request.Builder()
                .url(cible.getString("signedUrl"))
                .put(fichier.asRequestBody(mime.toMediaType()))
                .build()

            client.newCall(envoi).execute().use { r ->
                if (!r.isSuccessful) {
                    Log.e(TAG, "Depot direct refuse ${r.code} pour ${fichier.name}")
                    return@use
                }

                val exif = runCatching { ExifInterface(fichier.absolutePath) }.getOrNull()
                val coord = FloatArray(2)
                val aGps = exif?.getLatLong(coord) == true

                deposes.put(
                    org.json.JSONObject()
                        .put("nom", cible.getString("nom"))
                        .put("chemin", cible.getString("chemin"))
                        .put("url", cible.getString("url"))
                        .put("mime", mime)
                        .put("taille", fichier.length())
                        .put("lat", if (aGps) coord[0].toDouble() else org.json.JSONObject.NULL)
                        .put("lng", if (aGps) coord[1].toDouble() else org.json.JSONObject.NULL)
                        .put("priseDeVue", isoPriseDeVue(exif) ?: org.json.JSONObject.NULL)
                )
            }
        }

        temporaires.forEach { (_, f) -> f.delete() }
        return deposes
    }

    /** Date de prise de vue EXIF, au format ISO attendu par la base. */
    private fun isoPriseDeVue(exif: ExifInterface?): String? {
        val brut = exif?.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL)
            ?: exif?.getAttribute(ExifInterface.TAG_DATETIME)
            ?: return null
        // L'EXIF s'ecrit "2026:08:28 09:14:00" : ni la date ni l'heure ne sont
        // au format ISO, d'ou la reecriture plutot qu'un simple remplacement.
        return runCatching {
            val (d, h) = brut.split(" ")
            "${d.replace(':', '-')}T$h"
        }.getOrNull()
    }

    private fun copyUriToTemp(uri: Uri): File? {
        return try {
            val input = applicationContext.contentResolver.openInputStream(uri) ?: return null
            val tmp = File.createTempFile("heldonica_", ".jpg", applicationContext.cacheDir)
            tmp.outputStream().use { out -> input.copyTo(out) }
            tmp
        } catch (_: Exception) { null }
    }
}
