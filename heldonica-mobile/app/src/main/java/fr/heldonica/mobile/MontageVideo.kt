package fr.heldonica.mobile

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import kotlinx.coroutines.suspendCancellableCoroutine
import java.io.File
import kotlin.coroutines.resume

/**
 * Montage video, sur le telephone.
 *
 * L'assemblage vivait cote serveur, dans une route qui appelait fluent-ffmpeg.
 * Elle ne pouvait pas fonctionner : les fonctions Vercel n'embarquent pas le
 * binaire ffmpeg, leur systeme de fichiers est en lecture seule et leur temps
 * d'execution plafonne bien en deca d'un encodage video.
 *
 * Le telephone est le bon endroit. Les videos y sont deja - les televerser pour
 * les redescendre serait absurde - et Android sait encoder en materiel.
 *
 * Media3 Transformer s'appuie sur MediaCodec : rien a embarquer, contrairement a
 * ffmpeg-kit, la voie habituelle, retiree en 2025.
 *
 * Ce que fait cette premiere version : couper chaque plan entre un debut et une
 * fin, puis les mettre bout a bout. Les transitions demandent la couche d'effets,
 * elles viendront apres.
 */

/** Un plan et ses bornes. `finMs` a zero signifie « jusqu'au bout ». */
data class Plan(val uri: Uri, val debutMs: Long = 0, val finMs: Long = 0)

sealed interface ResultatMontage {
    data class Reussi(val fichier: File, val dureeMs: Long) : ResultatMontage
    data class Echoue(val motif: String) : ResultatMontage
}

@OptIn(UnstableApi::class)
suspend fun monterVideo(
    contexte: Context,
    plans: List<Plan>,
    surProgression: (Int) -> Unit = {},
): ResultatMontage {
    if (plans.isEmpty()) return ResultatMontage.Echoue("Aucun plan à monter.")

    val sortie = File(contexte.cacheDir, "montage-${System.currentTimeMillis()}.mp4")

    val morceaux = plans.map { plan ->
        val media = MediaItem.Builder()
            .setUri(plan.uri)
            .apply {
                // Une configuration de decoupe n'est posee que si des bornes ont
                // ete demandees : sans cela, un plan garde jusqu'au bout serait
                // tronque a zero.
                if (plan.debutMs > 0 || plan.finMs > 0) {
                    setClippingConfiguration(
                        MediaItem.ClippingConfiguration.Builder()
                            .setStartPositionMs(plan.debutMs)
                            .apply { if (plan.finMs > 0) setEndPositionMs(plan.finMs) }
                            .build()
                    )
                }
            }
            .build()

        EditedMediaItem.Builder(media).build()
    }

    return suspendCancellableCoroutine { suite ->
        val transformer = Transformer.Builder(contexte)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(composition: Composition, resultat: ExportResult) {
                    surProgression(100)
                    Log.i(TAG_MONTAGE, "Montage termine : ${sortie.length()} octets")
                    suite.resume(ResultatMontage.Reussi(sortie, resultat.durationMs))
                }

                override fun onError(
                    composition: Composition,
                    resultat: ExportResult,
                    erreur: ExportException,
                ) {
                    Log.e(TAG_MONTAGE, "Montage echoue", erreur)
                    // Le code d'erreur seul ne dit rien a qui monte une video :
                    // on traduit les deux cas qui arrivent vraiment.
                    val motif = when (erreur.errorCode) {
                        ExportException.ERROR_CODE_DECODING_FORMAT_UNSUPPORTED,
                        ExportException.ERROR_CODE_ENCODING_FORMAT_UNSUPPORTED ->
                            "Un des formats vidéo n'est pas géré par ce téléphone."
                        ExportException.ERROR_CODE_IO_FILE_NOT_FOUND ->
                            "Une des vidéos est introuvable."
                        else -> "Le montage a échoué (${erreur.errorCode})."
                    }
                    suite.resume(ResultatMontage.Echoue(motif))
                }
            })
            .build()

        val composition = Composition.Builder(
            // Constructeur et non Builder : celui-ci n'arrive qu'en 1.6.
            listOf(EditedMediaItemSequence(morceaux))
        ).build()

        transformer.start(composition, sortie.absolutePath)

        // L'annulation de la coroutine doit arreter l'encodage : sans cela il
        // continue en fond, batterie comprise, pour un fichier que personne
        // n'attend plus.
        suite.invokeOnCancellation { transformer.cancel() }
    }
}

private const val TAG_MONTAGE = "Heldonica"
