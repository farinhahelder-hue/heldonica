package fr.heldonica.mobile

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Modèle de données pour une tâche d'agent du registre Heldonica.
 */
data class TacheAgentItem(
    val id: String,
    val idComplet: String,
    val agent: String,
    val status: String,
    val task: String,
    val scope: String?,
    val riskLevel: String?,
    val claimedBy: String?,
    val createdAt: String?
)

/**
 * Client réseau pour piloter le registre des agents depuis le Poco X6 Pro.
 * Zéro secret compilé : lit le mot de passe dans SharedPreferences (configuré dans l'onglet Cerveau).
 */
object AgentTasksClient {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun chargerTaches(
        context: Context,
        statutFiltre: String = "all",
        agentFiltre: String? = null
    ): Result<List<TacheAgentItem>> = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val mdp = BrainClient.obtenirMotDePasse(context)
        if (mdp.isBlank()) {
            return@withContext Result.failure(Exception("Mot de passe CMS non configuré"))
        }

        val urlBuilder = StringBuilder("$baseUrl/api/agent-tasks?limit=50")
        if (statutFiltre != "all") {
            urlBuilder.append("&status=").append(statutFiltre)
        }
        if (!agentFiltre.isNullOrBlank() && agentFiltre != "tous") {
            urlBuilder.append("&agent=").append(agentFiltre)
        }

