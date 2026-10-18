package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/**
 * Interface native Jetpack Compose du Cerveau Heldonica pour Xiaomi Poco X6 Pro.
 *
 * Caractéristiques :
 * - Rendu fluide 120 Hz sur écran Flow AMOLED (1220x2712).
 * - Petit modèle embarqué par défaut (CerveauLocal) ; interrupteur « Cerveau boosté » pour les
 *   API gratuites (Cloud 0€) ; Station PC locale si détectée sur le LAN.
 * - Sélecteur de mode ergonomique : Copilote TSA/ADHD, Terrain, Savoirs, Discussion libre.
 * - Zéro clé d'API embarquée dans l'APK.
 */

data class VaultRecordItem(
    val id: String,
    val category: String,
    val title: String,
    val content: String,
    val location: String? = null
)

fun chargerVaultDepuisAssets(context: Context): List<VaultRecordItem> {
    return try {
        val jsonStr = context.assets.open("knowledge_vault.json").bufferedReader().use { it.readText() }
        val root = JSONObject(jsonStr)
        val arr = root.optJSONArray("records") ?: JSONArray()
        val list = mutableListOf<VaultRecordItem>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            list.add(
                VaultRecordItem(
                    id = obj.optString("id"),
                    category = obj.optString("category"),
                    title = obj.optString("title"),
                    content = obj.optString("content"),
                    location = if (obj.has("location")) obj.optString("location") else null
                )
            )
        }
        list
    } catch (e: Exception) {
        emptyList()
    }
}

data class ModeCerveau(
    val cle: String,
    val titre: String,
    val emoji: String,
    val description: String
)

