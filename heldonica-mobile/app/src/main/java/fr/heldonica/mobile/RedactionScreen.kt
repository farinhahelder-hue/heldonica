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

/** Une photo choisie, avec le lieu que Timeline en a déduit (modifiable avant l'ajout). */
private data class PhotoChoisie(
    val uri: Uri,
    val jour: String?,
    val lieu: String,
    val lieuDeTimeline: Boolean,
    val alt: String = ""
)

/**
 * Onglet Rédaction : compléter un brouillon depuis le téléphone.
 *
 * 1. choisir un brouillon (jamais un article publié) ;
 * 2. dicter ses notes, l'IA remplace les `[À TOI : …]` que les notes couvrent ;
 * 3. ajouter des photos : l'historique Google Timeline (export JSON) retrouve où
 *    on était à l'heure de chaque photo, le sélecteur Android ayant retiré le GPS.
 *
 * Rien n'est publié d'ici : l'enregistrement ne touche qu'au contenu.
 */
@Composable
fun RedactionScreen() {
    val contexte = LocalContext.current
    val scope = rememberCoroutineScope()

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
            RedactionClient.listerBrouillons(contexte)
                .onSuccess { brouillons = it; message = null }
                .onFailure { message = it.message }
            occupe = false
        }
    }
    LaunchedEffect(Unit) { charger() }

    val choisirTimeline = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            occupe = true
            // Lecture et analyse hors du fil principal : l'export pèse des dizaines de Mo.
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
                // Nominatim n'accepte qu'une requête par seconde.
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
        // ---- Liste des brouillons ----
        Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Brouillons à compléter", fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                OutlinedButton(onClick = { charger() }, enabled = !occupe) { Text("Actualiser") }
            }
            message?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            if (occupe) LinearProgressIndicator(Modifier.fillMaxWidth())
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(brouillons.orEmpty()) { br ->
                    // clickable plutôt que Card(onClick) : ce dernier est encore expérimental.
                    Card(modifier = Modifier.fillMaxWidth().clickable {
                        choisi = br; contenu = br.contenu; modifie = false
                        notes = ""; proposition = null; photos = emptyList(); message = null
                    }) {
                        Column(Modifier.padding(12.dp)) {
                            Text(br.titre.ifBlank { "(sans titre)" }, fontWeight = FontWeight.SemiBold)
                            Text(
                                if (br.lacunes > 0) "${br.lacunes} à écrire" else "Aucune lacune",
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
        return
    }

    // ---- Un brouillon ouvert ----
    val lacunes = RedactionBrouillon.lacunes(contenu)
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = { if (modifie) confirmerRetour = true else { choisi = null; charger() } }) { Text("← Brouillons") }
            Text(b.titre.ifBlank { "(sans titre)" }, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
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
                    if (lacunes.isEmpty()) "Plus aucune lacune [À TOI]." else "${lacunes.size} lacune(s) à écrire :",
                    fontWeight = FontWeight.SemiBold
                )
                lacunes.forEach { Text("• $it", fontSize = 13.sp) }
                HorizontalDivider(Modifier.padding(vertical = 6.dp))
                Text(RedactionBrouillon.texteBrut(contenu), fontSize = 14.sp)
            }
        }

        // ---- Notes + IA ----
        Text("Ce que vous avez vécu", fontWeight = FontWeight.SemiBold)
        OutlinedTextField(
            value = notes, onValueChange = { notes = it },
            modifier = Modifier.fillMaxWidth(), minLines = 4,
            placeholder = { Text("Dicte ici (micro du clavier) : odeurs, lumière, prix payé, ce qu'on a moins aimé…") }
        )
        Button(
            enabled = !occupe && lacunes.isNotEmpty() && notes.trim().length >= 30,
            onClick = {
                occupe = true; message = null
                scope.launch {
                    RedactionClient.completer(contexte, contenu, notes, sejours.mapNotNull { it.nom }.distinct())
                        .onSuccess { proposition = it }
                        .onFailure { message = it.message }
                    occupe = false
                }
            }
        ) { Text("✨ Compléter avec mes notes") }

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

        // ---- Photos + Timeline ----
        Text("Photos", fontWeight = FontWeight.SemiBold)
        Text(
            if (sejours.isEmpty()) "Timeline non chargée : le lieu sera à écrire pour chaque photo."
            else "Timeline : ${sejours.size} séjours chargés.",
            fontSize = 13.sp
        )
        OutlinedButton(onClick = { choisirTimeline.launch(arrayOf("*/*")) }, enabled = !occupe) {
            Text("📍 Charger l'export Timeline (JSON)")
        }
        OutlinedButton(
            onClick = { choisirPhotos.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
            enabled = !occupe
        ) { Text("🖼 Choisir des photos") }

        photos.forEachIndexed { i, ph ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Photo ${i + 1} — ${ph.jour ?: "date inconnue"}", fontSize = 13.sp)
                    OutlinedTextField(
                        value = ph.lieu,
                        onValueChange = { v -> photos = photos.toMutableList().also { it[i] = ph.copy(lieu = v, lieuDeTimeline = false) } },
                        label = { Text(if (ph.lieuDeTimeline) "Lieu (d'après Timeline — à vérifier)" else "Lieu (à écrire)") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = ph.alt,
                        onValueChange = { v -> photos = photos.toMutableList().also { it[i] = ph.copy(alt = v) } },
                        label = { Text("Ce que montre la photo") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    TextButton(onClick = { photos = photos.filterIndexed { j, _ -> j != i } }) { Text("Retirer") }
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
                                message = "${blocs.size} photo(s) ajoutée(s) au brouillon. Pense à enregistrer."
                            }
                            .onFailure { message = it.message }
                        occupe = false
                    }
                }
            ) { Text("Ajouter ${photos.size} photo(s) au brouillon") }
        }

        HorizontalDivider()
        Button(
            enabled = !occupe && modifie,
            onClick = {
                occupe = true
                scope.launch {
                    RedactionClient.enregistrer(contexte, b.id, contenu)
                        .onSuccess { modifie = false; message = "Enregistré. L'article reste en brouillon." }
                        .onFailure { message = it.message }
                    occupe = false
                }
            }
        ) { Text(if (modifie) "💾 Enregistrer le brouillon" else "Rien à enregistrer") }
    }
}
