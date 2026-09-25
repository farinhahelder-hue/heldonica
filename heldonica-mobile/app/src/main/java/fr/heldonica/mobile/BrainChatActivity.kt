package fr.heldonica.mobile

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Chat avec le cerveau Heldonica, depuis n'importe où.
 *
 * Le cerveau tourne sur le PC, à la maison : le téléphone ne connaît pas son
 * adresse et ne peut pas l'atteindre hors du Wi-Fi. Les deux passent donc par
 * le site — le « pont CMS » de heldonica.fr :
 *
 *   1. le téléphone dépose la question : POST /api/brain/tasks (task_type=chat)
 *   2. le cerveau, qui interroge le site toutes les 30 s, prend la tâche et
 *      écrit sa réponse ;
 *   3. le téléphone relit la réponse : GET /api/brain/tasks/{id} jusqu'à « done ».
 *
 * Aucun secret nouveau embarqué : le mot de passe CMS déjà compilé dans
 * BuildConfig.CMS_PASSWORD suffit (en-tête x-cms-auth), comme pour le reste de
 * l'application.
 */
class BrainChatActivity : ComponentActivity() {

    private val TAG = "BrainChatActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { EcranChat() }
    }

    private data class Message(val role: String, val texte: String)

    private data class ReponseCerveau(val texte: String, val statut: String)

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun EcranChat() {
        var messages by remember { mutableStateOf(listOf<Message>()) }
        var saisie by remember { mutableStateOf("") }
        var enAttente by remember { mutableStateOf(false) }
        var statut by remember { mutableStateOf("") }
        val scope = rememberCoroutineScope()
        val liste = rememberLazyListState()

        // Le clavier remonte la liste : on reste sur la derniere bulle.
        LaunchedEffect(messages.size, enAttente) {
            if (messages.isNotEmpty()) {
                liste.animateScrollToItem(messages.size - 1)
            }
        }

        BackHandler { finish() }

        MaterialTheme {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("Parlons au cerveau") },
                        navigationIcon = {
                            TextButton(onClick = { finish() }) { Text("← Fermer") }
                        }
                    )
                }
            ) { pad ->
                Column(
                    Modifier
                        .padding(pad)
                        .padding(16.dp)
                        .fillMaxSize()
                ) {
                    if (messages.isEmpty()) {
                        Text(
                            "Pose une question : le cerveau Heldonica te répond, " +
                                "même loin du Wi-Fi de la maison.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(Modifier.height(12.dp))
                    }

                    LazyColumn(
                        state = liste,
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(messages) { m -> Bulle(m) }
                    }

                    if (statut.isNotBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Text(statut, style = MaterialTheme.typography.bodySmall)
                    }

                    Spacer(Modifier.height(8.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = saisie,
                            onValueChange = { saisie = it },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("Ta question…") },
                            enabled = !enAttente,
                            maxLines = 4
                        )
                        Spacer(Modifier.width(8.dp))
                        Button(
                            onClick = {
                                val question = saisie.trim()
                                if (question.isNotBlank() && !enAttente) {
                                    saisie = ""
                                    scope.launch {
                                        enAttente = true
                                        statut = "Le cerveau cherche ta réponse…"
                                        messages = messages + Message("moi", question)
                                        val reponse = parlerAuCerveau(question)
                                        enAttente = false
                                        if (reponse.texte.isNotBlank()) {
                                            messages = messages + Message("cerveau", reponse.texte)
                                            statut = reponse.statut
                                        } else {
                                            statut = "⚠️ ${reponse.statut}"
                                        }
                                    }
                                }
                            },
                            enabled = saisie.isNotBlank() && !enAttente
                        ) {
                            if (enAttente) {
                                // Le bouton montre l'attente : l'envoi n'est pas
                                // perdu, il est en cours.
                                CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                            } else {
                                Text("Envoyer")
                            }
                        }
                    }
                }
            }
        }
    }

    @Composable
    private fun Bulle(m: Message) {
        val mienne = m.role == "moi"
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = if (mienne) Arrangement.End else Arrangement.Start
        ) {
            Surface(
                modifier = Modifier.widthIn(max = 320.dp),
                shape = RoundedCornerShape(16.dp),
                color = if (mienne) {
                    MaterialTheme.colorScheme.primaryContainer
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                }
            ) {
                Text(
                    m.texte,
                    Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }

    /**
     * Dépose la question sur le pont CMS puis attend la réponse du cerveau.
     *
     * Le cerveau interroge le site toutes les 30 s : une réponse met en moyenne
     * 30 à 60 s à revenir. On relit la tâche toutes les 5 s, jusqu'à deux
     * minutes trente, puis on abandonne proprement.
     */
    private suspend fun parlerAuCerveau(question: String): ReponseCerveau =
        withContext(Dispatchers.IO) {
            val base = BuildConfig.CMS_BASE_URL.trimEnd('/')
            val motDePasse = BuildConfig.CMS_PASSWORD

            if (motDePasse.isBlank()) {
                return@withContext ReponseCerveau(
                    "",
                    "Mot de passe CMS absent de cette compilation — renseigne cms.password dans local.properties."
                )
            }

            val client = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .build()

            // 1. Déposer la question.
            val corps = JSONObject()
                .put("task_type", "chat")
                .put("payload", JSONObject().put("message", question))
                .toString()

            val id = try {
                val req = Request.Builder()
                    .url("$base/api/brain/tasks")
                    .header("x-cms-auth", motDePasse)
                    .post(corps.toRequestBody("application/json".toMediaType()))
                    .build()
                client.newCall(req).execute().use { r ->
                    if (!r.isSuccessful) {
                        return@withContext ReponseCerveau(
                            "",
                            "Le site a refusé la question (HTTP ${r.code})."
                        )
                    }
                    JSONObject(r.body?.string().orEmpty()).optString("id")
                }
            } catch (e: Exception) {
                Log.w(TAG, "Depot impossible", e)
                return@withContext ReponseCerveau(
                    "",
                    "Impossible de joindre heldonica.fr (${e.message ?: e.javaClass.simpleName})."
                )
            }

            if (id.isBlank()) {
                return@withContext ReponseCerveau(
                    "",
                    "Le site n'a pas attribué d'identifiant à la question."
                )
            }

            // 2. Attendre la réponse du cerveau.
            // Le cerveau interroge le site toutes les 30 s : on relit la tâche
            // toutes les 5 s, pendant 2 min 30 au maximum.
            var tente = 0
            val maxTentatives = 30 // 30 x 5 s = 2 min 30
            var reponse: ReponseCerveau? = null

            while (reponse == null && tente < maxTentatives) {
                delay(5_000)
                tente++

                val etat = try {
                    val req = Request.Builder()
                        .url("$base/api/brain/tasks/$id")
                        .header("x-cms-auth", motDePasse)
                        .get()
                        .build()
                    client.newCall(req).execute().use { r ->
                        if (!r.isSuccessful) null
                        else JSONObject(r.body?.string().orEmpty())
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Lecture de la reponse impossible", e)
                    null
                }

                val task = etat?.optJSONObject("task") ?: continue
                reponse = when (task.optString("status")) {
                    "done" -> {
                        val actions = task.optJSONObject("actions_done")
                        val texte = actions?.optString("result")
                            ?.takeIf { it.isNotBlank() }
                            ?: "Réponse reçue (vide)."
                        ReponseCerveau(texte.trim(), "Réponse du cerveau en ${tente * 5} s.")
                    }
                    "blocked" -> ReponseCerveau("", "Le cerveau a bloqué cette question.")
                    "failed" -> ReponseCerveau("", "Le cerveau a échoué sur cette question.")
                    else -> null
                }
            }

            reponse ?: ReponseCerveau(
                "",
                "Pas de réponse après 2 min 30 — le cerveau est peut-être éteint."
            )
        }
}