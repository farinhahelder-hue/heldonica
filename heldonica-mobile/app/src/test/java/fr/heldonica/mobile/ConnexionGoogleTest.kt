package fr.heldonica.mobile

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Lecture du cookie de session dans les en-tetes `Set-Cookie`.
 *
 * La route pose le cookie avec ses attributs (`Path`, `HttpOnly`, `SameSite`).
 * Garder un attribut par erreur donnerait une valeur tronquee qui ne serait
 * refusee qu'en production, par une page de connexion qui revient.
 */
class ConnexionGoogleTest {

    @Test
    fun `extrait la valeur seule, sans les attributs`() {
        val enTetes = listOf("heldonica_cms_session=abc123.signature; Path=/; HttpOnly; SameSite=Strict")
        assertEquals("abc123.signature", ConnexionGoogle.extraireCookie(enTetes))
    }

    @Test
    fun `ignore les autres cookies et garde le bon`() {
        val enTetes = listOf(
            "autre_cookie=quelquechose; Path=/",
            "heldonica_cms_session=la-bonne; Path=/"
        )
        assertEquals("la-bonne", ConnexionGoogle.extraireCookie(enTetes))
    }

    @Test
    fun `sans cookie de session rend null`() {
        assertNull(ConnexionGoogle.extraireCookie(listOf("autre_cookie=x")))
        assertNull(ConnexionGoogle.extraireCookie(emptyList()))
    }

    @Test
    fun `un cookie vide ne compte pas comme une session`() {
        assertNull(ConnexionGoogle.extraireCookie(listOf("heldonica_cms_session=; Path=/")))
    }
}
