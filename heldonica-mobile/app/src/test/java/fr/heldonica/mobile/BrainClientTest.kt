package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class BrainClientTest {

    @Test
    fun `sources cerveau sont definies et badges coherents`() {
        assertEquals(3, SourceCerveau.values().size)
        assertEquals("🟢 Cloud", SourceCerveau.CLOUD.badge)
        assertEquals("💻 PC LAN", SourceCerveau.STATION_PC.badge)
        assertEquals("📦 Local", SourceCerveau.HORS_LIGNE.badge)
    }

    @Test
    fun `modes cerveau sont au nombre de quatre`() {
        assertEquals(4, MODES_DISPONIBLES.size)
        val cles = MODES_DISPONIBLES.map { it.cle }
        assertTrue(cles.contains("coach"))
        assertTrue(cles.contains("terrain"))
        assertTrue(cles.contains("vault"))
        assertTrue(cles.contains("chat"))
    }

    @Test
    fun `modeles message et reponse et fiche vault coherents`() {
        val msg = MessageCerveau(
            estUtilisateur = true,
            texte = "Bonjour Cerveau"
        )
        assertTrue(msg.estUtilisateur)
        assertEquals("Bonjour Cerveau", msg.texte)
        assertFalse(msg.estErreur)

        val rep = ReponseCerveau(
            texte = "Récit de voyage authentique",
            fournisseur = "groq",
            modele = "llama-3.3-70b-versatile",
            source = SourceCerveau.CLOUD
        )
        assertEquals(SourceCerveau.CLOUD, rep.source)
        assertEquals("groq", rep.fournisseur)
        assertEquals("llama-3.3-70b-versatile", rep.modele)

        val item = VaultRecordItem(
            id = "charte-slow-travel",
            category = "Manifeste",
            title = "La Charte Slow Travel",
            content = "Habiter un lieu plutôt que le consommer.",
            location = "Madère"
        )
        assertEquals("charte-slow-travel", item.id)
        assertEquals("Manifeste", item.category)
        assertEquals("Madère", item.location)
    }

    @Test
    fun `cles SharedPreferences auth sont stables`() {
        assertEquals("heldonica_mobile_auth", BrainClient.PREFS_AUTH)
        assertEquals("cms_password", BrainClient.PREF_KEY_CMS_PASSWORD)
    }
}
