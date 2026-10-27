package fr.heldonica.mobile

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import java.io.FileOutputStream

data class PisteMusique(
    val id: String,
    val titre: String,
    val ambiance: String,
    val description: String,
    val bpm: Int,
    val duree: String,
    val fichierAsset: String?,
    val cheminReseau: String?,
    val promptGoogleFlow: String
)

object CatalogueMusique {
    private const val TAG = "CatalogueMusique"
    private var lecteurPreview: MediaPlayer? = null
    var idPisteEnLecture: String? = null
        private set

    val PISTES = listOf(
        PisteMusique(
            id = "atrium_lin_brut",
            titre = "Atrium Lin Brut",
            ambiance = "🌿 Slow Travel • Matin calme",
            description = "Guitare acoustique délicate et nappe feutrée. Respirant et serein.",
            bpm = 85,
            duree = "1:14",
            fichierAsset = "audio/atrium_lin_brut.mp3",
            cheminReseau = "/music_studio/boutique_hotel_lobby/track_01_atrium_lin_brut.mp3",
            promptGoogleFlow = "Musique acoustique intimiste de 30 secondes, guitare classique et résonance de bois, 85 BPM, nappe ambient feutrée, sans voix, contemplation slow travel."
        ),
        PisteMusique(
            id = "golden_hour_marbre",
            titre = "Golden Hour Marbre",
            ambiance = "☕ Boutique Hôtel • Fin de journée",
            description = "Piano feutré et jazz minimaliste. Élégant, chaleureux et intemporel.",
            bpm = 88,
            duree = "1:10",
            fichierAsset = "audio/golden_hour_marbre.mp3",
            cheminReseau = "/music_studio/boutique_hotel_lobby/track_03_golden_hour_marbre.mp3",
            promptGoogleFlow = "Piano solo feutré de 30 secondes, jazz lounge minimaliste et chaleureux, 88 BPM, réverbération intime, sans voix, ambiance hôtel de charme et fin de journée."
        ),
        PisteMusique(
            id = "echappee_slow_luxury",
            titre = "Échappée Slow Luxury",
            ambiance = "🏔️ Altitude & Sérénité",
            description = "Nappes aériennes et textures nobles 432 Hz. Idéal pour grands espaces.",
            bpm = 80,
            duree = "1:18",
            fichierAsset = "audio/echappee_slow_luxury.mp3",
            cheminReseau = "/music_studio/boutique_hotel_lobby/track_05_echappee_slow_luxury.mp3",
            promptGoogleFlow = "Nappes ambiantes organiques de 30 secondes, fréquence 432 Hz, cordes frottées très douces, 80 BPM, sans voix, sérénité et calme absolu slow travel."
        ),
        PisteMusique(
            id = "velours_noyer_fonce",
            titre = "Velours Noyer Foncé",
            ambiance = "🕯️ Intimité • Feu de bois",
            description = "Accords de guitare folk boisés et chaleur de noyer.",
            bpm = 82,
            duree = "1:16",
            fichierAsset = null,
            cheminReseau = "/music_studio/boutique_hotel_lobby/track_02_velours_noyer_fonce.mp3",
            promptGoogleFlow = "Guitare acoustique folk chaleureuse, notes lentes et espacées, 82 BPM, atmosphère boisée et intimiste, sans percussion, sans voix."
        ),
        PisteMusique(
            id = "baroque_lofi",
            titre = "Baroque Lo-Fi Study",
            ambiance = "🏛️ Histoire • Clavecin 415 Hz",
            description = "Clavecin Taskin historique avec beat feutré lo-fi.",
            bpm = 78,
            duree = "1:20",
            fichierAsset = null,
            cheminReseau = "/music_studio/baroque_lofi_study.wav",
            promptGoogleFlow = "Clavecin baroque français historique accordé à 415 Hz, battement lo-fi très doux et feutré, 78 BPM, sans voix, atmosphère studieuse et contemplative."
        ),
        PisteMusique(
            id = "fado_ambient",
            titre = "Fado Ambient Atlantique",
            ambiance = "🌊 Océan • Brume de Lisbonne",
            description = "Guitarra Portuguesa mélancolique et souffle des vagues.",
            bpm = 72,
            duree = "1:15",
            fichierAsset = null,
            cheminReseau = "/music_studio/fado_ambient_atlantique.wav",
            promptGoogleFlow = "Guitarra portuguesa solo avec nappe de brume océanique, 72 BPM, mélancolie douce du fado, sans chant, sans percussion, réverbération naturelle."
        )
    )

