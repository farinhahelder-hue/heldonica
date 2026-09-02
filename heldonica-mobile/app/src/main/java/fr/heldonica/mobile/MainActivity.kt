package fr.heldonica.mobile

import android.net.Uri
import android.os.Bundle
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
            "baseUrl" to "https://www.heldonica.fr",
            "cmsPassword" to "heldonica2026" // à mettre dans local.properties en prod
        )
        val req = OneTimeWorkRequestBuilder<UploadWorker>()
            .setInputData(data)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
            .build()
        WorkManager.getInstance(this).enqueue(req)
    }
}

class UploadWorker(ctx: android.content.Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
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
            val client = OkHttpClient.Builder().callTimeout(90, TimeUnit.SECONDS).build()
            val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
            for (uri in uris) {
                val mime = applicationContext.contentResolver.getType(uri) ?: "image/jpeg"
                val tmp = copyUriToTemp(uri) ?: continue
                val field = if (mime.startsWith("video")) "video" else "photos"
                builder.addFormDataPart(field, tmp.name, tmp.asRequestBody(mime.toMediaType()))
            }
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
            if (resp.isSuccessful) Result.success() else Result.retry()
        } catch (_: Exception) { Result.retry() }
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
