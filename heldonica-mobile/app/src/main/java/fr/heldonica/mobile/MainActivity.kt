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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.exifinterface.media.ExifInterface
import androidx.lifecycle.lifecycleScope
import androidx.work.*
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
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

    companion object {
        // Meme etiquette que UploadWorker, dont le TAG appartient a sa propre
        // classe et n'est pas visible ici.
        private const val TAG = "Heldonica"
    }

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
    // Portee tenue par l'activite : le contrat de permission repond hors
    // composition, il n'a donc pas acces au rememberCoroutineScope de l'ecran.
    private val portee by lazy { lifecycleScope }

    private var ecran by mutableStateOf("accueil")

    // Montage video : les plans choisis, leurs bornes, et l'avancement.
    private var plans by mutableStateOf<List<Plan>>(emptyList())
    private var montageEnCours by mutableStateOf(false)
    private var messageMontage by mutableStateOf<String?>(null)

    // Bande son : nulle tant qu'aucune musique n'est choisie.
    private var musique by mutableStateOf<Uri?>(null)
    private var nomMusique by mutableStateOf("")
    private var garderSonOriginal by mutableStateOf(true)
    private var volumeMusique by mutableStateOf(0.35f)

    // Le selecteur de photos ne montre pas les fichiers audio : on passe par le
    // selecteur de documents.
    private val selecteurMusique =
        registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
            if (uri != null) {
                // Sans cette permission persistante, l'URI cesse d'etre lisible
                // des que l'application repasse en arriere-plan, et le montage
                // echoue au moment ou l'on croit avoir tout regle.
                runCatching {
                    contentResolver.takePersistableUriPermission(
                        uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                    )
                }
                musique = uri
                nomMusique = nomAffichable(uri)
                messageMontage = "Musique choisie."
            }
        }

    private val selecteurVideos =
        registerForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(6)) { uris ->
            if (uris.isNotEmpty()) {
                messageMontage = "Lecture des durées…"
                portee.launch {
                    // La lecture ouvre chaque fichier : sur le fil d'entrees-sorties,
                    // pas sur celui de l'interface.
                    val lus = withContext(Dispatchers.IO) {
                        uris.map { uri ->
                            val duree = lireDuree(this@MainActivity, uri)
                            Plan(uri = uri, dureeMs = duree, finMs = duree)
                        }
                    }
                    plans = lus
                    val illisibles = lus.count { it.dureeMs == 0L }
                    messageMontage = when {
                        illisibles == lus.size -> "Durées illisibles : les plans partiront entiers."
                        illisibles > 0 -> "${lus.size} plan(s). $illisibles sans durée lisible."
                        else -> "${lus.size} plan(s)."
                    }
                }
            }
        }

    // Les reglages fins restent replies : ils servent rarement, et leur
    // presence permanente noyait l'action principale.
    private var optionsOuvertes by mutableStateOf(false)

    // Demande de la position, a l'execution.
    //
    // ACCESS_FINE_LOCATION est une permission dangereuse : la declarer au
    // manifeste ne suffit pas depuis Android 6. Elle ne l'etait nulle part, et
    // fused.lastLocation levait donc une SecurityException, avalee par un catch
    // vide. Le bouton « Je suis sur place » ne faisait rien et ne le disait pas.
    //
    // La demande part au moment ou l'on touche le bouton, pas au lancement :
    // c'est la seule seconde ou la raison en est evidente.
    private val permissionPosition =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { accordee ->
            if (accordee) {
                portee.launch { lirePosition() }
            } else {
                status = "Position refusee. Écris le lieu à la main."
            }
        }

    private val picker = registerForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(10)) { uris ->
        if (uris.isNotEmpty()) {
            pickedUris = uris
            // Le nombre de photos est deja affiche juste en dessous. Cette ligne
            // le repetait, et surtout elle s'executait apres la lecture EXIF :
            // elle effacait donc le seul message utile, celui qui dit ce que la
            // photo apporte et ce qui reste a saisir.
            status = ""
            uris.firstOrNull()?.let { uri -> readExifAndReverseGeocode(uri) }
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

            CarteAction(
                titre = "Monter une vidéo",
                detail = "Mettre plusieurs plans bout à bout, puis en faire un brouillon."
            ) { ecran = "montage" }

            Text("Modifier le site", style = MaterialTheme.typography.titleMedium)

            // Chaque carte ouvre directement sa section du panneau. Sans le
            // parametre, toutes arrivaient sur le tableau de bord et il fallait
            // retrouver la bonne entree dans une barre laterale etroite.
            CarteAction(
                titre = "Articles et carnets",
                detail = "Écrire, corriger, relire ce qui est en brouillon."
            ) { ouvrirEditeur("/panel-manager?section=articles") }

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
            ) { ouvrirEditeur("/panel-manager?section=design") }

            Text(
                "Rien n'est publié sans ton accord : tout arrive en brouillon.",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }

    /**
     * Montage : choisir des plans, les regler, en faire un brouillon.
     *
     * Un bloc par plan, dans l'ordre du montage : ce qu'on garde, et le texte a
     * incruster. Mettre bout a bout sans pouvoir couper ne servait a rien - c'est
     * la premiere chose qu'on fait d'un rush.
     *
     * Le resultat rejoint le parcours de publication existant plutot que d'avoir
     * son propre envoi : une fois monte, le fichier devient le media choisi, et
     * l'ecran « Publier » s'occupe du reste.
     */
    @Composable
    fun EcranMontage(modifier: Modifier = Modifier) {
        Column(
            modifier
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = {
                    selecteurVideos.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                    )
                },
                enabled = !montageEnCours
            ) { Text("Choisir des vidéos") }

            messageMontage?.let { Text(it, style = MaterialTheme.typography.bodySmall) }

            plans.forEachIndexed { index, plan ->
                ReglagesPlan(index, plan)
            }

            if (plans.isNotEmpty()) {
                val total = plans.sumOf { it.dureeRetenueMs }.coerceAtLeast(0) / 1000
                Text(
                    "Durée du montage : environ ${total} s",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            if (plans.isNotEmpty()) {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Musique", style = MaterialTheme.typography.titleMedium)

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { selecteurMusique.launch(arrayOf("audio/*")) },
                                enabled = !montageEnCours
                            ) { Text(if (musique == null) "Choisir" else "Changer") }

                            if (musique != null) {
                                TextButton(
                                    onClick = { musique = null; nomMusique = "" },
                                    enabled = !montageEnCours
                                ) { Text("Retirer") }
                            }
                        }

                        if (musique == null) {
                            Text(
                                "Aucune musique : le montage garde le son des plans.",
                                style = MaterialTheme.typography.bodySmall
                            )
                        } else {
                            Text(nomMusique, style = MaterialTheme.typography.bodySmall)

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Checkbox(
                                    checked = garderSonOriginal,
                                    onCheckedChange = { garderSonOriginal = it },
                                    enabled = !montageEnCours
                                )
                                Text(
                                    "Garder aussi le son des plans",
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }

                            Text(
                                "Volume de la musique : ${(volumeMusique * 100).toInt()} %",
                                style = MaterialTheme.typography.bodySmall
                            )
                            Slider(
                                value = volumeMusique,
                                onValueChange = { volumeMusique = it },
                                valueRange = 0f..1f,
                                enabled = !montageEnCours,
                            )

                            Text(
                                "Plus courte que le montage, elle reprend au début.",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            }

            Button(
                onClick = { lancerMontage() },
                enabled = plans.isNotEmpty() && !montageEnCours,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (montageEnCours) "Montage en cours…" else "Monter la vidéo")
            }

            if (montageEnCours) LinearProgressIndicator(Modifier.fillMaxWidth())

            Text(
                "Le montage se fait sur le téléphone : garde l'application ouverte. " +
                "Une fois fini, la vidéo arrive dans l'écran Publier.",
                style = MaterialTheme.typography.bodySmall
            )

            Text(
                "Pas encore possible : les transitions entre plans.",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }

    /** Ce qu'on garde d'un plan, et le texte a y incruster. */
    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    private fun ReglagesPlan(index: Int, plan: Plan) {
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Plan ${index + 1}", style = MaterialTheme.typography.titleMedium)

                if (plan.dureeMs > 0) {
                    val debut = plan.debutMs.toFloat()
                    val fin = (if (plan.finMs > 0) plan.finMs else plan.dureeMs).toFloat()

                    Text(
                        "De ${plan.debutMs / 1000} s à ${(if (plan.finMs > 0) plan.finMs else plan.dureeMs) / 1000} s " +
                        "— sur ${plan.dureeMs / 1000} s",
                        style = MaterialTheme.typography.bodySmall
                    )

                    RangeSlider(
                        value = debut..fin,
                        onValueChange = { bornes ->
                            plans = plans.toMutableList().also {
                                it[index] = plan.copy(
                                    debutMs = bornes.start.toLong(),
                                    finMs = bornes.endInclusive.toLong(),
                                )
                            }
                        },
                        valueRange = 0f..plan.dureeMs.toFloat(),
                        enabled = !montageEnCours,
                    )
                } else {
                    // Sans duree lisible, un curseur n'aurait pas de borne : le
                    // plan part entier, et l'ecran le dit.
                    Text(
                        "Durée illisible : ce plan partira entier.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                OutlinedTextField(
                    value = plan.texte,
                    onValueChange = { t ->
                        plans = plans.toMutableList().also { it[index] = plan.copy(texte = t) }
                    },
                    label = { Text("Texte à incruster (facultatif)") },
                    enabled = !montageEnCours,
                    modifier = Modifier.fillMaxWidth(),
                )

                if (plans.size > 1) {
                    TextButton(
                        onClick = {
                            plans = plans.toMutableList().also { it.removeAt(index) }
                        },
                        enabled = !montageEnCours
                    ) { Text("Retirer ce plan") }
                }
            }
        }
    }

    /** Lance le montage, puis bascule vers la publication. */
    private fun lancerMontage() {
        montageEnCours = true
        messageMontage = "Montage en cours…"
        portee.launch {
            val bande = musique?.let {
                BandeSon(
                    musique = it,
                    garderSonOriginal = garderSonOriginal,
                    volumeMusique = volumeMusique,
                )
            }
            when (val r = monterVideo(this@MainActivity, plans, bande)) {
                is ResultatMontage.Reussi -> {
                    val secondes = r.dureeMs / 1000
                    pickedUris = listOf(Uri.fromFile(r.fichier))
                    status = "Vidéo montée (${secondes} s). Ajoute le lieu, puis crée le brouillon."
                    messageMontage = null
                    montageEnCours = false
                    ecran = "publier"
                }
                is ResultatMontage.Echoue -> {
                    messageMontage = r.motif
                    montageEnCours = false
                }
            }
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
                        title = {
                            Text(
                                when (ecran) {
                                    "accueil" -> "Heldonica"
                                    "montage" -> "Monter une vidéo"
                                    else -> "Publier"
                                }
                            )
                        },
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
                if (ecran == "montage") {
                    EcranMontage(Modifier.padding(pad))
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
                    OutlinedTextField(value = placeAddress, onValueChange = { placeAddress = it }, label = { Text("Adresse (facultatif)") }, modifier = Modifier.fillMaxWidth())

                    // Ces deux aides etaient repliees sous « Options », au titre
                    // du cas rare. Le selecteur d'Android retirant les
                    // coordonnees de toutes les photos, le lieu est a renseigner
                    // a chaque fois : elles sont donc a leur place ici.
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { demanderPosition() }) {
                            Text("Je suis sur place")
                        }
                        OutlinedButton(onClick = {
                            scope.launch {
                                status = if (placeLat == null) "Touche d'abord « Je suis sur place »."
                                    else if (reverseGeocodeNominatim()) "Adresse trouvée."
                                    else "Adresse introuvable pour ce point."
                            }
                        }) {
                            Text("Trouver l'adresse")
                        }
                    }
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

    /**
     * Date et lieu de prise de vue, lus dans la photo choisie.
     *
     * Le selecteur de photos d'Android retire les coordonnees GPS de l'EXIF, et
     * il n'existe aucun moyen documente de les recuperer : ni
     * MediaStore.setRequireOriginal, qui ne s'applique pas a ses URI, ni la
     * permission ACCESS_MEDIA_LOCATION, ni aucune option de
     * PickVisualMediaRequest — sa surface publique n'en propose pas, meme sur la
     * branche principale d'androidx. Seule la date survit.
     *
     * Le champ Lieu restait donc vide sans explication. Il est desormais annonce
     * comme etant a remplir, avec les deux moyens qui marchent : le bouton
     * « GPS live » quand on est sur place, ou la saisie a la main.
     *
     * L'import depuis /panel-manager/photos, lui, passe par l'API Google Photos
     * et rapatrie le fichier d'origine : c'est la que les coordonnees du voyage
     * entrent dans la mediatheque.
     */
    private fun readExifAndReverseGeocode(uri: Uri) {
        try {
            contentResolver.openInputStream(uri)?.use { input ->
                val exif = ExifInterface(input)
                val latLong = exif.latLong
                val date = exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL)

                if (latLong != null) {
                    placeLat = latLong[0]; placeLng = latLong[1]
                    kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                        reverseGeocodeNominatim()
                    }
                }

                // L'EXIF date au format « 2026:09:03 20:17:17 » : les deux
                // premiers deux-points separent l'annee, le mois et le jour.
                val jour = date?.substringBefore(' ')?.replace(':', '-')

                status = when {
                    latLong != null -> "Lieu trouvé dans la photo."
                    jour != null ->
                        "Photo du $jour. Écris le lieu : Android le retire des photos."
                    else -> "Ni date ni lieu dans cette photo : les deux sont à écrire."
                }
            }
        } catch (_: Exception) {}
    }

    /**
     * Adresse a partir des coordonnees, via Nominatim.
     *
     * L'appel reseau tourne explicitement sur le fil d'entrees-sorties. Il etait
     * lance tel quel depuis le fil principal quand on touchait le bouton :
     * Android levait NetworkOnMainThreadException, que le catch vide effacait.
     * Le message disait alors « adresse introuvable » alors que la requete
     * n'etait jamais partie. Un seul appelant s'en sortait, celui de la lecture
     * EXIF, parce qu'il basculait deja sur Dispatchers.IO.
     *
     * La bascule est ici, dans la fonction, et non chez ses appelants : c'est la
     * seule facon qu'aucun ne se trompe.
     */
    private suspend fun reverseGeocodeNominatim(): Boolean {
        val lat = placeLat ?: return false
        val lng = placeLng ?: return false

        val corps = withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient()
                val req = Request.Builder()
                    .url("https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=jsonv2&zoom=14&accept-language=fr")
                    // Nominatim exige une identification, sous peine de blocage.
                    .header("User-Agent", "Heldonica Mobile (contact@heldonica.fr)")
                    .build()

                client.newCall(req).execute().use { resp ->
                    if (!resp.isSuccessful) {
                        Log.e(TAG, "Nominatim a refuse : ${resp.code}")
                        return@withContext null
                    }
                    resp.body?.string()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Adresse indisponible", e)
                null
            }
        } ?: return false

        val adresse = Regex("\"display_name\"\\s*:\\s*\"([^\"]+)\"")
            .find(corps)?.groupValues?.get(1) ?: return false

        placeAddress = adresse
        if (placeTitle.isBlank()) {
            val commune = Regex("\"village\"\\s*:\\s*\"([^\"]+)\"").find(corps)?.groupValues?.get(1)
                ?: Regex("\"town\"\\s*:\\s*\"([^\"]+)\"").find(corps)?.groupValues?.get(1)
                ?: Regex("\"city\"\\s*:\\s*\"([^\"]+)\"").find(corps)?.groupValues?.get(1)
            if (commune != null) placeTitle = commune
        }
        return true
    }

    /**
     * Nom lisible d'un fichier choisi.
     *
     * lastPathSegment d'une URI de mediatheque rend un identifiant opaque -
     * « audio:1000186087 » - qui n'aide personne a reconnaitre son morceau. Le
     * nom d'affichage se demande au fournisseur de contenu.
     */
    private fun nomAffichable(uri: Uri): String {
        val defaut = uri.lastPathSegment?.substringAfterLast('/') ?: "musique"
        return runCatching {
            contentResolver.query(
                uri,
                arrayOf(android.provider.OpenableColumns.DISPLAY_NAME),
                null, null, null
            )?.use { curseur ->
                if (curseur.moveToFirst()) curseur.getString(0) else null
            }
        }.getOrNull() ?: defaut
    }

    /** Point d'entree du bouton : demande la permission si besoin, puis lit. */
    private fun demanderPosition() {
        if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) ==
            android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            portee.launch { lirePosition() }
        } else {
            permissionPosition.launch(android.Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    /**
     * Position du telephone, puis adresse.
     *
     * lastLocation rend la derniere position connue, qui est nulle tant qu'aucune
     * application n'en a demande recemment — cas courant sur un telephone qui
     * sort de la poche. On demande alors un releve neuf.
     *
     * Chaque issue se voit : l'ancienne version echouait en silence, y compris
     * quand la permission manquait.
     */
    private suspend fun lirePosition() {
        status = "Recherche de la position…"
        try {
            val fused = LocationServices.getFusedLocationProviderClient(this)

            fused.lastLocation.addOnSuccessListener { connue ->
                if (connue != null) {
                    retenirPosition(connue.latitude, connue.longitude)
                    return@addOnSuccessListener
                }
                // Rien en cache : on interroge le capteur.
                fused.getCurrentLocation(
                    Priority.PRIORITY_HIGH_ACCURACY,
                    CancellationTokenSource().token
                )
                    .addOnSuccessListener { fraiche ->
                        if (fraiche != null) retenirPosition(fraiche.latitude, fraiche.longitude)
                        else status = "Position introuvable ici. Écris le lieu à la main."
                    }
                    .addOnFailureListener { e ->
                        Log.e(TAG, "Position indisponible", e)
                        status = "Position indisponible. Écris le lieu à la main."
                    }
            }.addOnFailureListener { e ->
                Log.e(TAG, "Derniere position indisponible", e)
                status = "Position indisponible. Écris le lieu à la main."
            }
        } catch (e: SecurityException) {
            // Permission revoquee entre-temps.
            Log.e(TAG, "Position refusee", e)
            status = "Position refusee. Écris le lieu à la main."
        }
    }

    /** Enchaine sur l'adresse : sans cela, il fallait toucher un second bouton. */
    private fun retenirPosition(lat: Double, lng: Double) {
        placeLat = lat
        placeLng = lng
        status = "Position trouvée. Recherche de l'adresse…"
        portee.launch {
            status = if (reverseGeocodeNominatim()) "Lieu et adresse remplis."
                else "Position trouvée, mais l'adresse est introuvable. Écris le lieu."
        }
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

    /**
     * Copie locale du media choisi.
     *
     * Le fichier arrive sans coordonnees GPS : le selecteur d'Android les retire
     * et ne propose aucun moyen de les conserver. La date de prise de vue, elle,
     * est bien la — c'est elle qui alimente le registre de preuves. Le lieu
     * vient du champ que l'on remplit soi-meme.
     */
    private fun copyUriToTemp(uri: Uri): File? {
        return try {
            val input = applicationContext.contentResolver.openInputStream(uri) ?: return null
            val tmp = File.createTempFile("heldonica_", ".jpg", applicationContext.cacheDir)
            tmp.outputStream().use { out -> input.copyTo(out) }
            tmp
        } catch (_: Exception) { null }
    }
}
