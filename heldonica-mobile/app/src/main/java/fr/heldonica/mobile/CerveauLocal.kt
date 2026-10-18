package fr.heldonica.mobile

import android.content.Context
import android.net.Uri
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.text.Normalizer
import java.util.concurrent.TimeUnit

/** Avancement du téléchargement du modèle conseillé. */
data class EtatTelechargement(
    val enCours: Boolean = false,
    val octets: Long = 0L,
    val total: Long = 0L,
    val erreur: String? = null,
    val termine: File? = null
) {
    val fraction: Float get() = if (total > 0) (octets.toFloat() / total).coerceIn(0f, 1f) else 0f
}

/**
 * Cerveau embarqué : un petit modèle qui tourne SUR le Poco X6 Pro, sans réseau.
 *
 * Rôle volontairement modeste : suivre le projet, le site, la création de
 * contenu et le planning, et coordonner les agents. Il n'écrit pas de code et
 * ne tranche rien d'important — pour ça, l'interrupteur « Cerveau boosté »
 * renvoie vers les API gratuites (Cloud 0€), ou le PC quand il est allumé.
 *
 * Le modèle n'est PAS dans l'APK (1,6 Go) : un bouton le télécharge une fois
 * (MODELE_CONSEILLE, sans compte Hugging Face), ou on importe un fichier
 * MediaPipe `.task`. Il est gardé dans le stockage privé de l'application.
 */
object CerveauLocal {
    private const val DOSSIER_MODELES = "modeles"
    private val EXTENSIONS = setOf("task", "bin")

    // Entrée + sortie comprises : un 1B tient sans saturer la RAM du Poco.
    // 2048 : le résumé du registre des agents prend sa place dans le contexte.
    private const val MAX_TOKENS = 2048

    // Qwen2.5 1.5B : ouvert (pas de licence à accepter, contrairement à Gemma),
    // bon en français, et ekv4096 laisse de la marge au-dessus de MAX_TOKENS.
    const val MODELE_CONSEILLE_NOM = "Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv4096.task"
    const val MODELE_CONSEILLE_URL =
        "https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct/resolve/main/$MODELE_CONSEILLE_NOM"
    const val MODELE_CONSEILLE_OCTETS = 1_598_556_720L

    private val verrou = Mutex()

    // Hors de l'écran : le téléchargement survit au changement d'onglet.
    private val porteeTelechargement = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val _telechargement = MutableStateFlow(EtatTelechargement())
    val telechargement: StateFlow<EtatTelechargement> = _telechargement

    private val clientTelechargement = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()
    private var moteur: LlmInference? = null
    private var cheminCharge: String? = null

    private fun dossier(context: Context): File =
        File(context.filesDir, DOSSIER_MODELES).apply { mkdirs() }

    /** Le modèle importé le plus récent, ou null si aucun. */
    fun fichierModele(context: Context): File? =
        dossier(context).listFiles { f -> f.isFile && f.extension.lowercase() in EXTENSIONS }
            ?.maxByOrNull { it.lastModified() }

    fun estInstalle(context: Context): Boolean = fichierModele(context) != null

    /**
     * Copie le modèle choisi (sélecteur de fichiers Android) dans le stockage
     * privé, puis supprime les anciens : un seul modèle à la fois, pour ne pas
     * cumuler des Go sur le téléphone.
     */
    suspend fun importerModele(context: Context, uri: Uri, nomAffiche: String?): File =
        withContext(Dispatchers.IO) {
            val nom = (nomAffiche ?: "modele.task")
                .replace(Regex("[^A-Za-z0-9._-]"), "_")
                .let { if (it.substringAfterLast('.', "").lowercase() in EXTENSIONS) it else "$it.task" }
            val cible = File(dossier(context), nom)
            val temp = File(dossier(context), "$nom.partiel")
            context.contentResolver.openInputStream(uri)?.use { entree ->
                temp.outputStream().use { sortie -> entree.copyTo(sortie, 1 shl 20) }
            } ?: throw IOException("Fichier illisible")
            installer(context, temp, cible)
            cible
        }

    /** Remplace le modèle installé par [temp], renommé en [cible]. */
    private suspend fun installer(context: Context, temp: File, cible: File) {
        verrou.withLock {
            liberer()
            dossier(context).listFiles()?.forEach { if (it != temp) it.delete() }
            if (!temp.renameTo(cible)) throw IOException("Copie du modèle impossible")
        }
    }