        try {
            val req = Request.Builder()
                .url(urlBuilder.toString())
                .header("x-cms-auth", mdp)
                .get()
                .build()

            httpClient.newCall(req).execute().use { res ->
                val bodyStr = res.body?.string().orEmpty()
                if (!res.isSuccessful) {
                    return@withContext Result.failure(Exception("Erreur serveur : HTTP ${res.code} - $bodyStr"))
                }
                val json = JSONObject(bodyStr)
                val arr = json.optJSONArray("tasks") ?: JSONArray()
                val list = mutableListOf<TacheAgentItem>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    list.add(
                        TacheAgentItem(
                            id = obj.optString("id"),
                            idComplet = obj.optString("id_complet", obj.optString("id")),
                            agent = obj.optString("agent"),
                            status = obj.optString("status"),
                            task = obj.optString("task"),
                            scope = if (obj.has("scope") && !obj.isNull("scope")) obj.optString("scope") else null,
                            riskLevel = if (obj.has("risk_level") && !obj.isNull("risk_level")) obj.optString("risk_level") else null,
                            claimedBy = if (obj.has("claimed_by") && !obj.isNull("claimed_by")) obj.optString("claimed_by") else null,
                            createdAt = if (obj.has("created_at") && !obj.isNull("created_at")) obj.optString("created_at") else null
                        )
                    )
                }
                Result.success(list)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deposerTache(
        context: Context,
        agentCible: String,
        consigne: String,
        scope: String = "general",
        riskLevel: String = "bas"
    ): Result<String> = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val mdp = BrainClient.obtenirMotDePasse(context)
        if (mdp.isBlank()) {
            return@withContext Result.failure(Exception("Mot de passe CMS non configuré"))
        }

        val corps = JSONObject().apply {
            put("action", "deposer")
            put("agent", agentCible.lowercase())
            put("task", consigne.trim())
            put("scope", scope)
            put("risk_level", riskLevel)
            put("agent_name", "poco")
        }

        try {
            val req = Request.Builder()
                .url("$baseUrl/api/agent-tasks")
                .header("x-cms-auth", mdp)
                .post(corps.toString().toRequestBody(jsonMediaType))
                .build()

            httpClient.newCall(req).execute().use { res ->
                val bodyStr = res.body?.string().orEmpty()
                if (!res.isSuccessful) {
                    val errJson = try { JSONObject(bodyStr).optString("error", bodyStr) } catch (_: Exception) { bodyStr }
                    return@withContext Result.failure(Exception("Échec du dépôt ($errJson)"))
                }
                val json = JSONObject(bodyStr)
                val deposee = json.optJSONObject("deposee")
                val taskId = deposee?.optString("id") ?: "créée"
                Result.success(taskId)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Décision du fondateur sur une tâche : accepter (→ done) ou renvoyer (→ sent).
     * Réservé à la session CMS côté serveur (action `valider`).
     */
    suspend fun validerTache(
        context: Context,
        id: String,
        accepter: Boolean,
        commentaire: String
    ): Result<TacheAgentItem> = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val mdp = BrainClient.obtenirMotDePasse(context)
        if (mdp.isBlank()) {
            return@withContext Result.failure(Exception("Mot de passe CMS non configuré"))
        }
        val corps = JSONObject().apply {
            put("action", "valider")
            put("id", id)
            put("decision", if (accepter) "accepter" else "renvoyer")
            put("commentaire", commentaire)
        }
        try {
            val req = Request.Builder()
                .url("$baseUrl/api/agent-tasks")
                .header("x-cms-auth", mdp)
                .post(corps.toString().toRequestBody(jsonMediaType))
                .build()
            httpClient.newCall(req).execute().use { res ->
                val bodyStr = res.body?.string().orEmpty()
                if (!res.isSuccessful) {
                    val err = try { JSONObject(bodyStr).optString("error", bodyStr) } catch (_: Exception) { bodyStr }
                    return@withContext Result.failure(Exception(err))
                }
                val t = JSONObject(bodyStr).let { it.optJSONObject("validee") ?: it.optJSONObject("renvoyee") }
                    ?: return@withContext Result.failure(Exception("Réponse inattendue"))
                Result.success(
                    TacheAgentItem(
                        id = t.optString("id"),
                        idComplet = t.optString("id_complet", t.optString("id")),
                        agent = t.optString("agent"),
                        status = t.optString("status"),
                        task = t.optString("task"),
                        scope = null,
                        riskLevel = null,
                        claimedBy = null,
                        createdAt = null
                    )
                )
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

/**
 * Écran Jetpack Compose « Agents & Tâches » (120 Hz) pour Poco X6 Pro.
 */
@Composable
fun TachesScreen() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var tasks by remember { mutableStateOf<List<TacheAgentItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Formulaire de création
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedAgent by remember { mutableStateOf("jules") }
    var selectedScope by remember { mutableStateOf("content") }
    var selectedRisk by remember { mutableStateOf("bas") }
    var taskBrief by remember { mutableStateOf("") }
    var isSending by remember { mutableStateOf(false) }

    // Filtre statut
    var filterStatus by remember { mutableStateOf("all") }

    val agentsConnus = listOf(
        "jules" to "Jules (Édition/SEO)",
        "gemini" to "Gemini (Code/Arch)",
        "grok" to "Grok (Idées/Synthèse)",
        "allhands" to "AllHands (Cloud 24/7)",
        "manus" to "Manus (Recherche/Web)",
        "tous" to "Tous les agents"
    )

    fun rafraichir() {
        isLoading = true
        errorMessage = null
        coroutineScope.launch {
            val res = AgentTasksClient.chargerTaches(context, statutFiltre = filterStatus)
            isLoading = false
            res.fold(
                onSuccess = { tasks = it },
                onFailure = { errorMessage = it.message }
            )
        }
    }

    LaunchedEffect(filterStatus) {
        rafraichir()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F1117))
            .padding(16.dp)
    ) {
        // En-tête
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "⚡ Registre des Agents",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Pilote sans PC · Jules, Gemini, Grok, AllHands, Manus",
                    fontSize = 12.sp,
                    color = Color(0xFF9CA3AF)
                )
            }
            IconButton(onClick = { rafraichir() }) {
                Text(text = "🔄", fontSize = 18.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Bouton d'action principale : Donner une tâche
        Button(
            onClick = { showCreateDialog = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
            shape = RoundedCornerShape(10.dp)
        ) {
            Text("➕ Donner un ordre à un agent", fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Filtres par statut
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val filtres = listOf(
                "all" to "Toutes",
                "sent" to "En attente",
                "in_progress" to "En cours",
                "waiting_validation" to "À valider",
                "done" to "Vérifiées"
            )
            items(filtres) { (cle, label) ->
                FilterChip(
                    selected = (filterStatus == cle),
                    onClick = { filterStatus = cle },
                    label = { Text(label, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF3B82F6),
                        selectedLabelColor = Color.White,
                        containerColor = Color(0xFF1E2430),
                        labelColor = Color(0xFFD1D5DB)
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (errorMessage != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF3F1D1D)),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            ) {
                Text(
                    text = "⚠️ $errorMessage",
                    color = Color(0xFFFCA5A5),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(10.dp)
                )
            }
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF3B82F6))
            }
        } else if (tasks.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text("Aucune tâche trouvée pour ce filtre.", color = Color(0xFF6B7280), fontSize = 14.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(tasks, key = { it.idComplet }) { tache ->
                    TacheCard(tache)
                }
            }
        }
    }

    // Modal / Dialogue de création d'une tâche
    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { if (!isSending) showCreateDialog = false },
            title = { Text("Nouvelle tâche pour un agent", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("1. Choisir l'agent cible :", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(agentsConnus) { (nom, label) ->
                            FilterChip(
                                selected = (selectedAgent == nom),
                                onClick = { selectedAgent = nom },
                                label = { Text(label, fontSize = 11.sp) }
                            )
                        }
                    }

                    Text("2. Périmètre (Scope) :", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    val scopes = listOf("content", "code", "video", "seo", "audit")
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(scopes) { s ->
                            FilterChip(
                                selected = (selectedScope == s),
                                onClick = { selectedScope = s },
                                label = { Text(s, fontSize = 11.sp) }
                            )
                        }
                    }

                    Text("3. Consigne / Brief :", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = taskBrief,
                        onValueChange = { taskBrief = it },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                        placeholder = { Text("Ex: Rédiger l'article sur Madère en respectant la voix de marque...", fontSize = 12.sp) },
                        maxLines = 5
                    )

                    Text("4. Risque :", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    val risques = listOf("bas", "moyen", "haut")
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        risques.forEach { r ->
                            FilterChip(
                                selected = (selectedRisk == r),
                                onClick = { selectedRisk = r },
                                label = { Text(r, fontSize = 11.sp) }
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (taskBrief.trim().length < 8) {
                            Toast.makeText(context, "Brief trop court (8 car. min)", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        isSending = true
                        coroutineScope.launch {
                            val res = AgentTasksClient.deposerTache(
                                context = context,
                                agentCible = selectedAgent,
                                consigne = taskBrief,
                                scope = selectedScope,
                                riskLevel = selectedRisk
                            )
                            isSending = false
                            res.fold(
                                onSuccess = { id ->
                                    Toast.makeText(context, "Tâche #$id déposée !", Toast.LENGTH_LONG).show()
                                    taskBrief = ""
                                    showCreateDialog = false
                                    rafraichir()
                                },
                                onFailure = {
                                    Toast.makeText(context, "Erreur : ${it.message}", Toast.LENGTH_LONG).show()
                                }
                            )
                        }
                    },
                    enabled = !isSending && taskBrief.trim().length >= 8
                ) {
                    if (isSending) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    } else {
                        Text("🚀 Envoyer")
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showCreateDialog = false },
                    enabled = !isSending
                ) {
                    Text("Annuler")
                }
            }
        )
    }
}

@Composable
fun TacheCard(tache: TacheAgentItem) {
    val (statusColor, statusLabel) = when (tache.status) {
        "sent" -> Color(0xFFF59E0B) to "En attente"
        "in_progress" -> Color(0xFF3B82F6) to "En cours"
        "waiting_validation" -> Color(0xFFA855F7) to "À valider"
        "done" -> Color(0xFF10B981) to "Vérifiée"
        "blocked" -> Color(0xFFEF4444) to "Bloquée"
        else -> Color(0xFF6B7280) to tache.status
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E2430))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Agent badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "🤖 ${tache.agent.uppercase()}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF93C5FD)
                    )
                    tache.scope?.let {
                        Text(
                            text = " · $it",
                            fontSize = 11.sp,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                }

                // Status chip
                Surface(
                    color = statusColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = statusLabel,
                        color = statusColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Task brief
            Text(
                text = tache.task,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Normal,
                maxLines = 4,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Metadata footer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "#${tache.id} · ${tache.createdAt ?: ""}",
                    fontSize = 10.sp,
                    color = Color(0xFF6B7280)
                )
                tache.claimedBy?.let { worker ->
                    Text(
                        text = "Pris par : $worker",
                        fontSize = 10.sp,
                        color = Color(0xFF60A5FA),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
