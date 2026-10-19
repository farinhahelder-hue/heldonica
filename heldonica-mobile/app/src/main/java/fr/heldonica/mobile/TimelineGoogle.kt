package fr.heldonica.mobile

import org.json.JSONObject
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId

/**
 * Un séjour de l'historique Google Timeline : un endroit où on est resté.
 *
 * Google n'offre aucune API pour lire Timeline : depuis 2024 l'historique vit
 * sur le téléphone, et seul son export (Paramètres → Position → Timeline →
 * Exporter) en sort, sous forme d'un fichier JSON. On lit donc ce fichier, que
 * l'utilisatrice choisit elle-même ; rien n'est envoyé à Google ni ailleurs.
 *
 * Le nouvel export ne donne que des coordonnées (pas de nom de lieu) : le nom
 * vient ensuite de la photo ou d'un géocodage inverse OSM. L'ancien format
 * Takeout (`timelineObjects`) porte parfois un nom, gardé quand il existe.
 */
data class SejourTimeline(
    val debutMs: Long,
    val finMs: Long,
    val lat: Double,
    val lng: Double,
    val nom: String? = null,
    val adresse: String? = null
)

object TimelineGoogle {

    /** Une photo prise 30 min avant ou après un séjour est rattachée à ce séjour. */
    const val TOLERANCE_MS = 30 * 60 * 1000L

    /**
     * « 48.8566°, 2.3522° » (nouvel export) ou « geo:48.8566,2.3522 » → (lat, lng).
     * Rend null pour tout ce qui n'est pas une paire de coordonnées valide.
     */
    fun lireLatLng(brut: String?): Pair<Double, Double>? {
        if (brut.isNullOrBlank()) return null
        val nombres = Regex("-?\\d+(?:\\.\\d+)?").findAll(brut).map { it.value.toDouble() }.toList()
        if (nombres.size < 2) return null
        val (lat, lng) = nombres[0] to nombres[1]
        if (lat !in -90.0..90.0 || lng !in -180.0..180.0) return null
        return lat to lng
    }

    private fun lireInstant(brut: String?): Long? {
        if (brut.isNullOrBlank()) return null
        return runCatching { OffsetDateTime.parse(brut).toInstant().toEpochMilli() }.getOrNull()
    }

    /**
     * Séjours de l'export, triés par début. `depuisMs`/`jusquaMs` bornent la
     * lecture : un historique de plusieurs années pèse des dizaines de Mo, et
     * seuls les jours du voyage servent.
     */
    fun analyser(
        json: String,
        depuisMs: Long = Long.MIN_VALUE,
        jusquaMs: Long = Long.MAX_VALUE
    ): List<SejourTimeline> {
        val racine = runCatching { JSONObject(json) }.getOrNull() ?: return emptyList()
        val sejours = mutableListOf<SejourTimeline>()

        fun garder(s: SejourTimeline) {
            if (s.finMs >= depuisMs && s.debutMs <= jusquaMs) sejours += s
        }

        // Nouvel export (Android, depuis 2024).
        racine.optJSONArray("semanticSegments")?.let { segments ->
            for (i in 0 until segments.length()) {
                val seg = segments.optJSONObject(i) ?: continue
                val visite = seg.optJSONObject("visit") ?: continue
                val debut = lireInstant(seg.optString("startTime")) ?: continue
                val fin = lireInstant(seg.optString("endTime")) ?: debut
                val lieu = visite.optJSONObject("topCandidate")?.optJSONObject("placeLocation")
                val (lat, lng) = lireLatLng(lieu?.optString("latLng")) ?: continue
                garder(SejourTimeline(debut, fin, lat, lng))
            }
        }

        // Ancien export Takeout (« Historique des positions »).
        racine.optJSONArray("timelineObjects")?.let { objets ->
            for (i in 0 until objets.length()) {
                val visite = objets.optJSONObject(i)?.optJSONObject("placeVisit") ?: continue
                val lieu = visite.optJSONObject("location") ?: continue
                val duree = visite.optJSONObject("duration") ?: continue
                val debut = lireInstant(duree.optString("startTimestamp"))
                    ?: duree.optString("startTimestampMs").toLongOrNull() ?: continue
                val fin = lireInstant(duree.optString("endTimestamp"))
                    ?: duree.optString("endTimestampMs").toLongOrNull() ?: debut
                if (!lieu.has("latitudeE7") || !lieu.has("longitudeE7")) continue
                garder(
                    SejourTimeline(
                        debut, fin,
                        lieu.getLong("latitudeE7") / 1e7,
                        lieu.getLong("longitudeE7") / 1e7,
                        nom = lieu.optString("name").takeIf { it.isNotBlank() },
                        adresse = lieu.optString("address").takeIf { it.isNotBlank() }
                    )
                )
            }
        }

        return sejours.sortedBy { it.debutMs }
    }

    /**
     * Le séjour où se trouvait le téléphone à cet instant : celui qui le contient,
     * sinon le plus proche à moins de `toleranceMs`, sinon null. Null veut dire
     * « on ne sait pas » : l'appelant demande le lieu, il ne le devine jamais.
     */
    fun sejourPour(
        sejours: List<SejourTimeline>,
        instantMs: Long,
        toleranceMs: Long = TOLERANCE_MS
    ): SejourTimeline? {
        sejours.firstOrNull { instantMs in it.debutMs..it.finMs }?.let { return it }
        return sejours
            .map { it to minOf(kotlin.math.abs(instantMs - it.debutMs), kotlin.math.abs(instantMs - it.finMs)) }
            .filter { it.second <= toleranceMs }
            .minByOrNull { it.second }
            ?.first
    }

    /**
     * Date EXIF (« 2026:08:28 09:14:00 », heure locale sans fuseau) → instant.
     * L'heure est lue dans le fuseau du téléphone : le voyage peut avoir eu lieu
     * dans un autre, d'où la tolérance de `sejourPour` et la vérification
     * humaine avant d'écrire quoi que ce soit.
     */
    fun instantExif(brut: String?, fuseau: ZoneId = ZoneId.systemDefault()): Long? {
        if (brut.isNullOrBlank()) return null
        return runCatching {
            val (jour, heure) = brut.trim().split(" ")
            val ldt = LocalDateTime.parse("${jour.replace(':', '-')}T$heure")
            ldt.atZone(fuseau).toInstant().toEpochMilli()
        }.getOrNull()
    }
}
