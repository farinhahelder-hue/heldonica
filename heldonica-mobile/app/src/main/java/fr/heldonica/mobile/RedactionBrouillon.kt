package fr.heldonica.mobile

/**
 * Logique pure de l'écran Rédaction : repérer ce qu'il reste à écrire dans un
 * brouillon, et fabriquer les blocs de photo. Aucun accès réseau ni Android,
 * pour être testée sans émulateur.
 */
object RedactionBrouillon {

    private val LACUNE = Regex("\\[À TOI\\s*:[^\\]]*\\]")

    /** Les `[À TOI : …]` encore présents : ce que le brouillon attend de nous. */
    fun lacunes(contenu: String): List<String> =
        LACUNE.findAll(contenu).map { it.value }.toList()

    fun nombreDeLacunes(contenu: String): Int = lacunes(contenu).size

    /** Texte brut d'un contenu HTML, pour l'afficher et le relire sur le téléphone. */
    fun texteBrut(html: String): String = html
        .replace(Regex("<(br|/p|/li|/h[1-6])\\s*/?>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("<[^>]+>"), "")
        .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()

    private fun echapper(s: String): String =
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    /**
     * Bloc HTML d'une photo. Le lieu et la date ne sont écrits que s'ils sont
     * connus ; sinon la légende reste une lacune `[À TOI : …]` — on ne devine pas
     * l'endroit d'une photo (AGENTS.md, règle n°1).
     */
    fun blocPhoto(url: String, alt: String?, lieu: String?, jour: String?): String {
        val altFinal = alt?.takeIf { it.isNotBlank() } ?: "[À TOI : décris la photo]"
        val legende = listOfNotNull(lieu?.takeIf { it.isNotBlank() }, jour?.takeIf { it.isNotBlank() })
            .joinToString(", ")
            .ifBlank { "[À TOI : lieu et date de la photo]" }
        return "<figure><img src=\"${echapper(url)}\" alt=\"${echapper(altFinal)}\" />" +
            "<figcaption>${echapper(legende)}</figcaption></figure>"
    }

    /** Ajoute des blocs à la fin du contenu, sans toucher à ce qui est déjà écrit. */
    fun ajouterPhotos(contenu: String, blocs: List<String>): String =
        if (blocs.isEmpty()) contenu else contenu.trimEnd() + "\n" + blocs.joinToString("\n")

    /** « 2026-08-28T09:14:00 » → « 2026-08-28 » (jour de la photo, sans l'heure). */
    fun jourDe(iso: String?): String? = iso?.substringBefore('T')?.takeIf { it.length == 10 }

    private val IMG = Regex("<img[^>]+src=\"([^\"]+)\"", RegexOption.IGNORE_CASE)

    /**
     * Raison de refuser la proposition de l'IA, ou null si elle est sûre à garder.
     * Elle remplace tout le brouillon : on refuse si elle perd une image, si elle
     * ajoute des lacunes, ou si elle rend nettement moins de texte qu'avant.
     */
    fun refuserProposition(avant: String, apres: String): String? {
        if (apres.isBlank()) return "L'IA a rendu un texte vide."
        val imagesAvant = IMG.findAll(avant).map { it.groupValues[1] }.toSet()
        val imagesApres = IMG.findAll(apres).map { it.groupValues[1] }.toSet()
        if (!imagesApres.containsAll(imagesAvant)) return "L'IA a retiré une photo du brouillon."
        if (nombreDeLacunes(apres) > nombreDeLacunes(avant)) return "L'IA a ajouté des lacunes au lieu d'en combler."
        if (texteBrut(apres).length < texteBrut(avant).length * 0.8) return "L'IA a raccourci le brouillon : du texte a disparu."
        return null
    }

    /**
     * Prompt pour que le modèle embarqué du Poco X6 Pro (CerveauLocal) remplace
     * les lacunes `[À TOI : …]` couvertes par les notes, sans toucher au reste
     * du brouillon ni aux balises `<img>`.
     */
    fun construirePromptCompletionLocale(
        contenu: String,
        notes: String,
        lieux: List<String> = emptyList()
    ): String = buildString {
        appendLine("Complète ce brouillon Heldonica uniquement à partir des notes vécues ci-dessous.")
        appendLine("Règles absolues :")
        appendLine("1. Remplace seulement les balises [À TOI : ...] dont la réponse figure dans les notes.")
        appendLine("2. Laisse intactes les balises [À TOI : ...] que les notes ne couvrent pas.")
        appendLine("3. Conserve intégralement tout le reste du texte et toutes les balises HTML (<figure>, <img>, <p>).")
        appendLine("4. Utilise uniquement les pronoms « on » et « tu », sans rien inventer.")
        if (lieux.isNotEmpty()) {
            appendLine("Lieux traversés : ${lieux.joinToString(", ")}")
        }
        appendLine()
        appendLine("Notes vécues :")
        appendLine(notes.trim())
        appendLine()
        appendLine("Brouillon à compléter (renvoie uniquement le brouillon complété, sans commentaire) :")
        appendLine(contenu.trim())
    }
}
