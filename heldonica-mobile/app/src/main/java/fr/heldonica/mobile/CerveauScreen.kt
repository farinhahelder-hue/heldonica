package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
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
 * - Fonctionnement double mode : Cloud 0€ (PC éteint) ou Station PC locale (si détectée sur le LAN).
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

    val messages = remember {
        mutableStateListOf(
            MessageCerveau(
                estUtilisateur = false,
                texte = "Bonjour. Je suis le Cerveau Heldonica sur ton Poco X6 Pro.\n\n" +
                        "Le PC peut rester éteint : je tourne en Cloud 0€ sécurisé.\n" +
                        "Choisis un mode ci-dessus ou écris-moi directement.",
                fournisseur = "cloud-0€"
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

    fun envoyerMessage(invite: String) {
        val textePropre = invite.trim()
        if (textePropre.isBlank() || chargementEnCours) return

        texteSaisie = ""
        val msgUser = MessageCerveau(estUtilisateur = true, texte = textePropre)
        messages.add(msgUser)
        chargementEnCours = true

        portee.launch {
            try {
                val reponse = BrainClient.interrogerCerveau(
                    cmsBaseUrl = cmsBaseUrl,
                    brainBaseUrl = brainBaseUrl,
                    message = textePropre,
                    mode = modeActif.cle,
                    historique = messages.toList(),
                    forcerStationPc = forcerPc && stationPcDetectee,
                    authSecret = motDePasse
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
                                if (forcerPc) "Mode PC Local activé" else "Mode Cloud 0€ actif",
                                Toast.LENGTH_SHORT
                            ).show()
                        } else {
                            Toast.makeText(
                                context,
                                "Cloud 0€ actif (Station PC hors ligne ou non détectée)",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    },
                    label = {
                        Text(
                            text = if (forcerPc && stationPcDetectee) "💻 PC LAN" else if (stationPcDetectee) "🟢 Cloud (PC dispo)" else "🟢 Cloud 0€",
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

        // Alerte si mot de passe non configuré (APK issu de la CI sans secret)
        if (motDePasse.isBlank()) {
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
                else -> listOf("💡 Idée d'itinéraire", "📊 État des tâches")
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
