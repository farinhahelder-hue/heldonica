package fr.heldonica.mobile

import android.graphics.Color
import android.text.Spannable
import android.text.SpannableString
import android.text.style.AbsoluteSizeSpan
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.OverlaySettings
import androidx.media3.effect.TextOverlay

/**
 * Sous-titres incrustes, au fil du montage.
 *
 * Un Reel se regarde sans le son : ce qui n'est pas ecrit a l'image n'est pas
 * lu. Les sous-titres y comptent donc plus que sur une video qu'on ouvre pour
 * l'ecouter.
 *
 * Media3 ne connait pas de piste de sous-titres a l'encodage. En revanche
 * TextOverlay rend son texte a chaque image, et recoit l'horodatage : il suffit
 * de rendre celui du segment en cours. C'est ainsi qu'on fait des sous-titres
 * graves dans l'image.
 */

/** Un segment tel que la route de transcription le rend. */
data class Segment(val debutS: Double, val finS: Double, val texte: String)

@OptIn(UnstableApi::class)
class CalqueSousTitres(
    private val segments: List<Segment>,
) : TextOverlay() {

    private val reglages = OverlaySettings.Builder()
        // Bas de l'image, comme le texte fixe : le haut d'un Reel est masque par
        // l'interface d'Instagram.
        .setBackgroundFrameAnchor(0f, -0.7f)
        .build()

    override fun getOverlaySettings(presentationTimeUs: Long): OverlaySettings = reglages

    override fun getText(presentationTimeUs: Long): SpannableString {
        val seconde = presentationTimeUs / 1_000_000.0

        // Les segments arrivent dans l'ordre et ne se chevauchent pas : le
        // premier qui contient l'instant est le bon.
        val courant = segments.firstOrNull { seconde >= it.debutS && seconde < it.finS }

        // Hors segment, on rend une chaine vide plutot que null : TextOverlay
        // exige un texte, et une chaine vide n'affiche rien.
        val texte = courant?.texte ?: ""

        return SpannableString(texte).apply {
            if (texte.isEmpty()) return@apply
            setSpan(ForegroundColorSpan(Color.WHITE), 0, texte.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
            // Fond sombre translucide : sans lui, un sous-titre blanc devient
            // illisible des que l'image sous-jacente est claire - un ciel, un mur.
            setSpan(
                BackgroundColorSpan(Color.argb(160, 0, 0, 0)),
                0, texte.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            setSpan(AbsoluteSizeSpan(56), 0, texte.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
    }
}
