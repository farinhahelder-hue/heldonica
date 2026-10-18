package fr.heldonica.mobile

import org.junit.Assert.*
import org.junit.Test

class CoordinationAgentsTest {

    @Test
    fun `confier par arobase ou par verbe`() {
        assertEquals(
            CommandeAgent.Confier("jules", "corrige les liens cassés du blog"),
            CoordinationAgents.analyser("@Jules corrige les liens cassés du blog")
        )
        assertEquals(
            CommandeAgent.Confier("gemini", "prépare un carrousel Madère"),
            CoordinationAgents.analyser("donne à gemini : prépare un carrousel Madère")
        )
        assertEquals(
            CommandeAgent.Confier("muse-spark", "relis le script Pélusium"),
            CoordinationAgents.analyser("demande a muse-spark, relis le script Pélusium")
        )
    }

    @Test
    fun `valider et renvoyer avec ou sans commentaire`() {
        assertEquals(CommandeAgent.Valider("ab12cd34", ""), CoordinationAgents.analyser("valide #AB12CD34"))
        assertEquals(CommandeAgent.Valider("ab12", "parfait"), CoordinationAgents.analyser("Valide la tâche ab12 : parfait"))
        assertEquals(
            CommandeAgent.Renvoyer("ab12", "il manque les photos"),
            CoordinationAgents.analyser("renvoie #ab12 : il manque les photos")
        )
    }

    @Test
    fun `les questions ne sont pas des ordres`() {
        assertNull(CoordinationAgents.analyser("Où en est Jules ?"))
        assertNull(CoordinationAgents.analyser("Qu'est-ce qui attend ma validation ?"))
        assertNull(CoordinationAgents.analyser("valide ça"))
        assertNull(CoordinationAgents.analyser("@jules ok"))       // consigne trop courte pour l'API
        assertNull(CoordinationAgents.analyser("@inconnu fais un truc utile"))
    }

    @Test
    fun `detecte les questions sur les agents`() {
        assertTrue(CoordinationAgents.concerneLesAgents("Où en est Jules ?"))
        assertTrue(CoordinationAgents.concerneLesAgents("📊 État des tâches"))
        assertTrue(CoordinationAgents.concerneLesAgents("Qu'est-ce qui attend ma validation ?"))
        assertFalse(CoordinationAgents.concerneLesAgents("Pépites Madère"))
    }

    private fun tache(id: String, agent: String, statut: String, titre: String, prisPar: String? = null) =
        TacheAgentItem(id, id, agent, statut, titre, null, null, prisPar, null)

    @Test
    fun `resume du registre compte et liste par statut`() {
        val resume = CoordinationAgents.resumerRegistre(
            listOf(
                tache("aa11", "jules", "waiting_validation", "Corriger les liens"),
                tache("bb22", "tous", "in_progress", "Carrousel Madère", prisPar = "gemini"),
                tache("cc33", "opencode", "done", "Eval du cerveau")
            )
        )
        assertTrue(resume.contains("1 à valider, 0 bloquées, 1 en cours, 0 en attente, 1 terminées"))
        assertTrue(resume.contains("- #aa11 jules — Corriger les liens"))
        assertTrue(resume.contains("- #bb22 tous (pris par gemini) — Carrousel Madère"))
        assertFalse("les tâches terminées ne sont que comptées", resume.contains("#cc33"))
        assertTrue(resume.contains("valide #id"))
    }

    @Test
    fun `le contexte arrive dans le prompt local`() {
        val prompt = PromptLocal.construire("Où en est Jules ?", "chat", emptyList(), emptyList(), contexte = "Registre des agents : 1 à valider")
        assertTrue(prompt.contains("Registre des agents : 1 à valider"))
    }
}
