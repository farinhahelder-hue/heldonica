package fr.heldonica.mobile

import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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

    // Ecran affiche : accueil, ou formulaire de publication.
    //
    // Tout tenait auparavant sur une seule page — selecteur, quatre champs,
    // trois modes, cases a cocher, deux boutons d'envoi et quatre boutons
    // d'edition. Une trentaine d'elements presentes ensemble, sans hierarchie.
    // On n'en montre plus qu'un a la fois, avec une action evidente par ecran.
    private var ecran by mutableStateOf("accueil")

    // Les reglages fins restent replies : ils servent rarement, et leur
    // presence permanente noyait l'action principale.
    private var optionsOuvertes by mutableStateOf(false)

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

    /**
     * Accueil : une action par carte, avec ce qu'elle fait ecrit en clair.
     *
     * Les libelles disent le resultat plutot que l'outil — « Publier une photo »
     * plutot que « Picker systeme ». Chaque carte porte une phrase de contexte,
     * pour qu'aucun choix ne demande de se souvenir de ce qu'il declenche.
     */
    @Composable
    fun EcranAccueil(modifier: Modifier = Modifier) {
        Column(
            modifier
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Que veux-tu faire ?", style = MaterialTheme.typography.headlineSmall)

            CarteAction(
                titre = "Publier une photo",
                detail = "Choisir des photos, ajouter le lieu, créer un brouillon sur le site.",
                principale = true
            ) { ecran = "publier" }

            Text("Modifier le site", style = MaterialTheme.typography.titleMedium)

            CarteAction(
                titre = "Articles et carnets",
                detail = "Écrire, corriger, relire ce qui est en brouillon."
            ) { ouvrirEditeur("/panel-manager") }

            CarteAction(
                titre = "Carrousels Instagram",
                detail = "Composer les diapositives et les illustrer avec tes photos."
            ) { ouvrirEditeur("/panel-manager/carousel") }

            CarteAction(
                titre = "Photos du voyage",
                detail = "Importer depuis Google Photos vers la médiathèque."
            ) { ouvrirEditeur("/panel-manager/photos") }

            CarteAction(
                titre = "Apparence du site",
                detail = "Couleurs, logo, polices, titres."
            ) { ouvrirEditeur("/admin/settings") }

            Text(
                "Rien n'est publié sans ton accord : tout arrive en brouillon.",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }

    @Composable
    private fun CarteAction(
        titre: String,
        detail: String,
        principale: Boolean = false,
        onClick: () -> Unit
    ) {
        // Zone de clic pleine largeur et hauteur confortable : viser un petit
        // bouton demande une precision inutile.
        Card(
            onClick = onClick,
            modifier = Modifier.fillMaxWidth(),
            colors = if (principale)
                CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            else CardDefaults.cardColors()
        ) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(titre, style = MaterialTheme.typography.titleMedium)
                Text(detail, style = MaterialTheme.typography.bodySmall)
            }
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun HeldonicaScreen() {
        val scope = rememberCoroutineScope()
        // La touche Retour d'Android fermait l'application depuis l'ecran de
        // publication : le formulaire en cours - photos choisies, lieu saisi -
        // etait perdu sans avertissement. Elle ramene desormais a l'accueil.
        BackHandler(enabled = ecran != "accueil") { ecran = "accueil" }
        MaterialTheme {
            Scaffold(
                topBar = {
                    TopAppBar(
                        // Le titre dit ou l'on se trouve : sur un ecran unique
                        // pour tout faire, rien ne l'indiquait.
                        title = { Text(if (ecran == "accueil") "Heldonica" else "Publier") },
                        navigationIcon = {
                            if (ecran != "accueil") {
                                TextButton(onClick = { ecran = "accueil" }) { Text("← Retour") }
                            }
                        }
                    )
                }
            ) { pad ->
                if (ecran == "accueil") {
                    EcranAccueil(Modifier.padding(pad))
                    return@Scaffold
                }
                // Colonne defilante : l'ecran depassait deja la hauteur d'un
                // telephone avant l'ajout des boutons d'edition, qui restaient
                // donc hors d'atteinte. Le clavier reduit encore la zone visible
                // quand on saisit un lieu.
                Column(
                    Modifier
                        .padding(pad)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) }) {
                        Text("Choisir des photos")
                    }
                    Text(status, style = MaterialTheme.typography.bodySmall)
                    if (pickedUris.isNotEmpty()) Text("${pickedUris.size} média(s) prêts", color = MaterialTheme.colorScheme.primary)

                    OutlinedTextField(value = placeTitle, onValueChange = { placeTitle = it }, label = { Text("Lieu") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = placeAddress, onValueChange = { placeAddress = it }, label = { Text("Adresse (remplie automatiquement)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = caption, onValueChange = { caption = it }, label = { Text("Ce que tu as vécu là (facultatif)") }, modifier = Modifier.fillMaxWidth(), minLines = 3)

                    if (pickedUris.size > 1) LaunchedEffect(pickedUris.size) { isCarousel = true }

                    // Reglages replies : ils ont des valeurs par defaut qui
                    // conviennent, et les afficher en permanence noyait l'action
                    // principale sous une dizaine de controles.
                    TextButton(onClick = { optionsOuvertes = !optionsOuvertes }) {
                        Text(if (optionsOuvertes) "Masquer les options" else "Options (facultatif)")
                    }

                    if (optionsOuvertes) {
                        Text("Texte de la légende", style = MaterialTheme.typography.labelLarge)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(
                                "manuel" to "J'écris",
                                "auto" to "L'IA propose",
                                "both" to "Les deux"
                            ).forEach { (v, label) ->
                                FilterChip(
                                    selected = mode == v,
                                    onClick = { mode = v },
                                    label = { Text(label, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }

                        Row(
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Checkbox(checked = isCarousel, onCheckedChange = { isCarousel = it })
                            Text("Carrousel Instagram", style = MaterialTheme.typography.bodySmall)
                        }

                        Text("Si le lieu est vide", style = MaterialTheme.typography.labelLarge)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(onClick = { scope.launch { useLiveLocationAsFallback() } }) {
                                Text("Position actuelle")
                            }
                            OutlinedButton(onClick = { scope.launch { reverseGeocodeNominatim() } }) {
                                Text("Trouver l'adresse")
                            }
                        }
                    }

                    Button(
                        enabled = pickedUris.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            enqueueUpload(publishInstagram = false)
                            status = "Envoi en cours…"
                        }
                    ) { Text("Créer le brouillon") }

                    Button(
                        enabled = pickedUris.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        onClick = {
                            enqueueUpload(publishInstagram = true)
                            status = "Envoi en cours…"
                        }
                    ) { Text("Brouillon + Instagram") }

                    // Les acces a l'editeur vivent desormais sur l'accueil : les
                    // repeter ici melait deux intentions sur le meme ecran.
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Le brouillon arrive sur le site. Rien n'est publié tant que tu ne l'as pas relu.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }

    /** Ouvre l'editeur sur une page precise du panel. */
    private fun ouvrirEditeur(chemin: String) {
        startActivity(
            android.content.Intent(this, EditeurActivity::class.java)
                .putExtra(EditeurActivity.EXTRA_CHEMIN, chemin)
        )
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

            // JSONArray n'expose pas isEmpty() sur Android, seulement length().
            if (deposes.length() == 0) {
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
