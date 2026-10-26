package fr.heldonica.mobile

/**
 * Onglets de la coque Studio : logique pure, testable en JVM sans émulateur.
 */
enum class OngletStudio(val titre: String, val emoji: String) {
    CREER("Créer", "✨"),
    CERVEAU("Cerveau", "\uD83E\uDDE0"),
    TACHES("Tâches", "⚡"),
    REDACTION("Rédaction", "✍️"),
    CMS("CMS", "\uD83D\uDCDD"),
    STUDIO("Memoria", "\uD83C\uDFDB"),
    INSTA("Terrain", "\uD83D\uDCF8");

    companion object {
        fun parDefaut(): OngletStudio = CREER
    }
}

/**
 * URL de la console Brain à afficher. Vide quand non configurée
 * (brain.webUrl dans local.properties) : l'onglet affiche alors
 * la marche à suivre au lieu d'une page blanche.
 */
fun urlConsoleBrain(brut: String?): String? {
    val propre = (brut ?: "").trim().trimEnd('/')
    if (propre.isEmpty()) return null
    return if (propre.startsWith("http://") || propre.startsWith("https://")) propre else null
}
