package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test
import java.time.OffsetDateTime
import java.time.ZoneId

class TimelineGoogleTest {

    private fun ms(iso: String) = OffsetDateTime.parse(iso).toInstant().toEpochMilli()

    private val export = """
        {"semanticSegments":[
          {"startTime":"2026-08-28T08:00:00.000+03:00","endTime":"2026-08-28T10:30:00.000+03:00",
           "visit":{"topCandidate":{"placeLocation":{"latLng":"44.4268°, 26.1025°"}}}},
          {"startTime":"2026-08-28T10:30:00.000+03:00","endTime":"2026-08-28T11:00:00.000+03:00",
           "activity":{"topCandidate":{"type":"WALKING"}}},
          {"startTime":"2026-08-28T12:00:00.000+03:00","endTime":"2026-08-28T15:00:00.000+03:00",
           "visit":{"topCandidate":{"placeLocation":{"latLng":"45.6427°, 25.5887°"}}}}
        ]}
    """.trimIndent()

    @Test
    fun `lit les visites et ignore les trajets`() {
        val s = TimelineGoogle.analyser(export)
        assertEquals(2, s.size)
        assertEquals(44.4268, s[0].lat, 1e-6)
        assertEquals(25.5887, s[1].lng, 1e-6)
    }

    @Test
    fun `lit l'ancien format takeout avec le nom du lieu`() {
        val ancien = """{"timelineObjects":[{"placeVisit":{
            "location":{"latitudeE7":446268000,"longitudeE7":261025000,"name":"Cismigiu"},
            "duration":{"startTimestamp":"2019-05-01T10:00:00Z","endTimestamp":"2019-05-01T11:00:00Z"}}}]}"""
        val s = TimelineGoogle.analyser(ancien)
        assertEquals("Cismigiu", s.single().nom)
        assertEquals(44.6268, s.single().lat, 1e-6)
    }

    @Test
    fun `borne la lecture aux jours du voyage`() {
        val s = TimelineGoogle.analyser(export, depuisMs = ms("2026-08-28T11:30:00+03:00"))
        assertEquals(1, s.size)
        assertEquals(45.6427, s.single().lat, 1e-6)
    }

    @Test
    fun `fichier illisible ou vide donne une liste vide`() {
        assertTrue(TimelineGoogle.analyser("pas du json").isEmpty())
        assertTrue(TimelineGoogle.analyser("{}").isEmpty())
    }

    @Test
    fun `une photo prise pendant le sejour y est rattachee`() {
        val s = TimelineGoogle.analyser(export)
        assertEquals(44.4268, TimelineGoogle.sejourPour(s, ms("2026-08-28T09:00:00+03:00"))!!.lat, 1e-6)
    }

    @Test
    fun `tolerance de trente minutes, au-dela on ne devine pas`() {
        val s = TimelineGoogle.analyser(export)
        // 10:50 : 20 min apres la fin du 1er sejour ; 11:20 : 50 min apres, 40 min avant le 2e
        assertEquals(44.4268, TimelineGoogle.sejourPour(s, ms("2026-08-28T10:50:00+03:00"))!!.lat, 1e-6)
        assertNull(TimelineGoogle.sejourPour(s, ms("2026-08-28T11:20:00+03:00")))
        assertNull(TimelineGoogle.sejourPour(s, ms("2026-08-30T09:00:00+03:00")))
    }

    @Test
    fun `lit les coordonnees des deux formats et refuse le reste`() {
        assertEquals(48.85 to 2.35, TimelineGoogle.lireLatLng("48.85°, 2.35°"))
        assertEquals(-12.5 to 130.0, TimelineGoogle.lireLatLng("geo:-12.5,130.0"))
        assertNull(TimelineGoogle.lireLatLng("95.0°, 2.35°"))
        assertNull(TimelineGoogle.lireLatLng("n'importe quoi"))
        assertNull(TimelineGoogle.lireLatLng(null))
    }

    @Test
    fun `date exif lue dans le fuseau donne`() {
        val attendu = ms("2026-08-28T09:14:00+03:00")
        assertEquals(attendu, TimelineGoogle.instantExif("2026:08:28 09:14:00", ZoneId.of("Europe/Bucharest")))
        assertNull(TimelineGoogle.instantExif("n'importe quoi"))
        assertNull(TimelineGoogle.instantExif(null))
    }
}