val MODES_DISPONIBLES = listOf(
    ModeCerveau("coach", "Copilote TSA", "🧠", "1 seule action concrète (5-15-30 min), énergie basse"),
    ModeCerveau("terrain", "Récit & Terrain", "🧭", "Ciseler des notes réelles sans inventer"),
    ModeCerveau("vault", "Savoirs", "📚", "Interroger le registre et les pépites vérifiées"),
    ModeCerveau("chat", "Échange Libre", "💬", "Discussion dans la posture officielle Heldonica")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CerveauScreen(
    cmsBaseUrl: String = BuildConfig.CMS_BASE_URL,
    brainBaseUrl: String = BuildConfig.BRAIN_BASE_URL
) {
    val context = LocalContext.current
    val portee = rememberCoroutineScope()
    val scrollState = rememberLazyListState()
    val vaultRecords = remember { chargerVaultDepuisAssets(context) }

    var motDePasse by remember { mutableStateOf(BrainClient.obtenirMotDePasse(context)) }
    var afficherDialogueConfig by remember { mutableStateOf(false) }
    var saisieMotDePasse by remember { mutableStateOf("") }

    var modeActif by remember { mutableStateOf(MODES_DISPONIBLES.first()) }
    var texteSaisie by remember { mutableStateOf("") }
    var chargementEnCours by remember { mutableStateOf(false) }
    var stationPcDetectee by remember { mutableStateOf(false) }
    var forcerPc by remember { mutableStateOf(false) }
    var booste by remember { mutableStateOf(BrainClient.estBooste(context)) }
    var modeleLocal by remember { mutableStateOf(CerveauLocal.fichierModele(context)?.nameWithoutExtension) }
    var importEnCours by remember { mutableStateOf(false) }
    val telechargement by CerveauLocal.telechargement.collectAsState()

    LaunchedEffect(telechargement.termine) {
        telechargement.termine?.let {
            modeleLocal = it.nameWithoutExtension
            Toast.makeText(context, "Modèle prêt : le Cerveau répond sur le téléphone", Toast.LENGTH_SHORT).show()
        }
    }

    fun nomDuFichier(uri: Uri): String? =
        context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { c -> if (c.moveToFirst()) c.getString(0) else null }

    val selecteurModele = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        importEnCours = true
        portee.launch {
            try {
                val fichier = CerveauLocal.importerModele(context, uri, nomDuFichier(uri))
                modeleLocal = fichier.nameWithoutExtension
                Toast.makeText(context, "Modèle installé : ${fichier.name}", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(context, "Import impossible : ${e.localizedMessage}", Toast.LENGTH_LONG).show()
            } finally {
                importEnCours = false
            }
        }
    }

    val messages = remember {
        mutableStateListOf(
            MessageCerveau(
                estUtilisateur = false,
                texte = "Bonjour. Je suis le Cerveau Heldonica sur ton Poco X6 Pro.\n\n" +
                        "Le PC peut rester éteint : je réponds avec le modèle du téléphone, " +
                        "et ⚡ Cerveau boosté passe par les API gratuites quand il faut plus de finesse.\n" +
                        "Choisis un mode ci-dessus ou écris-moi directement.",
                fournisseur = "telephone"
            )
        )
    }

    // Détection en tâche de fond de la station PC locale (port 8440)
    LaunchedEffect(brainBaseUrl) {
        stationPcDetectee = BrainClient.verifierStationPcDisponible(brainBaseUrl)
    }

    // Défilement automatique au bas de la liste à chaque nouveau message
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            scrollState.animateScrollToItem(messages.size - 1)
        }
    }

    fun copierTexte(texte: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Cerveau Heldonica", texte))
        Toast.makeText(context, "Copié dans le presse-papier", Toast.LENGTH_SHORT).show()
    }

    suspend fun executerCommande(commande: CommandeAgent): Pair<String, Boolean> = when (commande) {
        is CommandeAgent.Confier ->
            AgentTasksClient.deposerTache(context, commande.agent, commande.consigne).fold(
                { id ->
                    "✅ Tâche confiée à ${commande.agent} (#$id) :\n${commande.consigne}\n\n" +
                        "Elle attend dans le registre : ${commande.agent} la prendra à sa prochaine lecture." to false
                },
                { e -> "⚠️ Dépôt impossible : ${e.message}" to true }
            )
        is CommandeAgent.Valider ->
            AgentTasksClient.validerTache(context, commande.id, true, commande.commentaire).fold(
                { t -> "✅ Tâche #${t.id} (${t.agent}) validée : ${t.task}" to false },
                { e -> "⚠️ Validation impossible : ${e.message}" to true }
            )
        is CommandeAgent.Renvoyer ->
            AgentTasksClient.validerTache(context, commande.id, false, commande.commentaire).fold(
                { t -> "↩️ Tâche #${t.id} renvoyée à ${t.agent}${if (commande.commentaire.isNotBlank()) " : ${commande.commentaire}" else ""}" to false },
                { e -> "⚠️ Renvoi impossible : ${e.message}" to true }
            )
    }

    fun envoyerMessage(invite: String) {
        val textePropre = invite.trim()
        if (textePropre.isBlank() || chargementEnCours) return

        texteSaisie = ""
        val msgUser = MessageCerveau(estUtilisateur = true, texte = textePropre)
        messages.add(msgUser)
        chargementEnCours = true

        // Ordre explicite (« @jules … », « valide #ab12 ») : exécuté sur le registre,
        // sans passer par le modèle.
        val commande = CoordinationAgents.analyser(textePropre)
        if (commande != null) {
            portee.launch {
                val (texte, erreur) = executerCommande(commande)
                messages.add(
                    MessageCerveau(
                        estUtilisateur = false,
                        texte = texte,
                        fournisseur = "🗂️ Registre des agents",
                        estErreur = erreur
                    )
                )
                chargementEnCours = false
            }
            return
        }

        val historiqueEnvoi = messages.toList()
        val modeEnvoi = modeActif.cle
        var contexteAgents: String? = null
        val repondreLocalement: (suspend () -> ReponseCerveau)? =
            if (modeleLocal == null) null else suspend {
                CerveauLocal.repondre(
                    context = context,
                    message = textePropre,
                    mode = modeEnvoi,
                    historique = historiqueEnvoi,
                    fiches = vaultRecords,
                    contexte = contexteAgents
                )
            }

        portee.launch {
            try {
                // Question sur les agents : le modèle reçoit le registre, il ne le devine pas.
                if (CoordinationAgents.concerneLesAgents(textePropre)) {
                    AgentTasksClient.chargerTaches(context)
                        .onSuccess { contexteAgents = CoordinationAgents.resumerRegistre(it) }
                        .onFailure { contexteAgents = "Registre des agents illisible : ${it.message}" }
                }
                val reponse = BrainClient.interrogerCerveau(
                    cmsBaseUrl = cmsBaseUrl,
                    brainBaseUrl = brainBaseUrl,
                    message = contexteAgents?.let { "$textePropre\n\n$it" } ?: textePropre,
                    mode = modeActif.cle,
                    historique = messages.toList(),
                    forcerStationPc = forcerPc && stationPcDetectee,
                    authSecret = motDePasse,
                    booste = booste,
                    repondreLocalement = repondreLocalement
                )
                messages.add(
                    MessageCerveau(
                        estUtilisateur = false,
                        texte = reponse.texte,
                        fournisseur = "${reponse.source.badge} • ${reponse.modele}"
                    )
                )
            } catch (e: Exception) {
                messages.add(
                    MessageCerveau(
                        estUtilisateur = false,
                        texte = "⚠️ ${e.localizedMessage ?: "Erreur de communication"}",
                        estErreur = true
                    )
                )
            } finally {
                chargementEnCours = false
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9F8F5)) // Cloud Dancer fond doux
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        // En-tête : Titre & Badge de connexion
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "🧠 Heldonica Brain",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF2C4C38) // Vert Eucalyptus signature
                )
                Text(
                    text = modeActif.description,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Badge d'état réseau
                AssistChip(
                    onClick = {
                        if (stationPcDetectee) {
                            forcerPc = !forcerPc
                            Toast.makeText(
                                context,
                                if (forcerPc) "Mode PC Local activé" else "Mode PC Local désactivé",
                                Toast.LENGTH_SHORT
                            ).show()
                        } else {
                            Toast.makeText(
                                context,
                                "Station PC hors ligne ou non détectée",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    },
                    label = {
                        Text(
                            text = when {
                                forcerPc && stationPcDetectee -> "💻 PC LAN"
                                booste -> if (stationPcDetectee) "🟢 Cloud (PC dispo)" else "🟢 Cloud 0€"
                                else -> if (stationPcDetectee) "📱 Poco (PC dispo)" else "📱 Poco"
                            },
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                )

                // Bouton Configuration Mot de passe CMS
                IconButton(
                    onClick = {
                        saisieMotDePasse = motDePasse
                        afficherDialogueConfig = true
                    },
                    modifier = Modifier.size(32.dp)
                ) {
                    Text(
                        text = if (motDePasse.isBlank()) "🔑" else "⚙️",
                        fontSize = 14.sp
                    )
                }
            }
        }

        // Modèle embarqué + interrupteur Cerveau boosté
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1EFEA)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            shape = RoundedCornerShape(8.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "⚡ Cerveau boosté (API gratuites)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF2C4C38),
                        modifier = Modifier.weight(1f)
                    )
                    Switch(
                        checked = booste,
                        onCheckedChange = {
                            booste = it
                            BrainClient.definirBooste(context, it)
                        },
                        colors = SwitchDefaults.colors(checkedTrackColor = Color(0xFF2C4C38))
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = when {
                            importEnCours -> "Import du modèle en cours…"
                            telechargement.enCours -> "Téléchargement : %.2f / %.1f Go".format(
                                telechargement.octets / 1e9, telechargement.total / 1e9
                            )
                            telechargement.erreur != null && modeleLocal == null ->
                                "⚠️ Téléchargement interrompu : ${telechargement.erreur}"
                            modeleLocal != null -> "📱 Modèle du téléphone : $modeleLocal"
                            else -> "📱 Aucun modèle — Qwen 1.5B, 1,6 Go (Wi-Fi conseillé)"
                        },
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        modifier = Modifier.weight(1f)
                    )
                    if (modeleLocal == null) {
                        TextButton(
                            onClick = { CerveauLocal.telechargerModeleConseille(context) },
                            enabled = !telechargement.enCours && !importEnCours
                        ) {
                            Text(
                                text = if (telechargement.octets > 0) "Reprendre" else "Télécharger",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF2C4C38)
                            )
                        }
                    }
                    TextButton(
                        onClick = { selecteurModele.launch(arrayOf("*/*")) },
                        enabled = !importEnCours && !chargementEnCours && !telechargement.enCours
                    ) {
                        Text(
                            text = if (modeleLocal == null) "Importer" else "Changer",
                            fontSize = 11.sp,
                            color = Color(0xFF2C4C38)
                        )
                    }
                }
                if (telechargement.enCours) {
                    LinearProgressIndicator(
                        progress = { telechargement.fraction },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 4.dp),
                        color = Color(0xFF2C4C38)
                    )
                }
            }
        }

        // Alerte si mot de passe non configuré (APK issu de la CI sans secret)
        if (booste && motDePasse.isBlank()) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3CD)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "🔑 Mot de passe CMS requis pour le Cloud 0€",
                        fontSize = 11.sp,
                        color = Color(0xFF856404)
                    )
                    TextButton(onClick = {
                        saisieMotDePasse = ""
                        afficherDialogueConfig = true
                    }) {
                        Text("Saisir", fontSize = 11.sp, color = Color(0xFF2C4C38), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Sélecteur de mode (Chips horizontaux)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            MODES_DISPONIBLES.forEach { mode ->
                val estSelectionne = (mode.cle == modeActif.cle)
                FilterChip(
                    selected = estSelectionne,
                    onClick = { modeActif = mode },
                    label = { Text("${mode.emoji} ${mode.titre}", fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF2C4C38),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Suggestions rapides
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val suggestions = when (modeActif.cle) {
                "coach" -> listOf("⚡ Action 15 min", "🌱 Version énergie basse")
                "terrain" -> listOf("✍️ Ciseler notes de route", "📷 Légende Instagram")
                "vault" -> listOf("🔍 Pépites Madère", "🇷🇴 Bucarest secret")
                else -> listOf("📊 État des tâches", "✅ Qu'est-ce qui attend ma validation ?")
            }
            suggestions.forEach { suggestion ->
                SuggestionChip(
                    onClick = { envoyerMessage(suggestion) },
                    label = { Text(suggestion, fontSize = 10.sp) }
                )
            }
        }

        // Coffre Hors-Ligne (visible en mode Savoirs)
        if (modeActif.cle == "vault" && vaultRecords.isNotEmpty()) {
            Text(
                text = "📚 Coffre Hors-Ligne (${vaultRecords.size} fiches certifiées)",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF2C4C38),
                modifier = Modifier.padding(bottom = 4.dp)
            )
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(vaultRecords, key = { it.id }) { rec ->
                    Card(
                        onClick = { envoyerMessage("Détaille la fiche : ${rec.title}") },
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF1EFEA)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.widthIn(max = 220.dp)
                    ) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            Text(
                                text = "${rec.category} • ${rec.title}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                color = Color(0xFF2C4C38)
                            )
                            if (!rec.location.isNullOrBlank()) {
                                Text(
                                    text = rec.location,
                                    fontSize = 9.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = rec.content,
                                fontSize = 10.sp,
                                maxLines = 2,
                                color = Color(0xFF333333)
                            )
                        }
                    }
                }
            }
        }

        // Fil de discussion
        LazyColumn(
            state = scrollState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(vertical = 4.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                BulleMessage(
                    message = msg,
                    onCopier = { copierTexte(msg.texte) }
                )
            }
            if (chargementEnCours) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = Color(0xFF2C4C38)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Le Cerveau réfléchit...",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        // Barre de saisie
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = texteSaisie,
                onValueChange = { texteSaisie = it },
                placeholder = { Text("Écrire au Cerveau...", fontSize = 13.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                maxLines = 4,
                enabled = !chargementEnCours,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF2C4C38),
                    unfocusedBorderColor = Color(0xFFD4CFBF)
                )
            )

            Button(
                onClick = { envoyerMessage(texteSaisie) },
                enabled = texteSaisie.isNotBlank() && !chargementEnCours,
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2C4C38)),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text("Envoyer", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }

    if (afficherDialogueConfig) {
        AlertDialog(
            onDismissRequest = { afficherDialogueConfig = false },
            title = { Text("Accès CMS Heldonica", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text(
                        text = "Ce mot de passe est conservé localement sur ton Poco X6 Pro pour authentifier les requêtes vers le serveur (0 secret compilé dans l'APK).",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = saisieMotDePasse,
                        onValueChange = { saisieMotDePasse = it },
                        placeholder = { Text("Mot de passe CMS...") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val mdpNettoye = saisieMotDePasse.trim()
                        BrainClient.sauvegarderMotDePasse(context, mdpNettoye)
                        motDePasse = mdpNettoye
                        afficherDialogueConfig = false
                        Toast.makeText(context, "Mot de passe CMS enregistré sur l'appareil", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2C4C38))
                ) {
                    Text("Enregistrer")
                }
            },
            dismissButton = {
                TextButton(onClick = { afficherDialogueConfig = false }) {
                    Text("Annuler")
                }
            }
        )
    }
}

