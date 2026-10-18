package fr.heldonica.mobile

import android.content.Context
import android.net.Uri
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.text.Normalizer

/**
 * Cerveau embarqué : un petit modèle qui tourne SUR le Poco X6 Pro, sans réseau.
 *
 * Rôle volontairement modeste : suivre le projet, le site, la création de
 * contenu et le planning, et coordonner les agents. Il n'écrit pas de code et
 * ne tranche rien d'important — pour ça, l'interrupteur « Cerveau boosté »
 * renvoie vers les API gratuites (Cloud 0€), ou le PC quand il est allumé.
 *
 * Le modèle n'est PAS dans l'APK (plusieurs centaines de Mo) : on importe une
 * fois un fichier MediaPipe `.task` (ex. Gemma 3 1B IT int4, ~550 Mo), copié
 * dans le stockage privé de l'application.
 */
object CerveauLocal {
    private const val DOSSIER_MODELES = "modeles"
    private val EXTENSIONS = setOf("task", "bin")

    // Entrée + sortie comprises : un 1B tient sans saturer la RAM du Poco.
    private const val MAX_TOKENS = 1536

    private val verrou = Mutex()
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
            verrou.withLock {
                liberer()
                dossier(context).listFiles()?.forEach { if (it != temp) it.delete() }
                if (!temp.renameTo(cible)) throw IOException("Copie du modèle impossible")
            }
            cible
        }

    /** Réponse du modèle embarqué. Lent au premier appel (chargement du modèle). */
    suspend fun repondre(
        context: Context,
        message: String,
        mode: String,
        historique: List<MessageCerveau>,
        fiches: List<VaultRecordItem>
    ): ReponseCerveau = withContext(Dispatchers.Default) {
        val fichier = fichierModele(context)
            ?: throw IOException("Aucun modèle local installé")
        val prompt = PromptLocal.construire(
            message = message,
            mode = mode,
            historique = historique,
            fiches = PromptLocal.selectionnerFiches(message, fiches)
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
        fiches: List<VaultRecordItem>
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
