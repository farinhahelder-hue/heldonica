package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.util.Size
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
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
import java.io.ByteArrayOutputStream
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
    private var analyseEnCours by mutableStateOf(false)
    // Ce que l'autrice avait écrit avant que l'IA propose sa version : la
    // proposition remplace le champ, ce bouton la ramène. Sans lui, un clic
    // sur « Regard Heldonica » effaçait ses mots sans retour (mesuré 21/09/2026).
    private var texteAvantIa by mutableStateOf<String?>(null)

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

    // Vrai tant qu'un envoi n'a pas rendu son verdict.
    //
    // Les boutons d'envoi restaient actifs pendant le televersement : deux
    // appuis creaient deux brouillons. Constate en base, huit brouillons pour
    // trois envois reels — dont deux a une seconde d'intervalle, ce qu'aucune
    // reprise de WorkManager n'explique, son backoff etant de dix secondes.
    // La meme photo s'y trouvait quatre fois, octet pour octet.
    private var envoiEnCours by mutableStateOf(false)

    // Montage video : les plans choisis, leurs bornes, et l'avancement.
    private var plans by mutableStateOf<List<Plan>>(emptyList())
    private var montageEnCours by mutableStateOf(false)
    private var messageMontage by mutableStateOf<String?>(null)

    // Bande son : nulle tant qu'aucune musique n'est choisie.
    private var musique by mutableStateOf<Uri?>(null)
    private var nomMusique by mutableStateOf("")
    private var garderSonOriginal by mutableStateOf(true)
    private var volumeMusique by mutableStateOf(0.35f)

    // Sous-titres : la transcription passe par le site, elle n'est donc pas
    // gratuite en temps. On ne la lance que si elle est demandee.
    private var sousTitresDemandes by mutableStateOf(false)

    // Fondu au noir aux coupes. Faux par defaut : la coupe franche est la norme
    // en format court, et un fondu impose serait une signature qu'on n'a pas
    // choisie.
    private var fonduDemande by mutableStateOf(false)

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

            // Ecrire sans photo passait auparavant par « Articles et carnets »,
            // qui ouvre le panneau de bureau dans une WebView : vingt-quatre
            // onglets sur un ecran de telephone. Ici, trois champs et un bouton.
            CarteAction(
                titre = "Écrire un carnet",
                detail = "Un titre, ce que tu as vécu. Sans photo, si tu n'en as pas."
            ) {
                // Les photos d'un envoi precedent restaient en memoire : le
                // carnet serait parti avec elles sans que rien ne le montre.
                // Un envoi encore en vol garde ses champs : les vider ne
                // l'annulerait pas, cela ferait seulement perdre de vue ce qui
                // est parti.
                if (!envoiEnCours) {
                    pickedUris = emptyList()
                    placeTitle = ""
                    placeAddress = ""
                    caption = ""
                    status = ""
                }
                ecran = "carnet"
            }

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

            if (plans.isNotEmpty()) {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Sous-titres", style = MaterialTheme.typography.titleMedium)

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Checkbox(
                                checked = sousTitresDemandes,
                                onCheckedChange = { sousTitresDemandes = it },
                                enabled = !montageEnCours
                            )
                            Text(
                                "Écrire ce qui est dit, dans l'image",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }

                        Text(
                            if (sousTitresDemandes)
                                "Le montage part sur le site pour être transcrit, puis revient " +
                                "avec les sous-titres gravés. Compte une minute de plus."
                            else
                                "Un Reel se regarde souvent sans le son.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            if (plans.size > 1) {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Transitions", style = MaterialTheme.typography.titleMedium)

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Checkbox(
                                checked = fonduDemande,
                                onCheckedChange = { fonduDemande = it },
                                enabled = !montageEnCours
                            )
                            Text("Fondu au noir entre les plans", style = MaterialTheme.typography.bodySmall)
                        }

                        Text(
                            "Le plan s'assombrit jusqu'au noir, puis le suivant s'éclaircit. " +
                            "Ce n'est pas un fondu enchaîné : les deux plans ne se superposent pas.",
                            style = MaterialTheme.typography.bodySmall
                        )
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

    /**
     * Lance le montage, puis bascule vers la publication.
     *
     * Avec sous-titres, il faut deux encodages : le premier produit la video,
     * qui part se faire transcrire, et le second y grave le texte. On ne peut
     * pas transcrire les plans d'origine — leurs horodatages ne survivraient ni
     * a la decoupe ni a la mise bout a bout.
     */
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

            when (val premier = monterVideo(this@MainActivity, plans, bande, fondu = fonduDemande)) {
                is ResultatMontage.Echoue -> {
                    messageMontage = premier.motif
                    montageEnCours = false
                }

                is ResultatMontage.Reussi -> {
                    if (!sousTitresDemandes) {
                        terminerMontage(premier)
                        return@launch
                    }

                    messageMontage = "Extraction du son…"
                    val son = extraireAudio(this@MainActivity, premier.fichier)
                    if (son == null) {
                        terminerMontage(premier)
                        messageMontage = "Son illisible. Le montage est prêt, sans sous-titres."
                        return@launch
                    }

                    messageMontage = "Transcription en cours…"
                    val transcription = withContext(Dispatchers.IO) {
                        transcrire(BuildConfig.CMS_BASE_URL, BuildConfig.CMS_PASSWORD, son)
                    }
                    son.delete()

                    when (transcription) {
                        is ResultatTranscription.Echoue -> {
                            // Le montage existe : on le garde plutot que de tout
                            // perdre parce que la transcription a echoue.
                            terminerMontage(premier)
                            messageMontage = "${transcription.motif} Le montage est prêt, sans sous-titres."
                        }

                        is ResultatTranscription.Reussi -> {
                            messageMontage = "Gravure des sous-titres…"
                            val second = monterVideo(
                                this@MainActivity, plans, bande, transcription.segments,
                                fondu = fonduDemande,
                            )
                            when (second) {
                                is ResultatMontage.Reussi -> {
                                    premier.fichier.delete()
                                    terminerMontage(second)
                                    status += " ${transcription.segments.size} sous-titre(s)."
                                }
                                is ResultatMontage.Echoue -> {
                                    terminerMontage(premier)
                                    messageMontage =
                                        "Sous-titres impossibles à graver. Le montage est prêt, sans eux."
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /** Le montage devient le media choisi, et l'ecran de publication prend la suite. */
    private fun terminerMontage(resultat: ResultatMontage.Reussi) {
        pickedUris = listOf(Uri.fromFile(resultat.fichier))
        status = "Vidéo montée (${resultat.dureeMs / 1000} s). Ajoute le lieu, puis crée le brouillon."
        messageMontage = null
        montageEnCours = false
        ecran = "publier"
    }

    /**
     * Un carnet en texte seul : titre, lieu facultatif, recit.
     *
     * Meme forme que « Publier une photo », dont le parcours est verifie : les
     * champs sont les memes cote serveur — placeTitle devient le titre du
     * billet, caption son corps. Rien de nouveau a apprendre, et rien de
     * nouveau a maintenir.
     *
     * Le brouillon part avec les memes garde-fous que les autres : jamais
     * publie, et des marqueurs [À TOI] la ou il manque quelque chose.
     */
    @Composable
    fun EcranCarnet(modifier: Modifier = Modifier) {
        Column(
            modifier
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = placeTitle,
                onValueChange = { placeTitle = it },
                label = { Text("Titre du carnet") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = placeAddress,
                onValueChange = { placeAddress = it },
                label = { Text("Lieu (facultatif)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = caption,
                onValueChange = { caption = it },
                label = { Text("Ce que tu as vécu (facultatif)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 6
            )

            Button(
                // Le titre suffit : le reste peut se completer sur le site, et
                // exiger davantage ici ferait perdre une note prise sur le vif.
                enabled = placeTitle.isNotBlank() && !envoiEnCours,
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    enqueueUpload(publishInstagram = false)
                    status = "Envoi en cours…"
                }
            ) { Text("Créer le brouillon") }

            // Le rappel du titre manquant restait affiche une fois le titre
            // saisi, sous un bouton devenu actif : deux messages contraires sur
            // le meme ecran. Il ne s'affiche donc que tant qu'il est vrai.
            val message = if (placeTitle.isBlank()) "Écris au moins un titre." else status
            if (message.isNotBlank()) {
                Text(message, style = MaterialTheme.typography.bodyMedium)
            }
            Text(
                "Le brouillon arrive sur le site. Rien n'est publié tant que tu ne l'as pas relu.",
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

    @Composable
    private fun VignetteMedia(uri: Uri, onRemove: () -> Unit) {
        val context = LocalContext.current
        val bitmap = remember(uri) {
            runCatching {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    context.contentResolver.loadThumbnail(uri, Size(200, 200), null)
                } else {
                    @Suppress("DEPRECATION")
                    MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                }
            }.getOrNull()
        }

        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        ) {
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("📷", style = MaterialTheme.typography.titleMedium)
                }
            }
            IconButton(
                onClick = onRemove,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(24.dp)
                    .background(Color.Black.copy(alpha = 0.5f), CircleShape)
            ) {
                Text("✕", color = Color.White, style = MaterialTheme.typography.labelSmall)
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
                                    "carnet" -> "Écrire un carnet"
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
                if (ecran == "carnet") {
                    EcranCarnet(Modifier.padding(pad))
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) }) {
                            Text(if (pickedUris.isEmpty()) "📸 Choisir des photos / vidéos" else "➕ Ajouter des médias")
                        }
                        if (pickedUris.isNotEmpty()) {
                            TextButton(onClick = { pickedUris = emptyList() }) {
                                Text("Tout effacer", color = MaterialTheme.colorScheme.error)
                            }
                        }
                    }

                    if (pickedUris.isNotEmpty()) {
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                        ) {
                            items(pickedUris) { uri ->
                                VignetteMedia(
                                    uri = uri,
                                    onRemove = { pickedUris = pickedUris.filter { it != uri } }
                                )
                            }
                        }
                        Text("${pickedUris.size} média(s) sélectionné(s)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                    }

                    Text(status, style = MaterialTheme.typography.bodySmall)

                    OutlinedTextField(value = placeTitle, onValueChange = { placeTitle = it }, label = { Text("Lieu") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = placeAddress, onValueChange = { placeAddress = it }, label = { Text("Adresse (facultatif)") }, modifier = Modifier.fillMaxWidth())

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { demanderPosition() }) {
                            Text("📍 Je suis sur place (GPS auto)")
                        }
                    }

                    if (pickedUris.isNotEmpty()) {
                        FilledTonalButton(
                            enabled = !analyseEnCours,
                            modifier = Modifier.fillMaxWidth(),
                            onClick = { analyserPhotoAvecIa(pickedUris.first()) }
                        ) {
                            Text(if (analyseEnCours) "✨ Regard Heldonica en cours…" else if (caption.isNotBlank()) "✨ Mettre en forme mes notes avec la photo" else "✨ Décrire la photo (puis [À TOI])")
                        }
                    }

                    OutlinedTextField(
                        value = caption,
                        onValueChange = { caption = it },
                        label = { Text("Ce que tu as vécu là — l'IA part de ça") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    if (texteAvantIa != null) {
                        TextButton(onClick = {
                            caption = texteAvantIa ?: caption
                            texteAvantIa = null
                            status = "Ton texte est revenu."
                        }) {
                            Text("↩ Revenir à mon texte")
                        }
                    }

                    if (caption.isNotBlank()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            TextButton(
                                onClick = {
                                    copierDansPressePapier(genererCaptionInstagram(), montrerToast = true)
                                }
                            ) {
                                Text("📋 Copier la légende")
                            }
                        }
                    }

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

                    if (envoiEnCours) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                        ) {
                            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                LinearProgressIndicator(Modifier.fillMaxWidth())
                                Text(
                                    text = "Publication en cours... Merci de patienter.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }

                    Button(
                        enabled = pickedUris.isNotEmpty() && !envoiEnCours,
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            copierDansPressePapier(genererCaptionInstagram(), montrerToast = false)
                            enqueueUpload(publishInstagram = false)
                            status = "Envoi en cours…"
                        }
                    ) { Text("Créer le brouillon") }

                    Spacer(Modifier.height(6.dp))

                    Text(
                        "💡 Instagram n'autorise aucune application externe à coller du texte automatiquement. Ta légende est dans le presse-papier : sur Instagram, touche simplement « Coller » (ou la puce au-dessus du clavier).",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(Modifier.height(4.dp))

                    Button(
                        enabled = pickedUris.isNotEmpty() && !envoiEnCours,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        onClick = {
                            enqueueUpload(publishInstagram = true)
                            status = "Envoi en cours…"
                            ouvrirInstagram(pickedUris, genererCaptionInstagram())
                        }
                    ) { Text("Brouillon + Ouvrir Instagram") }

                    OutlinedButton(
                        enabled = pickedUris.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            ouvrirInstagram(pickedUris, genererCaptionInstagram())
                        }
                    ) {
                        Text(
                            if (pickedUris.size > 1) "📸 Ouvrir dans Instagram (story ou reel)"
                            else "📸 Ouvrir directement dans Instagram"
                        )
                    }

                    // Constate sur l'appareil le 16/09 : avec plusieurs photos,
                    // Instagram ne propose que Story et Reel au partage — jamais
                    // le fil. Le carrousel du fil passe par la file du panneau
                    // (« Brouillon + Ouvrir Instagram », puis « Publier » depuis
                    // le PC). Le dire ici evite de chercher un bouton absent.
                    if (pickedUris.size > 1) {
                        Text(
                            "Avec plusieurs photos, Instagram s'ouvre en story ou en reel. " +
                                "Pour un carrousel dans le fil : « Brouillon + Ouvrir Instagram », " +
                                "puis publie-le depuis le panneau.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

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

    /** Génère le texte de légende adapté pour Instagram avec le lieu et la signature. */
    private fun genererCaptionInstagram(): String {
        val texte = caption.trim()
        return buildString {
            if (texte.isNotBlank()) append(texte)
            if (placeTitle.isNotBlank() && !texte.contains(placeTitle)) {
                append("\n\n📍 ").append(placeTitle)
                if (placeAddress.isNotBlank()) append(" — ").append(placeAddress)
            }
            if (!texte.contains("heldonica.fr")) {
                append("\n\n🌍 heldonica.fr")
            }
            if (!texte.contains("#slowtravel") && !texte.contains("#heldonica")) {
                append("\n#slowtravel #heldonica")
            }
        }
    }

    /** Copie le texte dans le presse-papier Android avec logging et toast facultatif. */
    private fun copierDansPressePapier(texte: String, montrerToast: Boolean = true) {
        if (texte.isBlank()) return
        try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
            if (clipboard != null) {
                val clip = ClipData.newPlainText("Légende Heldonica", texte)
                clipboard.setPrimaryClip(clip)
                Log.i(TAG, "Légende copiée dans le presse-papier (${texte.length} car.)")
                if (montrerToast) {
                    Toast.makeText(this, "📋 Légende copiée dans le presse-papier !", Toast.LENGTH_SHORT).show()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Erreur presse-papier: ${e.message}")
        }
    }

    /**
     * Ouvre directement l'application Instagram native avec la ou les photos sélectionnées.
     * Copie la légende dans le presse-papier car Instagram n'accepte pas toujours EXTRA_TEXT en Feed.
     */
    private fun ouvrirInstagram(uris: List<Uri>, texte: String) {
        if (uris.isEmpty()) {
            Toast.makeText(this, "Choisis d'abord au moins une photo ou vidéo", Toast.LENGTH_SHORT).show()
            return
        }

        // 1. Copier la légende dans le presse-papier
        copierDansPressePapier(texte, montrerToast = false)
        Toast.makeText(
            this,
            "📋 Légende copiée ! Touche « Coller » dans Instagram.",
            Toast.LENGTH_LONG
        ).show()

        // 2. Préparer l'Intent de partage (simple ou carrousel)
        val isVideo = uris.any { applicationContext.contentResolver.getType(it)?.startsWith("video") == true }

        val shareIntent = if (uris.size > 1) {
            Intent(Intent.ACTION_SEND_MULTIPLE).apply {
                type = "image/*"
                putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(uris))
                putExtra(Intent.EXTRA_TEXT, texte)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
        } else {
            Intent(Intent.ACTION_SEND).apply {
                type = if (isVideo) "video/*" else "image/*"
                putExtra(Intent.EXTRA_STREAM, uris.first())
                putExtra(Intent.EXTRA_TEXT, texte)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
        }

        // 3. Tenter d'ouvrir l'application Instagram directement
        shareIntent.setPackage("com.instagram.android")

        try {
            startActivity(shareIntent)
        } catch (_: Exception) {
            // Repli vers le sélecteur Android standard si Instagram n'est pas trouvé
            shareIntent.setPackage(null)
            try {
                startActivity(Intent.createChooser(shareIntent, "Partager avec..."))
            } catch (e: Exception) {
                Toast.makeText(this, "Impossible d'ouvrir le partage : ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Analyse la photo via l'IA Vision pour extraire une légende sensorielle et des hashtags
     * cohérents avec l'atmosphère réelle de l'image.
     */
    private fun analyserPhotoAvecIa(uri: Uri) {
        analyseEnCours = true
        status = "Analyse de la photo par l'IA en cours…"
        // Le champ contient ce que l'autrice a écrit : c'est la source, pas un
        // brouillon à écraser.
        val notesAutrice = caption.trim()
        portee.launch(Dispatchers.IO) {
            try {
                val bytes = preparerImagePourVision(uri)
                if (bytes == null) {
                    withContext(Dispatchers.Main) {
                        analyseEnCours = false
                        status = "Impossible de lire la photo pour l'analyse"
                        Toast.makeText(this@MainActivity, "Impossible de lire la photo", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val geminiKey = BuildConfig.GEMINI_API_KEY.ifBlank { null }
                val client = OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(60, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .callTimeout(75, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true)
                    .build()
                var textResult = ""
                var dernierErreur = ""

                // 1. Tenter l'appel direct Gemini 2.5 Flash avec retry automatique (jusqu'à 2 essais)
                if (!geminiKey.isNullOrBlank()) {
                    val base64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
                    val prompt = """
Tu es la voix éditoriale d'Heldonica (média et concepteur de voyages slow travel en duo).
Notre regard sur le voyage est singulier : il est porté par une sensibilité neuroatypique (TSA), attentive aux micro-détails sensoriels et tangibles que la plupart des gens traversent sans remarquer.

RÈGLES ÉDITORIALES & REGARD SENSORIEL (TSA) :
1. LA SOURCE — CE QUI PRIME SUR TOUT :
- Les NOTES de l'autrice, si elles sont données plus bas, sont la seule source du vécu : ce qu'on a fait, ressenti, entendu, goûté. Reprends-les, resserre-les, ne les contredis pas.
- L'IMAGE ne donne que ce qui est visible : matières, lumière, couleurs, objets, lieu, absence ou présence de gens. Décris-la avec précision (le grain du bois, la pierre, les reflets, la découpe des ombres, le lin froissé).
- N'AJOUTE RIEN : aucune sensation non visible (son, odeur, toucher, goût, température), aucune action du duo (« on s'est posés », « on a pris le temps ») qui ne soit dans les notes, aucun nom de lieu, aucun chiffre, aucune heure absents des notes et de l'image.
- Sans notes : décris ce que la photo montre, sans raconter ce que le duo a fait, et termine par exactement « [À TOI : ce que tu as ressenti là] ».

2. ÉMETTEUR DUO (« on » exclusif) :
- Le duo s'exprime toujours par « on » — et seulement pour ce que les notes racontent.
- Ne dis JAMAIS « je », « nous », « nos », « notre équipe », « la rédaction ».

3. DESTINATAIRE (« tu ») :
- Tutoiement direct et complice (« tu »), comme une note intime partagée dans un carnet de route.

4. MOTS STRICTEMENT BANNIS (zéro tolérance) :
- Clichés d'influenceurs et superlatifs interdits : pépite, pépites, incontournable, incontournables, bon plan, bons plans, must-see, must-have, paradis, paradisiaque, magnifique, splendide, incroyable, magique, merveilleux, spot.
- Tics de langage IA bannis : plongez dans, laissez-vous emporter, au cœur de, véritable havre de paix, cocon, n'attends plus, embarquez.
- Pas d'exclamation artificielle ni d'enthousiasme forcé. Ton calme, posé, sincère, reposant.

5. FORMAT D'ÉCRITURE :
- Un texte court et aéré (3 à 5 phrases, 50 à 75 mots environ).
- Termine par une question douce ou une observation suspendue en tutoiement ("tu").
- Ligne vide, puis 4 hashtags sobres : #slowtravel #heldonica + 2 hashtags de contexte précis.
${if (placeTitle.isNotBlank()) "Lieu indiqué par l'autrice : $placeTitle." else ""}
${if (notesAutrice.isNotBlank()) "NOTES DE L'AUTRICE (la seule source du vécu) :\n---\n$notesAutrice\n---\nÉcris la légende à partir de ces notes et de ce que la photo montre." else "Aucune note : décris ce que la photo montre, sans inventer ce que le duo a fait, et termine par [À TOI : ce que tu as ressenti là]."}
""".trimIndent()

                    val jsonReq = org.json.JSONObject().apply {
                        val contents = org.json.JSONArray().apply {
                            val msg = org.json.JSONObject().apply {
                                val parts = org.json.JSONArray().apply {
                                    put(org.json.JSONObject().put("text", prompt))
                                    put(org.json.JSONObject().put("inline_data", org.json.JSONObject().apply {
                                        put("mime_type", "image/jpeg")
                                        put("data", base64)
                                    }))
                                }
                                put("parts", parts)
                            }
                            put(msg)
                        }
                        put("contents", contents)
                        put("generationConfig", org.json.JSONObject().apply {
                            put("temperature", 0.5)
                            put("maxOutputTokens", 2500)
                        })
                    }

                    for (essai in 1..2) {
                        try {
                            if (essai > 1) {
                                withContext(Dispatchers.Main) {
                                    status = "Nouvelle tentative d'analyse…"
                                }
                                kotlinx.coroutines.delay(1000)
                            }

                            val req = Request.Builder()
                                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$geminiKey")
                                .post(jsonReq.toString().toRequestBody("application/json".toMediaType()))
                                .build()

                            val resp = client.newCall(req).execute()
                            val corps = resp.body?.string().orEmpty()

                            if (resp.isSuccessful) {
                                val respJson = org.json.JSONObject(corps)
                                val candidates = respJson.optJSONArray("candidates")
                                val text = candidates?.optJSONObject(0)
                                    ?.optJSONObject("content")
                                    ?.optJSONArray("parts")
                                    ?.optJSONObject(0)
                                    ?.optString("text")
                                    .orEmpty()
                                if (text.isNotBlank()) {
                                    textResult = text.trim()
                                    break
                                }
                            } else {
                                dernierErreur = "Gemini HTTP ${resp.code}"
                                Log.w(TAG, "Tentative $essai Gemini échec: $corps")
                            }
                        } catch (e: Exception) {
                            dernierErreur = e.message ?: "timeout"
                            Log.w(TAG, "Tentative $essai Gemini exception: ${e.message}")
                        }
                    }
                }

                // 2. Repli automatique vers le serveur CMS si l'appel direct n'a pas abouti
                if (textResult.isBlank()) {
                    withContext(Dispatchers.Main) {
                        status = "Repli sur le serveur Heldonica…"
                    }
                    val baseUrl = BuildConfig.CMS_BASE_URL
                    val password = BuildConfig.CMS_PASSWORD

                    val body = MultipartBody.Builder()
                        .setType(MultipartBody.FORM)
                        .addFormDataPart(
                            "image",
                            "photo.jpg",
                            bytes.toRequestBody("image/jpeg".toMediaType())
                        )
                        .addFormDataPart("place_title", placeTitle)
                        .addFormDataPart("notes", notesAutrice)
                        .build()

                    val req = Request.Builder()
                        .url("$baseUrl/api/cms/ai-vision")
                        .header("x-cms-auth", password)
                        .post(body)
                        .build()

                    try {
                        val resp = client.newCall(req).execute()
                        val corps = resp.body?.string().orEmpty()
                        if (resp.isSuccessful) {
                            val json = org.json.JSONObject(corps)
                            val fullText = json.optString("fullText", "")
                            if (fullText.isNotBlank()) {
                                textResult = fullText.trim()
                            }
                        } else {
                            dernierErreur = "CMS HTTP ${resp.code}"
                            Log.w(TAG, "Repli CMS échec: $corps")
                        }
                    } catch (e: Exception) {
                        dernierErreur = e.message ?: "timeout serveur"
                        Log.w(TAG, "Repli CMS exception: ${e.message}")
                    }
                }

                withContext(Dispatchers.Main) {
                    analyseEnCours = false
                    if (textResult.isNotBlank()) {
                        if (notesAutrice.isNotBlank()) texteAvantIa = notesAutrice
                        caption = textResult
                        status = if (notesAutrice.isNotBlank()) "Légende proposée depuis tes notes et ta photo." else "Légende proposée depuis ta photo — le [À TOI] est à toi."
                        copierDansPressePapier(genererCaptionInstagram(), montrerToast = false)
                        Toast.makeText(this@MainActivity, "✨ Légende prête et copiée dans le presse-papier !", Toast.LENGTH_LONG).show()
                    } else {
                        status = "Échec de l'analyse ($dernierErreur)"
                        Toast.makeText(this@MainActivity, "Délai dépassé ($dernierErreur). Touche pour réessayer.", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    analyseEnCours = false
                    status = "Erreur connexion IA : ${e.message}"
                    Log.e(TAG, "Erreur vision globale", e)
                }
            }
        }
    }

    /** Compresse l'image à 800px max avec inSampleSize pour une analyse vision rapide et ultra légère. */
    private fun preparerImagePourVision(uri: Uri): ByteArray? {
        return try {
            // 1. Lire les dimensions sans allouer de bitmap en RAM
            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            contentResolver.openInputStream(uri)?.use { input ->
                BitmapFactory.decodeStream(input, null, options)
            }
            if (options.outWidth <= 0 || options.outHeight <= 0) return null

            // 2. Calcul du sous-échantillonnage optimal (évite OutOfMemory sur 50MP Pixel 8)
            val targetDim = 800
            val maxOriginal = maxOf(options.outWidth, options.outHeight)
            var sampleSize = 1
            while (maxOriginal / (sampleSize * 2) >= targetDim) {
                sampleSize *= 2
            }

            // 3. Décodage allégé en RGB_565
            val decodeOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.RGB_565
            }
            val sampledBitmap = contentResolver.openInputStream(uri)?.use { input ->
                BitmapFactory.decodeStream(input, null, decodeOptions)
            } ?: return null

            // 4. Redimensionnement précis à targetDim (800px max)
            val ratio = minOf(1f, targetDim.toFloat() / maxOf(sampledBitmap.width, sampledBitmap.height))
            val finalBitmap = if (ratio < 1f) {
                Bitmap.createScaledBitmap(
                    sampledBitmap,
                    (sampledBitmap.width * ratio).toInt().coerceAtLeast(1),
                    (sampledBitmap.height * ratio).toInt().coerceAtLeast(1),
                    true
                )
            } else sampledBitmap

            val baos = ByteArrayOutputStream()
            finalBitmap.compress(Bitmap.CompressFormat.JPEG, 75, baos)
            baos.toByteArray()
        } catch (e: Exception) {
            Log.w(TAG, "Erreur compression image vision", e)
            null
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
        envoiEnCours = true
        status = "Envoi en cours…"

        // L'envoi se faisait en aveugle : le travail partait en arriere-plan et
        // rien ne revenait a l'ecran, qu'il reussisse, echoue ou boucle. On
        // suit son etat pour dire ce qui se passe.
        wm.getWorkInfoByIdLiveData(req.id).observe(this) { info ->
            // On ne rouvre le bouton qu'une fois le sort de l'envoi connu :
            // reussi, echoue ou annule. Tant qu'il tourne, reappuyer ferait un
            // second brouillon.
            if (info?.state?.isFinished == true) envoiEnCours = false
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
        // Une chaine vide se scinde en une liste d'un element vide, dont
        // Uri.parse fait un Uri vide et non nul : sans ce filtre, un carnet sans
        // photo partait televerser un fichier inexistant.
        val uris = urisStr.split(",")
            .filter { it.isNotBlank() }
            .mapNotNull { runCatching { Uri.parse(it) }.getOrNull() }
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
            val client = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(300, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .build()

            // Les octets ne passent plus par l'API : les fonctions Vercel
            // plafonnent la requete a 4,5 Mo, et une photo de telephone la
            // depasse souvent — le serveur repondait FUNCTION_PAYLOAD_TOO_LARGE
            // avant meme d'executer la moindre ligne. On demande des URL
            // signees, on depose les fichiers directement dans le stockage,
            // puis on n'envoie a l'API que leur description.
            // Un carnet peut n'avoir aucune photo. Demander des URL signees
            // pour une liste vide echouerait, et l'envoi serait perdu la.
            val deposes = if (uris.isEmpty()) org.json.JSONArray() else {
                televerserDirect(client, baseUrl, password, uris)
                    ?: return Result.failure(workDataOf(ERREUR to "Preparation du televersement impossible"))
            }

            // JSONArray n'expose pas isEmpty() sur Android, seulement length().
            // Zero depose n'est un echec que si des photos etaient attendues.
            if (uris.isNotEmpty() && deposes.length() == 0) {
                return Result.failure(workDataOf(ERREUR to "Aucun media n'a pu etre televerse"))
            }

            val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
            if (deposes.length() > 0) builder.addFormDataPart("uploaded", deposes.toString())
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

        try {
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
                val mime = applicationContext.contentResolver.getType(uri)
                    ?: if (fichier.extension == "mp4") "video/mp4" else "image/jpeg"

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

            return deposes
        } finally {
            // Nettoyage garanti en toutes circonstances : evite les gigaoctets
            // orphelins dans le cache si la connexion coupe ou expire.
            temporaires.forEach { (_, f) -> runCatching { f.delete() } }
        }
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
     * Conserve l'extension approprie (.mp4 pour les videos, .jpg pour les photos).
     */
    private fun copyUriToTemp(uri: Uri): File? {
        return try {
            val input = applicationContext.contentResolver.openInputStream(uri) ?: return null
            val mime = applicationContext.contentResolver.getType(uri).orEmpty()
            val ext = when {
                mime.contains("video") || mime.contains("mp4") -> ".mp4"
                mime.contains("png") -> ".png"
                mime.contains("webp") -> ".webp"
                uri.path?.endsWith(".mp4", ignoreCase = true) == true -> ".mp4"
                else -> ".jpg"
            }
            val tmp = File.createTempFile("heldonica_", ext, applicationContext.cacheDir)
            tmp.outputStream().use { out -> input.copyTo(out) }
            tmp
        } catch (_: Exception) { null }
    }
}