@Composable
fun BulleMessage(
    message: MessageCerveau,
    onCopier: () -> Unit
) {
    val alignement = if (message.estUtilisateur) Arrangement.End else Arrangement.Start
    val fondCouleur = when {
        message.estErreur -> MaterialTheme.colorScheme.errorContainer
        message.estUtilisateur -> Color(0xFF2C4C38) // Vert Eucalyptus
        else -> Color(0xFFFFFFFF) // Blanc pur sur fond Cloud Dancer
    }
    val texteCouleur = when {
        message.estErreur -> MaterialTheme.colorScheme.onErrorContainer
        message.estUtilisateur -> Color.White
        else -> Color(0xFF1E2522)
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = alignement
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 320.dp),
            shape = RoundedCornerShape(
                topStart = 14.dp,
                topEnd = 14.dp,
                bottomStart = if (message.estUtilisateur) 14.dp else 2.dp,
                bottomEnd = if (message.estUtilisateur) 2.dp else 14.dp
            ),
            colors = CardDefaults.cardColors(containerColor = fondCouleur),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = message.texte,
                    fontSize = 13.sp,
                    color = texteCouleur,
                    lineHeight = 18.sp
                )

                if (!message.estUtilisateur && message.fournisseur != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = message.fournisseur,
                            fontSize = 10.sp,
                            color = Color(0xFF7A867F)
                        )
                        TextButton(
                            onClick = onCopier,
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp)
                        ) {
                            Text("Copier", fontSize = 10.sp, color = Color(0xFF2C4C38))
                        }
                    }
                }
            }
        }
    }
}
