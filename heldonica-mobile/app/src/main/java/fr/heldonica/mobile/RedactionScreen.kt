package fr.heldonica.mobile

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId

/** Une photo choisie, avec le lieu que Timeline ou Vision en a déduit (modifiable avant l'ajout). */
private data class PhotoChoisie(
    val uri: Uri,
    val jour: String?,
    val lieu: String,
    val lieuDeTimeline: Boolean,
    val alt: String = ""
)

/**
 * Onglet Rédaction : enrichir ou compléter un article/carnet depuis le téléphone.
 *
 * 1. choisir un article (brouillon ou publié) ;
 * 2. dicter ses notes réelles, l'IA remplace les `[À TOI : …]` et polit la voix de marque ;
 * 3. ajouter des photos : l'historique Google Timeline ou l'IA Vision retrouve le lieu et décrit la scène.
 */
@Composable
fun RedactionScreen() {
    val contexte = LocalContext.current
    val scope = rememberCoroutineScope()

    var filtreStatut by remember { mutableStateOf("all") }
    var brouillons by remember { mutableStateOf<List<Brouillon>?>(null) }
    var choisi by remember { mutableStateOf<Brouillon?>(null) }
    var contenu by remember { mutableStateOf("") }
    var modifie by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var occupe by remember { mutableStateOf(false) }

    var notes by remember { mutableStateOf("") }
    var proposition by remember { mutableStateOf<PropositionIa?>(null) }

    var sejours by remember { mutableStateOf<List<SejourTimeline>>(emptyList()) }
    var photos by remember { mutableStateOf<List<PhotoChoisie>>(emptyList()) }
    var confirmerRetour by remember { mutableStateOf(false) }
    var sansEnfant by remember { mutableStateOf(false) }

    fun charger() {
        occupe = true
        scope.launch {
            RedactionClient.listerBrouillons(contexte, filtreStatut)
                .onSuccess { brouillons = it; message = null }
                .onFailure { message = it.message }
            occupe = false
        }
    }
    LaunchedEffect(filtreStatut) { charger() }

    val choisirTimeline = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            occupe = true
            val lus = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                runCatching {
                    contexte.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
                        ?.let { TimelineGoogle.analyser(it) }
                }.getOrNull()
            }
            occupe = false
            if (lus.isNullOrEmpty()) {
                message = "Aucun séjour lisible dans ce fichier. Il faut l'export Timeline : " +
                    "Paramètres → Position → Services de position → Timeline → Exporter."
            } else {
                sejours = lus
                message = "Timeline chargée : ${lus.size} séjours."
            }
        }
    }

    val choisirPhotos = rememberLauncherForActivityResult(
        ActivityResultContracts.PickMultipleVisualMedia(10)
    ) { uris ->
        if (uris.isEmpty()) return@rememberLauncherForActivityResult
        scope.launch {
            if (photos.size + uris.size > 10) {
                message = "10 photos maximum par ajout : retire-en avant d'en choisir d'autres."
                return@launch
            }
            val ajoutees = uris.mapIndexed { n, uri ->
                if (n > 0) kotlinx.coroutines.delay(1100)
                val brut = RedactionClient.dateExif(contexte, uri)
                val instant = TimelineGoogle.instantExif(brut)
                val sejour = instant?.let { TimelineGoogle.sejourPour(sejours, it) }
                val lieu = sejour?.nom ?: sejour?.let { RedactionClient.nomDuLieu(it.lat, it.lng) }
                val jour = instant?.let { Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate().toString() }
                PhotoChoisie(uri, jour, lieu.orEmpty(), lieuDeTimeline = lieu != null)
            }
            photos = photos + ajoutees
        }
    }

    val b = choisi
    if (b == null) {
        // ---- Liste des articles / carnets ----
        Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Articles & Carnets", fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                OutlinedButton(onClick = { charger() }, enabled = !occupe) { Text("Actualiser") }
            }

            // Filtres par statut
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                FilterChip(
                    selected = (filtreStatut == "all"),
                    onClick = { filtreStatut = "all" },
                    label = { Text("Tous", fontSize = 12.sp) }
                )
                FilterChip(
                    selected = (filtreStatut == "draft"),
                    onClick = { filtreStatut = "draft" },
                    label = { Text("Brouillons", fontSize = 12.sp) }
                )
                FilterChip(
                    selected = (filtreStatut == "published"),
                    onClick = { filtreStatut = "published" },
                    label = { Text("En ligne (publiés)", fontSize = 12.sp) }
                )
            }

            message?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            if (occupe) LinearProgressIndicator(Modifier.fillMaxWidth())

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(brouillons.orEmpty()) { br ->
                    Card(modifier = Modifier.fillMaxWidth().clickable {
                        choisi = br; contenu = br.contenu; modifie = false
                        notes = ""; proposition = null; photos = emptyList(); message = null
                    }) {
                        Column(Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    br.titre.ifBlank { "(sans titre)" },
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 15.sp,
                                    modifier = Modifier.weight(1f)
                                )
                                Surface(
                                    shape = MaterialTheme.shapes.small,
                                    color = if (br.published) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.secondaryContainer,
                                    modifier = Modifier.padding(start = 8.dp)
                                ) {
                                    Text(
                                        if (br.published) "🟢 En ligne" else "🟡 Brouillon",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                if (br.lacunes > 0) "${br.lacunes} lacune(s) [À TOI] à combler" else "Récit complet • Prêt à enrichir",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            }
        }
        return
    }

    // ---- Un article ouvert ----
    val lacunes = RedactionBrouillon.lacunes(contenu)
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = { if (modifie) confirmerRetour = true else { choisi = null; charger() } }) { Text("← Liste") }
            Column(Modifier.weight(1f)) {
                Text(b.titre.ifBlank { "(sans titre)" }, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(
                    if (b.published) "🟢 En ligne sur heldonica.fr" else "🟡 Brouillon",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }

        FilledTonalButton(
            onClick = {
                contexte.startActivity(
                    android.content.Intent(contexte, EditeurActivity::class.java).putExtra(
                        EditeurActivity.EXTRA_CHEMIN, "/panel-manager?section=articles&articleId=${b.id}"
                    )
                )
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("⚡ Ouvrir dans le Studio CMS 3.0 (Blocs & Hotspots)", fontSize = 12.sp)
        }

        if (confirmerRetour) {
            AlertDialog(
                onDismissRequest = { confirmerRetour = false },
                title = { Text("Modifications non enregistrées") },
                text = { Text("Si tu reviens à la liste, ce qui a été complété ou ajouté ici sera perdu.") },
                confirmButton = {
                    TextButton(onClick = { confirmerRetour = false; modifie = false; choisi = null; charger() }) { Text("Abandonner") }
                },
                dismissButton = { TextButton(onClick = { confirmerRetour = false }) { Text("Rester") } }
            )
        }

        message?.let { Text(it, color = MaterialTheme.colorScheme.primary) }
        if (occupe) LinearProgressIndicator(Modifier.fillMaxWidth())

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    if (lacunes.isEmpty()) "Aucune lacune [À TOI]." else "${lacunes.size} lacune(s) à écrire :",
                    fontWeight = FontWeight.SemiBold
                )
                lacunes.forEach { Text("• $it", fontSize = 13.sp) }
                HorizontalDivider(Modifier.padding(vertical = 6.dp))
                Text(RedactionBrouillon.texteBrut(contenu), fontSize = 14.sp)
            }
        }

        // ---- Notes + IA ----
        Text("Notes de terrain & vécu", fontWeight = FontWeight.SemiBold)
        OutlinedTextField(
            value = notes, onValueChange = { notes = it },
            modifier = Modifier.fillMaxWidth(), minLines = 4,
            placeholder = { Text("Dicte ici (micro du clavier) : odeurs, lumière, textures, ce que tu as ressenti…") }
        )
        Button(
            enabled = !occupe && (lacunes.isNotEmpty() || contenu.isNotBlank()) && notes.trim().length >= 15,
            onClick = {
                occupe = true; message = null
                scope.launch {
                    RedactionClient.completer(contexte, contenu, notes, sejours.mapNotNull { it.nom }.distinct())
                        .onSuccess { proposition = it }
                        .onFailure { message = it.message }
                    occupe = false
                }
            }
        ) { Text("✨ Compléter / Enrichir avec mes notes (IA)") }

        proposition?.let { p ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Proposition de l'IA (à relire)", fontWeight = FontWeight.SemiBold)
                    if (p.ajoutsNonSources.isNotEmpty()) {
                        Text(
                            "⚠️ Ajouté par l'IA, absent de tes notes : " + p.ajoutsNonSources.joinToString(" ; "),
                            color = MaterialTheme.colorScheme.error, fontSize = 13.sp
                        )
                    }
                    Text(RedactionBrouillon.texteBrut(p.contenu), fontSize = 14.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { contenu = p.contenu; modifie = true; proposition = null; notes = "" }) { Text("Garder") }
                        OutlinedButton(onClick = { proposition = null }) { Text("Ignorer") }
                    }
                }
            }
        }

        HorizontalDivider()

        // ---- Photos + Timeline / Vision ----
        Text("Photos du carnet", fontWeight = FontWeight.SemiBold)
        Text(
            if (sejours.isEmpty()) "Timeline non chargée : tu peux identifier chaque photo via l'IA Vision ou saisir le lieu."
            else "Timeline : ${sejours.size} séjours chargés.",
            fontSize = 13.sp
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { choisirTimeline.launch(arrayOf("*/*")) }, enabled = !occupe, modifier = Modifier.weight(1f)) {
                Text("📍 Timeline (JSON)", fontSize = 11.sp)
            }
            Button(
                onClick = { choisirPhotos.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                enabled = !occupe,
                modifier = Modifier.weight(1f)
            ) { Text("🖼 Choisir photos", fontSize = 11.sp) }
        }

        photos.forEachIndexed { i, ph ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Photo ${i + 1} — ${ph.jour ?: "date inconnue"}", fontSize = 13.sp)
                    OutlinedTextField(
                        value = ph.lieu,
                        onValueChange = { v -> photos = photos.toMutableList().also { it[i] = ph.copy(lieu = v, lieuDeTimeline = false) } },
                        label = { Text(if (ph.lieuDeTimeline) "Lieu (Timeline)" else "Lieu") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = ph.alt,
                        onValueChange = { v -> photos = photos.toMutableList().also { it[i] = ph.copy(alt = v) } },
                        label = { Text("Description de la photo") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedButton(
                            onClick = {
                                scope.launch {
                                    occupe = true
                                    RedactionClient.identifierParVision(contexte, ph.uri)
                                        .onSuccess { (lieuDetecte, descDetectee) ->
                                            photos = photos.toMutableList().also { list ->
                                                val lieuFinal = if (ph.lieu.isBlank()) lieuDetecte else ph.lieu
                                                val altFinal = if (ph.alt.isBlank()) descDetectee else ph.alt
                                                list[i] = ph.copy(lieu = lieuFinal, alt = altFinal, lieuDeTimeline = false)
                                            }
                                            message = "Photo identifiée par IA Vision : $lieuDetecte"
                                        }
                                        .onFailure { err ->
                                            message = "Échec Vision IA : ${err.message}"
                                        }
                                    occupe = false
                                }
                            },
                            enabled = !occupe
                        ) {
                            Text("🔍 Identifier (IA Vision)", fontSize = 11.sp)
                        }
                        TextButton(onClick = { photos = photos.filterIndexed { j, _ -> j != i } }) { Text("Retirer") }
                    }
                }
            }
        }

        if (photos.isNotEmpty()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = sansEnfant, onCheckedChange = { sansEnfant = it })
                Text("J'ai regardé : aucun enfant n'apparaît sur ces photos.", fontSize = 13.sp)
            }
            Button(
                enabled = !occupe && sansEnfant,
                onClick = {
                    occupe = true; message = null
                    scope.launch {
                        RedactionClient.televerser(contexte, photos.map { it.uri })
                            .onSuccess { urls ->
                                val blocs = photos.zip(urls).map { (ph, url) ->
                                    RedactionBrouillon.blocPhoto(url, ph.alt, ph.lieu, ph.jour)
                                }
                                contenu = RedactionBrouillon.ajouterPhotos(contenu, blocs)
                                modifie = true; photos = emptyList(); sansEnfant = false
                                message = "${blocs.size} photo(s) ajoutée(s) au carnet. Pense à enregistrer."
                            }
                            .onFailure { message = it.message }
                        occupe = false
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Ajouter ${photos.size} photo(s) au carnet") }
        }

        HorizontalDivider()
        Button(
            enabled = !occupe && modifie,
            onClick = {
                occupe = true
                scope.launch {
                    RedactionClient.enregistrer(contexte, b.id, contenu)
                        .onSuccess {
                            modifie = false
                            message = if (b.published) "Enregistré et mis à jour en ligne sur heldonica.fr !" else "Enregistré. L'article reste en brouillon."
                        }
                        .onFailure { message = it.message }
                    occupe = false
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text(if (modifie) "💾 Enregistrer les modifications" else "Rien à enregistrer") }
    }
}
