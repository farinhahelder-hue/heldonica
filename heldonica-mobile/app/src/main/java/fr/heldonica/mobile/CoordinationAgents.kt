package fr.heldonica.mobile

/**
 * Coordination des agents depuis le Cerveau.
 *
 * Un modèle de 1,5B ne doit pas décider seul de confier ou de valider une
 * tâche : les ordres explicites (« @jules … », « valide #ab12 ») sont reconnus
 * ici, par des règles, et exécutés tels quels sur le registre `agent_tasks`.
 * Le modèle, lui, reçoit seulement le résumé du registre pour répondre aux
 * questions (« où en est Jules ? »).
 *
 * Sans dépendance Android : testé sur la JVM.
 */
sealed class CommandeAgent {
    data class Confier(val agent: String, val consigne: String) : CommandeAgent()
    data class Valider(val id: String, val commentaire: String) : CommandeAgent()
    data class Renvoyer(val id: String, val commentaire: String) : CommandeAgent()
}

object CoordinationAgents {
    /** Destinataires de l'API (`AGENTS_CONNUS` de /api/agent-tasks), hors fondateur/poco/tous. */
    val AGENTS = listOf(
        "jules", "gemini", "claude", "opencode", "freebuff", "grok",
        "manus", "allhands", "openhands", "archiveur", "muse-spark"
    )

    private val agentsRegex = AGENTS.joinToString("|") { Regex.escape(it) }

    private val confierArobase = Regex("^@($agentsRegex)\\b[\\s:,-]*(.+)$", setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL))
    private val confierVerbe = Regex(
        "^(?:donne|demande|envoie|confie|passe)\\s+(?:à|a|au)?\\s*($agentsRegex)\\s*[:,-]\\s*(.+)$",
        setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
    )
    private val validerRegex = Regex(
        "^(?:valide|valider|accepte|accepter)\\s+(?:la\\s+)?(?:t[âa]che\\s+)?#?([0-9a-f]{4,36})\\b\\s*[:,-]?\\s*(.*)$",
        setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
    )
    private val renvoyerRegex = Regex(
        "^(?:renvoie|renvoyer|refuse|refuser|rejette|rejeter)\\s+(?:la\\s+)?(?:t[âa]che\\s+)?#?([0-9a-f]{4,36})\\b\\s*[:,-]?\\s*(.*)$",
        setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
    )
    private val questionAgents = Regex(
        "t[âa]che|agent|registre|flux|valid|bloqu|en cours|quoi de neuf|o[ùu] en est|avancement|$agentsRegex",
        RegexOption.IGNORE_CASE
    )

    /** Ordre explicite reconnu, ou null (le message part alors au modèle). */
    fun analyser(message: String): CommandeAgent? {
        val m = message.trim()
        validerRegex.find(m)?.let { return CommandeAgent.Valider(it.groupValues[1].lowercase(), it.groupValues[2].trim()) }
        renvoyerRegex.find(m)?.let { return CommandeAgent.Renvoyer(it.groupValues[1].lowercase(), it.groupValues[2].trim()) }
        (confierArobase.find(m) ?: confierVerbe.find(m))?.let {
            val consigne = it.groupValues[2].trim()
            // L'API refuse moins de 8 caractères : on laisse le modèle répondre plutôt qu'un 400.
            if (consigne.length >= 8) return CommandeAgent.Confier(it.groupValues[1].lowercase(), consigne)
        }
        return null
    }

    /** La question porte-t-elle sur les agents ? Si oui, on charge le registre. */
    fun concerneLesAgents(message: String): Boolean = questionAgents.containsMatchIn(message)

    private val questionPlanning = Regex(
        "planning|publi|semaine|programm|calendrier|instagram|youtube|memoria|blog|article|carrousel|short|aujourd|demain|priorit|quoi faire",
        RegexOption.IGNORE_CASE
    )

    /** La question porte-t-elle sur le planning ou le contenu ? Si oui, on charge l'état du projet. */
    fun concerneLePlanning(message: String): Boolean = questionPlanning.containsMatchIn(message)

    /** Épisodes Memoria Imperium déjà montables dans l'onglet Memoria (presets de l'appli). */
    fun episodesMemoria(titres: List<String>): String =
        if (titres.isEmpty()) "" else "Memoria Imperium, épisodes prêts à monter dans l'onglet Memoria : ${titres.joinToString(", ")}."

    private val LIBELLES = linkedMapOf(
        "waiting_validation" to "À valider",
        "blocked" to "Bloquées",
        "in_progress" to "En cours",
        "sent" to "En attente d'un agent"
    )

    /** Résumé compact du registre, pour le contexte d'un petit modèle. */
    fun resumerRegistre(taches: List<TacheAgentItem>, parCategorie: Int = 5): String = buildString {
        val parStatut = taches.groupBy { it.status }
        val compte = { s: String -> parStatut[s]?.size ?: 0 }
        appendLine(
            "Registre des agents (${taches.size} dernières tâches) : " +
                "${compte("waiting_validation")} à valider, ${compte("blocked")} bloquées, " +
                "${compte("in_progress")} en cours, ${compte("sent")} en attente, ${compte("done")} terminées."
        )
        LIBELLES.forEach { (statut, libelle) ->
            val liste = parStatut[statut].orEmpty()
            if (liste.isNotEmpty()) {
                appendLine("$libelle :")
                liste.take(parCategorie).forEach { t ->
                    val qui = if (t.claimedBy.isNullOrBlank() || t.claimedBy == t.agent) t.agent else "${t.agent} (pris par ${t.claimedBy})"
                    appendLine("- #${t.id} $qui — ${t.task.take(90)}")
                }
            }
        }
        appendLine("Pour agir, le fondateur écrit : « valide #id », « renvoie #id : raison » ou « @agent consigne ».")
    }
}
