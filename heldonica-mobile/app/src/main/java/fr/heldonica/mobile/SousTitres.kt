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

    // Comme le fondu : les instants recus suivent le montage entier, les
    // segments sont decoupes au temps du plan. Origine accorde les deux.
    private val origine = Origine()

    private val reglages = OverlaySettings.Builder()
        // Bas de l'image, comme le texte fixe : le haut d'un Reel est masque par
        // l'interface d'Instagram.
        .setBackgroundFrameAnchor(0f, -0.7f)
        .build()

    private val efface = OverlaySettings.Builder()
        .setBackgroundFrameAnchor(0f, -0.7f)
        .setAlphaScale(0f)
        .build()

    /** Le segment a cet instant du plan, ou null entre deux phrases. */
    private fun segmentA(presentationTimeUs: Long): Segment? {
        val seconde = origine.relatif(presentationTimeUs) / 1_000_000.0
        // Les segments arrivent dans l'ordre et ne se chevauchent pas : le
        // premier qui contient l'instant est le bon.
        return segments.firstOrNull { seconde >= it.debutS && seconde < it.finS }
    }

    override fun getOverlaySettings(presentationTimeUs: Long): OverlaySettings =
        // Entre deux phrases, le calque est efface. L'espace rendu par getText
        // ne porte aucun fond et ne se verrait pas, mais l'effacer est plus
        // franc que de compter sur une transparence de circonstance.
        if (segmentA(presentationTimeUs) == null) efface else reglages

    override fun getText(presentationTimeUs: Long): SpannableString {
        val courant = segmentA(presentationTimeUs)

        // Hors segment, un espace et non une chaine vide : TextOverlay mesure
        // le texte pour dimensionner sa bitmap, et une chaine vide donne une
        // bitmap de zero pixel — Bitmap.createBitmap leve alors
        // "width and height must be > 0", et tout l'encodage tombe.
        //
        // Le montage entier echouait donc des qu'un silence separait deux
        // phrases, c'est-a-dire presque toujours. Un premier essai y avait
        // echappe par chance : son unique segment couvrait le plan de bout en
        // bout, et le cas vide ne s'est jamais presente.
        val texte = courant?.texte ?: " "

        return SpannableString(texte).apply {
            if (courant == null) return@apply
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
