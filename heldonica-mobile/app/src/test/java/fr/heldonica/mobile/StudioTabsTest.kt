package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class StudioTabsTest {

    @Test
    fun `sept onglets, creer par defaut`() {
        assertEquals(7, OngletStudio.values().size)
        assertEquals(OngletStudio.CREER, OngletStudio.parDefaut())
    }

    @Test
    fun `url console absente ou vide donne null`() {
        assertNull(urlConsoleBrain(null))
        assertNull(urlConsoleBrain(""))
        assertNull(urlConsoleBrain("   "))
    }

    @Test
    fun `url console garde https et rogne le slash`() {
        assertEquals("https://h.example.fr/console", urlConsoleBrain("https://h.example.fr/console/"))
    }

    @Test
    fun `url console refuse le non-http`() {
        assertNull(urlConsoleBrain("ftp://x"))
        assertNull(urlConsoleBrain("phrase sans url"))
    }
}
