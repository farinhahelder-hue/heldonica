package fr.heldonica.mobile

import android.net.Uri

/**
 * Modèles de montage automatique pour l'assemblage Media3 sur smartphone (Poco X6 Pro).
 *
 * Permet d'importer une série de clips (ex: générés dans Google Flow ou capturés sur le terrain)
 * et une musique (ex: Google Lyria / Flow Music 0€ commercial) et d'appliquer
 * instantanément un gabarit de montage (durées cibles, coupes, fondus, mixage audio).
 */
data class ModeleMontage(
    val id: String,
    val nom: String,
    val description: String,
    val dureePlanMs: Long,
    val avecFondu: Boolean = true,
    val dureeFonduMs: Long = 400L,
    val volumeMusique: Float = 0.75f,
    val garderSonOriginal: Boolean = false,
    val ratio: String = "9:16"
)

object ModelesMontagePredefinis {

    /**
     * Modèle Shorts Google Flow + Lyria :
     * 6 plans dynamiques de 4 secondes chacun (~24s au total), fondus au noir soignés,
     * musique cinématique Lyria mise en valeur (80% volume), son original coupé.
     */
    val FLOW_CINEMA_SHORT = ModeleMontage(
        id = "flow_cinema_short",
        nom = "🏛️ Flow Cinéma (9:16)",
        description = "6 plans de 4s, fondus doux 400ms, musique Lyria à 80%",
        dureePlanMs = 4000L,
        avecFondu = true,
        dureeFonduMs = 400L,
        volumeMusique = 0.80f,
        garderSonOriginal = false
    )

    /**
     * Modèle Récit Slow Travel de Terrain :
     * Plans contemplatifs de 6 secondes, son d'ambiance de terrain conservé,
     * musique d'atmosphère discrète (25% volume).
     */
    val TERRAIN_SLOW_TRAVEL = ModeleMontage(
        id = "terrain_slow_travel",
        nom = "🌿 Slow Travel Terrain",
        description = "Plans contemplatifs 6s, son direct + nappe d'ambiance 25%",
        dureePlanMs = 6000L,
        avecFondu = true,
        dureeFonduMs = 500L,
        volumeMusique = 0.25f,
        garderSonOriginal = true
    )

    /**
     * Modèle Rythmé Réseaux (Reels / TikTok) :
     * Plans punchy de 2.5 secondes, coupes franches sans fondu, musique percutante à 90%.
     */
    val REELS_RYTHME = ModeleMontage(
        id = "reels_rythme",
        nom = "⚡ Reels Punchy (9:16)",
        description = "Plans ultra-courts 2.5s, coupes franches, musique à 90%",
        dureePlanMs = 2500L,
        avecFondu = false,
        dureeFonduMs = 0L,
        volumeMusique = 0.90f,
        garderSonOriginal = false
    )

    val TOUS = listOf(FLOW_CINEMA_SHORT, TERRAIN_SLOW_TRAVEL, REELS_RYTHME)
}

/**
 * Transforme une liste de vidéos brutes en une liste de [Plan] calibrés selon le modèle choisi.
 */
fun appliquerModeleMontage(
    urisVideos: List<Uri>,
    dureesReellesMs: List<Long>,
    modele: ModeleMontage
): List<Plan> {
    return urisVideos.mapIndexed { index, uri ->
        val dureeReelle = dureesReellesMs.getOrElse(index) { 0L }
        val finCalculee = if (dureeReelle > 0L) {
            minOf(dureeReelle, modele.dureePlanMs)
        } else {
            modele.dureePlanMs
        }
        Plan(
            uri = uri,
            debutMs = 0L,
            finMs = finCalculee,
            dureeMs = if (dureeReelle > 0L) dureeReelle else modele.dureePlanMs
        )
    }
}
