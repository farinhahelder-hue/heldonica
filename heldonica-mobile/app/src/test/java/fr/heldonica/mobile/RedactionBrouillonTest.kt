package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class RedactionBrouillonTest {

    @Test
    fun `repere les lacunes a ecrire`() {
        val html = "<p>Étape : <strong>Brașov</strong></p><p>[À TOI : odeur, lumière]</p><p>[À TOI : récit vécu]</p>"
        assertEquals(listOf("[À TOI : odeur, lumière]", "[À TOI : récit vécu]"), RedactionBrouillon.lacunes(html))
        assertEquals(0, RedactionBrouillon.nombreDeLacunes("<p>Tout est écrit.</p>"))
    }

    @Test
    fun `la photo sans lieu connu garde une lacune, jamais un lieu devine`() {
        val bloc = RedactionBrouillon.blocPhoto("https://x/a.jpg", null, null, null)
        assertTrue(bloc.contains("[À TOI : décris la photo]"))
        assertTrue(bloc.contains("[À TOI : lieu et date de la photo]"))
    }

    @Test
    fun `la photo avec lieu et jour les ecrit, echappes`() {
        val bloc = RedactionBrouillon.blocPhoto("https://x/a.jpg?a=1&b=2", "Marché \"du matin\"", "Brașov", "2026-08-28")
        assertTrue(bloc.contains("Brașov, 2026-08-28"))
        assertTrue(bloc.contains("a=1&amp;b=2"))
        assertTrue(bloc.contains("Marché &quot;du matin&quot;"))
    }

    @Test
    fun `ajouter des photos ne touche pas au texte existant`() {
        val avant = "<p>Texte déjà écrit.</p>\n"
        val apres = RedactionBrouillon.ajouterPhotos(avant, listOf("<figure/>"))
        assertTrue(apres.startsWith("<p>Texte déjà écrit.</p>"))
        assertTrue(apres.endsWith("<figure/>"))
        assertEquals(avant, RedactionBrouillon.ajouterPhotos(avant, emptyList()))
    }

    @Test
    fun `texte brut et jour`() {
        assertEquals("Un\nDeux", RedactionBrouillon.texteBrut("<p>Un</p><p>Deux</p>"))
        assertEquals("2026-08-28", RedactionBrouillon.jourDe("2026-08-28T09:14:00"))
        assertNull(RedactionBrouillon.jourDe(null))
    }
}