    /**
     * Télécharge le modèle conseillé. Reprend là où il s'était arrêté (en-tête
     * Range) si la connexion a coupé ou si l'application a été fermée.
     */
    fun telechargerModeleConseille(context: Context) {
        if (_telechargement.value.enCours) return
        val appContext = context.applicationContext
        porteeTelechargement.launch {
            val temp = File(dossier(appContext), "$MODELE_CONSEILLE_NOM.partiel")
            val cible = File(dossier(appContext), MODELE_CONSEILLE_NOM)
            try {
                var deja = if (temp.exists()) temp.length() else 0L
                _telechargement.value = EtatTelechargement(true, deja, MODELE_CONSEILLE_OCTETS)
                if (deja < MODELE_CONSEILLE_OCTETS) {
                    val requete = Request.Builder().url(MODELE_CONSEILLE_URL)
                        .apply { if (deja > 0) header("Range", "bytes=$deja-") }
                        .build()
                    clientTelechargement.newCall(requete).execute().use { reponse ->
                        when (reponse.code) {
                            206 -> Unit
                            200 -> deja = 0L // le serveur ignore la reprise : on repart de zéro
                            else -> throw IOException("HTTP ${reponse.code}")
                        }
                        val corps = reponse.body ?: throw IOException("Réponse vide")
                        corps.byteStream().use { entree ->
                            FileOutputStream(temp, deja > 0).use { sortie ->
                                val tampon = ByteArray(1 shl 16)
                                var lus = deja
                                var signale = deja
                                while (true) {
                                    val n = entree.read(tampon)
                                    if (n < 0) break
                                    sortie.write(tampon, 0, n)
                                    lus += n
                                    if (lus - signale >= (8L shl 20)) {
                                        signale = lus
                                        _telechargement.value =
                                            EtatTelechargement(true, lus, MODELE_CONSEILLE_OCTETS)
                                    }
                                }
                            }
                        }
                    }
                }
                if (temp.length() != MODELE_CONSEILLE_OCTETS) {
                    throw IOException("Fichier incomplet (${temp.length()} / $MODELE_CONSEILLE_OCTETS octets)")
                }
                installer(appContext, temp, cible)
                _telechargement.value = EtatTelechargement(
                    false, MODELE_CONSEILLE_OCTETS, MODELE_CONSEILLE_OCTETS, termine = cible
                )
            } catch (e: Exception) {
                _telechargement.value = EtatTelechargement(
                    false, if (temp.exists()) temp.length() else 0L, MODELE_CONSEILLE_OCTETS,
                    erreur = e.message ?: e.javaClass.simpleName
                )
            }
        }
    }

    /** Réponse du modèle embarqué. Lent au premier appel (chargement du modèle). */
    suspend fun repondre(
        context: Context,
        message: String,
        mode: String,
        historique: List<MessageCerveau>,
        fiches: List<VaultRecordItem>,
        contexte: String? = null
    ): ReponseCerveau = withContext(Dispatchers.Default) {
        val fichier = fichierModele(context)
            ?: throw IOException("Aucun modèle local installé")
        val prompt = PromptLocal.construire(
            message = message,
            mode = mode,
            historique = historique,
            fiches = PromptLocal.selectionnerFiches(message, fiches),
            contexte = contexte
        )
        val texte = verrou.withLock {
            val llm = moteurPour(context, fichier)
            llm.generateResponse(prompt)
        }
        ReponseCerveau(
            texte = texte.trim(),
            fournisseur = "telephone",
            modele = fichier.nameWithoutExtension,
            source = SourceCerveau.IA_TELEPHONE
        )
    }

    private fun moteurPour(context: Context, fichier: File): LlmInference {
        val existant = moteur
        if (existant != null && cheminCharge == fichier.absolutePath) return existant
        liberer()
        val options = LlmInference.LlmInferenceOptions.builder()
            .setModelPath(fichier.absolutePath)
            .setMaxTokens(MAX_TOKENS)
            .build()
        return LlmInference.createFromOptions(context, options).also {
            moteur = it
            cheminCharge = fichier.absolutePath
        }
    }

    private fun liberer() {
        runCatching { moteur?.close() }
        moteur = null
        cheminCharge = null
    }
}

/**
 * Construction du prompt du modèle embarqué. Sans dépendance Android, pour
 * être testée sur la JVM. Un petit modèle a peu de contexte : on garde les
 * consignes courtes, 3 fiches au plus et les 4 derniers messages.
 */
