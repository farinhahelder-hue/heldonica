package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class PromptLocalTest {

    private val fiches = listOf(
        VaultRecordItem("mercado", "Marché", "Mercado dos Lavradores à l'aube", "Fruits exotiques, pitanga, y aller vers 9h.", "Funchal"),
        VaultRecordItem("levada", "Randonnée", "La Levada do Norte", "Balade le long des bananiers.", "Ribeira Brava"),
        VaultRecordItem("ceinture", "Balade", "La Petite Ceinture", "L'autre Paris, loin des touristes.", "Paris")
    )

    @Test
    fun `normaliser retire accents et majuscules`() {
        assertEquals("marche a l'aube", PromptLocal.normaliser("Marché À l'Aube"))
    }

    @Test
    fun `la fiche dont le titre correspond passe en tete`() {
        val choisies = PromptLocal.selectionnerFiches("Que trouve-t-on au mercado ?", fiches)
        assertEquals("mercado", choisies.first().id)
    }

    @Test
    fun `aucune fiche quand rien ne correspond ou que la question n'a que des mots vides`() {
        assertTrue(PromptLocal.selectionnerFiches("Explique la photosynthese", fiches).isEmpty())
        assertTrue(PromptLocal.selectionnerFiches("donne moi", fiches).isEmpty())
    }

    @Test
    fun `le prompt contient consignes, fiches et une seule fois la question`() {
        val question = "Ou marcher a Paris ?"
        val historique = listOf(
            MessageCerveau(estUtilisateur = true, texte = "Bonjour"),
            MessageCerveau(estUtilisateur = false, texte = "Bonjour !"),
            MessageCerveau(estUtilisateur = false, texte = "⚠️ erreur", estErreur = true),
            MessageCerveau(estUtilisateur = true, texte = question)
        )
        val prompt = PromptLocal.construire(question, "vault", historique, PromptLocal.selectionnerFiches(question, fiches))
        assertTrue(prompt.contains("N'invente jamais"))
        assertTrue(prompt.contains("La Petite Ceinture (Paris)"))
        assertTrue(prompt.contains("Utilisateur : Bonjour"))
        assertFalse("les erreurs ne vont pas au modele", prompt.contains("erreur"))
        assertEquals(1, Regex(Regex.escape(question)).findAll(prompt).count())
    }

    @Test
    fun `mode inconnu retombe sur la consigne de discussion`() {
        val prompt = PromptLocal.construire("Salut", "inconnu", emptyList(), emptyList())
        assertTrue(prompt.contains("Réponds brièvement et concrètement."))
    }

    @Test
    fun `le prompt libre n'impose ni la marque ni le Coffre et garde l'echange`() {
        val question = "Raconte le sac de Rome en 410"
        val historique = listOf(
            MessageCerveau(estUtilisateur = true, texte = "Bonjour"),
            MessageCerveau(estUtilisateur = false, texte = "Bonjour !"),
            MessageCerveau(estUtilisateur = true, texte = question)
        )
        val prompt = PromptLocal.construireLibre(question, historique)
        assertFalse(prompt.contains("Heldonica"))
        assertFalse(prompt.contains("Fiches du Coffre"))
        assertTrue(prompt.contains("hors ligne"))
        assertTrue(prompt.contains("Utilisateur : Bonjour"))
        assertEquals(1, Regex(Regex.escape(question)).findAll(prompt).count())
    }
}
