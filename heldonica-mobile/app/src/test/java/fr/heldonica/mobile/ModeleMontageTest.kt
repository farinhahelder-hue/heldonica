package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class ModeleMontageTest {

    @Test
    fun `les modeles predefinis ont des reglages coherents`() {
        val flow = ModelesMontagePredefinis.FLOW_CINEMA_SHORT
        assertEquals(4000L, flow.dureePlanMs)
        assertTrue(flow.avecFondu)
        assertEquals(0.80f, flow.volumeMusique, 0.01f)
        assertFalse(flow.garderSonOriginal)

        val slow = ModelesMontagePredefinis.TERRAIN_SLOW_TRAVEL
        assertEquals(6000L, slow.dureePlanMs)
        assertTrue(slow.garderSonOriginal)
        assertEquals(0.25f, slow.volumeMusique, 0.01f)

        val reels = ModelesMontagePredefinis.REELS_RYTHME
        assertEquals(2500L, reels.dureePlanMs)
        assertFalse(reels.avecFondu)
        assertEquals(0.90f, reels.volumeMusique, 0.01f)
    }

    @Test
    fun `liste de tous les modeles non vide`() {
        assertEquals(3, ModelesMontagePredefinis.TOUS.size)
        assertTrue(ModelesMontagePredefinis.TOUS.any { it.id == "flow_cinema_short" })
    }
}