object PromptLocal {
    private const val MAX_FICHES = 3
    private const val MAX_CARACTERES_FICHE = 350
    private const val MAX_TOURS = 4
    private const val MAX_CARACTERES_TOUR = 300

    private val MOTS_VIDES = setOf(
        "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "au", "aux",
        "en", "on", "tu", "je", "il", "elle", "nous", "vous", "ce", "ca", "cet", "cette",
        "pour", "par", "sur", "dans", "avec", "sans", "que", "qui", "quoi", "est", "sont",
        "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "pas", "plus", "moi",
        "donne", "fais", "dis", "parle", "quel", "quelle", "quels", "quelles", "comment"
    )

    private val CONSIGNES_MODE = mapOf(
        "coach" to "Propose UNE seule action concrète, faisable en 5, 15 ou 30 minutes.",
        "terrain" to "Mets en forme les notes de terrain fournies, sans rien ajouter qui n'y soit pas.",
        "vault" to "Réponds uniquement à partir des fiches ci-dessous. Sans fiche pertinente, dis-le.",
        "chat" to "Réponds brièvement et concrètement."
    )

    fun normaliser(texte: String): String =
        Normalizer.normalize(texte.lowercase(), Normalizer.Form.NFD)
            .replace(Regex("\\p{M}+"), "")

    private fun mots(texte: String): Set<String> =
        normaliser(texte).split(Regex("[^a-z0-9]+"))
            .filter { it.length > 2 && it !in MOTS_VIDES }
            .toSet()

    /** Fiches les plus proches de la question : un mot du titre compte triple. */
    fun selectionnerFiches(
        message: String,
        fiches: List<VaultRecordItem>,
        limite: Int = MAX_FICHES
    ): List<VaultRecordItem> {
        val requete = mots(message)
        if (requete.isEmpty()) return emptyList()
        return fiches
            .map { fiche ->
                val titre = mots(fiche.title + " " + (fiche.location ?: ""))
                val corps = mots(fiche.content + " " + fiche.category)
                fiche to (3 * requete.count { it in titre } + requete.count { it in corps })
            }
            .filter { it.second > 0 }
            .sortedByDescending { it.second }
            .take(limite)
            .map { it.first }
    }

    fun construire(
        message: String,
        mode: String,
        historique: List<MessageCerveau>,
        fiches: List<VaultRecordItem>,
        contexte: String? = null
    ): String = buildString {
        appendLine("Tu es le Cerveau Heldonica, l'assistant de coordination d'un blog slow travel (Instagram Heldonica) et d'une chaîne YouTube d'histoire (Memoria Imperium).")
        appendLine("Ton rôle : suivre les projets, le site, la création de contenu et le planning, et dire quel agent IA solliciter (Jules, Gemini, Claude, OpenCode, Freebuff…).")
        appendLine("Règles : réponds en français, court et concret. N'invente jamais d'adresse, de prix, de date ni de fait. Si tu ne sais pas, dis-le et propose d'activer le Cerveau boosté.")
        appendLine(CONSIGNES_MODE[mode] ?: CONSIGNES_MODE.getValue("chat"))
        if (fiches.isNotEmpty()) {
            appendLine()
            appendLine("Fiches du Coffre :")
            fiches.forEach { f ->
                val lieu = if (f.location.isNullOrBlank()) "" else " (${f.location})"
                appendLine("- ${f.title}$lieu : ${f.content.take(MAX_CARACTERES_FICHE)}")
            }
        }
        if (!contexte.isNullOrBlank()) {
            appendLine()
            appendLine(contexte.trim())
        }
        // Le dernier message est la question elle-même : on l'écrit une seule fois, plus bas.
        val tours = historique.filterNot { it.estErreur }
            .let { if (it.lastOrNull()?.estUtilisateur == true && it.last().texte.trim() == message.trim()) it.dropLast(1) else it }
            .takeLast(MAX_TOURS)
        if (tours.isNotEmpty()) {
            appendLine()
            appendLine("Échange récent :")
            tours.forEach { t ->
                appendLine((if (t.estUtilisateur) "Utilisateur : " else "Cerveau : ") + t.texte.take(MAX_CARACTERES_TOUR))
            }
        }
        appendLine()
        appendLine("Question : ${message.trim()}")
    }
}
