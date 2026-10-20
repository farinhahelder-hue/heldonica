package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class MemoriaImperiumTest {

    @Test
    fun `construirePrompt demande le format 4 scenes 9_16 pour le sujet`() {
        val prompt = ScenarioMemoria.construirePrompt("Le siège d'Alésia")
        assertTrue(prompt.contains("Le siège d'Alésia"))
        assertTrue(prompt.contains("SCENE 1 |"))
        assertTrue(prompt.contains("9:16"))
    }

    @Test
    fun `parserScenario analyse une reponse structuree du modele local`() {
        val brut = """
            TITRE: Vercingétorix à Alésia
            EPOQUE: 52 av. J.-C. — Gaule
            SOURCES: Jules César (Guerre des Gaules, VII).
            SCENE 1 | LE DOUBLE ENCERCLÉ | En 52 avant notre ère, César enferme Vercingétorix dans Alésia derrière deux lignes de fortifications. | Julius Caesar double siege lines around Alesia hilltop fortress, 9:16 vertical
            SCENE 2 | L'ASSAUT DE SECOURS | Deux cent mille Gaulois surgissent à l'horizon pour briser le blocus romain. | Gallic relief army charging Roman wooden ramparts at dusk, dramatic oil painting
            SCENE 3 | LA REDDITION | Affamé, le chef arverne dépose ses armes aux pieds du proconsul romain. | Vercingetorix surrendering his weapons before Julius Caesar, neoclassical painting, 9:16 vertical
            SCENE 4 | LA FIN DE LA GAULE LIBRE | Alésia scelle le destin de la Gaule, qui devient province romaine pour cinq siècles. | Roman eagle standard planted over Alesia at sunrise, cinematic 9:16
        """.trimIndent()

        val preset = ScenarioMemoria.parserScenario("Alésia", brut)
        assertEquals("ia_al_sia", preset.id)
        assertEquals("Vercingétorix à Alésia", preset.titre)
        assertEquals("52 av. J.-C. — Gaule", preset.epoque)
        assertTrue(preset.sourcesAntiques.contains("Guerre des Gaules"))
        assertEquals(4, preset.scenes.size)
        assertEquals("LE DOUBLE ENCERCLÉ", preset.scenes[0].badge)
        assertTrue(preset.scenes[1].promptVisuel.contains("9:16"))
    }

    @Test
    fun `parserScenario replie proprement si le modele 1_5B repond sans barres verticales`() {
        val brut = """
            TITRE: La révolte de Spartacus
            Scène 1: En 73 av. J.-C., soixante-dix gladiateurs s'échappent de l'école de Capoue.
            Scène 2: Réfugiés sur le Vésuve, ils mettent en déroute les premières cohortes envoyées par Rome.
            Scène 3: Une armée d'esclaves parcourt l'Italie et défait les consuls romains.
            Scène 4: Crassus finit par piéger Spartacus en Lucanie pour l'ultime bataille.
        """.trimIndent()

        val preset = ScenarioMemoria.parserScenario("Spartacus", brut)
        assertEquals("La révolte de Spartacus", preset.titre)
        assertEquals(4, preset.scenes.size)
        assertTrue(preset.scenes[0].narration.contains("Capoue"))
        assertTrue(preset.scenes.all { it.promptVisuel.contains("9:16") })
    }
}
