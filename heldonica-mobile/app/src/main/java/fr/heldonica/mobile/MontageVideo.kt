package fr.heldonica.mobile

import android.content.Context
import android.graphics.Color
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.text.Spannable
import android.text.SpannableString
import android.text.style.AbsoluteSizeSpan
import android.text.style.ForegroundColorSpan
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.OverlayEffect
import androidx.media3.effect.OverlaySettings
import androidx.media3.effect.TextOverlay
import androidx.media3.effect.TextureOverlay
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import com.google.common.collect.ImmutableList
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
 * Ce qui est fait : decouper chaque plan, y incruster du texte, les mettre bout
 * a bout. Ce qui manque encore : les transitions entre plans, et une piste son.
 */

/**
 * Un plan et ses reglages.
 *
 * `finMs` a zero signifie « jusqu'au bout » : c'est la valeur au moment ou l'on
 * vient de choisir la video, avant d'avoir lu sa duree.
 */
data class Plan(
    val uri: Uri,
    val debutMs: Long = 0,
    val finMs: Long = 0,
    val dureeMs: Long = 0,
    val texte: String = "",
) {
    /** Duree du plan une fois decoupe. */
    val dureeRetenueMs: Long
        get() = (if (finMs > 0) finMs else dureeMs) - debutMs
}

sealed interface ResultatMontage {
    data class Reussi(val fichier: File, val dureeMs: Long) : ResultatMontage
    data class Echoue(val motif: String) : ResultatMontage
}

/**
 * Duree d'une video, en millisecondes.
 *
 * Sans elle, le curseur de decoupe n'a pas de borne haute : on ne peut pas
 * regler une fin sans savoir ou la video s'arrete.
 */
fun lireDuree(contexte: Context, uri: Uri): Long {
    val lecteur = MediaMetadataRetriever()
    return try {
        lecteur.setDataSource(contexte, uri)
        lecteur.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0
    } catch (e: Exception) {
        Log.e(TAG_MONTAGE, "Duree illisible pour $uri", e)
        0
    } finally {
        runCatching { lecteur.release() }
    }
}

/**
 * Texte incruste, en bas de l'image.
 *
 * La taille suit une valeur absolue plutot qu'un rapport a l'image : Media3
 * compose le calque a la resolution de la video, et un texte defini en points
 * relatifs disparaissait sur les plans verticaux.
 */
@OptIn(UnstableApi::class)
private fun calqueTexte(texte: String): TextureOverlay {
    val contenu = SpannableString(texte).apply {
        setSpan(ForegroundColorSpan(Color.WHITE), 0, texte.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        setSpan(AbsoluteSizeSpan(64), 0, texte.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
    }
    return TextOverlay.createStaticTextOverlay(
        contenu,
        OverlaySettings.Builder()
            // Ancre en bas : le haut d'un Reel est masque par l'interface
            // d'Instagram, et le bas reste lisible.
            .setBackgroundFrameAnchor(0f, -0.7f)
            .build()
    )
}

@OptIn(UnstableApi::class)
suspend fun monterVideo(
    contexte: Context,
    plans: List<Plan>,
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

        EditedMediaItem.Builder(media)
            .apply {
                if (plan.texte.isNotBlank()) {
                    setEffects(
                        Effects(
                            /* audioProcessors = */ ImmutableList.of(),
                            /* videoEffects = */ ImmutableList.of(
                                OverlayEffect(ImmutableList.of(calqueTexte(plan.texte)))
                            )
                        )
                    )
                }
            }
            .build()
    }

    return suspendCancellableCoroutine { suite ->
        val transformer = Transformer.Builder(contexte)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(composition: Composition, resultat: ExportResult) {
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
                    // on traduit les cas qui arrivent vraiment.
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
