package fr.heldonica.mobile

import org.json.JSONArray
import org.json.JSONObject
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
    fun `parsing de fiche vault simulee extrait les champs`() {
        val jsonMock = """
            {
                "records": [
                    {
                        "id": "charte-slow-travel",
                        "category": "Manifeste",
                        "title": "La Charte Slow Travel Heldonica",
                        "content": "Prendre le temps d'habiter un lieu plutôt que de le consommer."
                    },
                    {
                        "id": "dest-madere",
                        "category": "Destination",
                        "title": "Madère Fajãs",
                        "location": "Madère",
                        "content": "Sentiers côtiers escarpés."
                    }
                ]
            }
        """.trimIndent()

        val root = JSONObject(jsonMock)
        val arr = root.optJSONArray("records") ?: JSONArray()
        assertEquals(2, arr.length())

        val rec1 = arr.getJSONObject(0)
        assertEquals("charte-slow-travel", rec1.optString("id"))
        assertEquals("Manifeste", rec1.optString("category"))
        assertEquals("La Charte Slow Travel Heldonica", rec1.optString("title"))

        val rec2 = arr.getJSONObject(1)
        assertEquals("Madère", rec2.optString("location"))
    }
}