    /**
     * Extrait le fichier audio de l'asset ou du cache local vers un fichier lisible par Media3.
     */
    fun preparerPistePourMontage(context: Context, piste: PisteMusique): Uri? {
        val dossierMusique = File(context.cacheDir, "musiques_heldonica").apply { mkdirs() }
        val ext = if (piste.fichierAsset?.endsWith(".wav") == true || piste.cheminReseau?.endsWith(".wav") == true) ".wav" else ".mp3"
        val fichierCible = File(dossierMusique, "${piste.id}$ext")

        if (fichierCible.exists() && fichierCible.length() > 1000) {
            return Uri.fromFile(fichierCible)
        }

        // 1. Tenter depuis les assets de l'APK (hors-ligne immédiat)
        if (piste.fichierAsset != null) {
            try {
                context.assets.open(piste.fichierAsset).use { input ->
                    FileOutputStream(fichierCible).use { output ->
                        input.copyTo(output)
                    }
                }
                if (fichierCible.exists() && fichierCible.length() > 0) {
                    return Uri.fromFile(fichierCible)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Asset ${piste.fichierAsset} indisponible: ${e.message}")
            }
        }

        // 2. Repli réseau vers le serveur CMS ou Brain
        val urlReseau = piste.cheminReseau ?: return null
        val baseUrl = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val client = okhttp3.OkHttpClient()
        val requete = okhttp3.Request.Builder()
            .url("$baseUrl$urlReseau")
            .build()

        return try {
            client.newCall(requete).execute().use { reponse ->
                if (reponse.isSuccessful) {
                    val bytes = reponse.body?.bytes()
                    if (bytes != null && bytes.isNotEmpty()) {
                        fichierCible.writeBytes(bytes)
                        return Uri.fromFile(fichierCible)
                    }
                }
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Téléchargement musique échoué: ${e.message}")
            null
        }
    }

    /**
     * Joue ou arrête un court extrait d'écoute.
     */
    fun basculerPreview(context: Context, piste: PisteMusique, onEtatChange: () -> Unit) {
        if (idPisteEnLecture == piste.id) {
            arreterPreview()
            onEtatChange()
            return
        }

        arreterPreview()
        try {
            val uri = preparerPistePourMontage(context, piste) ?: return
            val lecteur = MediaPlayer.create(context, uri)
            lecteurPreview = lecteur
            idPisteEnLecture = piste.id
            lecteur.setOnCompletionListener {
                arreterPreview()
                onEtatChange()
            }
            lecteur.start()
            onEtatChange()
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lecture preview: ${e.message}")
            arreterPreview()
            onEtatChange()
        }
    }

    fun arreterPreview() {
        try {
            lecteurPreview?.stop()
            lecteurPreview?.release()
        } catch (_: Exception) {}
        lecteurPreview = null
        idPisteEnLecture = null
    }
}


@Composable
fun DialogueCatalogueMusique(
    onChoisir: (PisteMusique) -> Unit,
    onFermer: () -> Unit
) {
    val context = LocalContext.current
    var idPisteLecture by remember { mutableStateOf(CatalogueMusique.idPisteEnLecture) }

    AlertDialog(
        onDismissRequest = onFermer,
        title = {
            Column {
                Text("🎵 Musiques Heldonica", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Libres de droits • 100% slow travel", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CatalogueMusique.PISTES.forEach { piste ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (idPisteLecture == piste.id) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(piste.titre, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                Text("${piste.bpm} BPM • ${piste.duree}", style = MaterialTheme.typography.labelSmall)
                            }
                            Text(piste.ambiance, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                            Text(piste.description, style = MaterialTheme.typography.bodySmall)

                            Row(
                                modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        CatalogueMusique.basculerPreview(context, piste) {
                                            idPisteLecture = CatalogueMusique.idPisteEnLecture
                                        }
                                    },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(if (idPisteLecture == piste.id) "⏹️ Stop" else "🎧 Écouter")
                                }
                                Button(
                                    onClick = {
                                        CatalogueMusique.arreterPreview()
                                        onChoisir(piste)
                                    },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Utiliser")
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onFermer) { Text("Fermer") }
        }
    )
}
