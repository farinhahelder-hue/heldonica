package fr.heldonica.mobile

import android.graphics.Bitmap
import android.graphics.Color
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.BitmapOverlay
import androidx.media3.effect.OverlaySettings
import kotlin.math.abs

/**
 * Fondu au noir entre les plans.
 *
 * Media3 ne fournit pas de fondu enchaine : deux plans d'une meme sequence ne se
 * superposent jamais, et les faire se chevaucher demanderait d'ecrire un shader.
 *
 * Ce qu'on peut faire avec l'API publique : poser un calque noir sur toute
 * l'image et faire varier son opacite. OverlaySettings est recalcule a chaque
 * image, avec l'horodatage — c'est le meme mecanisme que les sous-titres. Le
 * plan sortant s'assombrit jusqu'au noir a la coupe, puis le suivant s'eclaircit.
 *
 * Ce n'est donc pas un fondu enchaine mais un fondu au noir, et l'ecran le dit :
 * annoncer l'un pour l'autre reviendrait a promettre ce qu'on ne livre pas.
 */
@OptIn(UnstableApi::class)
class CalqueFondu(
    /** Instants des coupes, en microsecondes, comptes depuis le debut du plan. */
    private val coupesUs: List<Long>,
    /** Duree totale du fondu, coupe au centre. */
    dureeMs: Long = 500,
) : BitmapOverlay() {

    private val moitieUs = dureeMs * 500L

    // Les instants recus sont ceux du montage entier, pas ceux du plan : mesure
    // faite, un second plan commencant a 3 s recoit 3 s a sa premiere image.
    // Origine ramene le compte a zero quelle que soit la convention.
    private val origine = Origine()

    // Un carre uni suffit : il est etire sur toute l'image par setScale. Le
    // garder petit evite de transporter une image pleine resolution a chaque
    // frame, pour un contenu d'une seule couleur.
    private val noir: Bitmap =
        Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888).apply { eraseColor(Color.BLACK) }

    override fun getBitmap(presentationTimeUs: Long): Bitmap = noir

    override fun getOverlaySettings(presentationTimeUs: Long): OverlaySettings =
        OverlaySettings.Builder()
            .setAlphaScale(opacite(origine.relatif(presentationTimeUs)))
            // Le calque doit deborder de l'image : un carre de 64 pixels sur une
            // video verticale ne couvrirait qu'un timbre-poste.
            .setScale(100f, 100f)
            .build()

    /**
     * Opacite du noir a cet instant du plan : 1 exactement sur la coupe, 0 des
     * qu'on s'en eloigne de plus d'une demi-duree.
     */
    private fun opacite(instantDuPlanUs: Long): Float {
        if (moitieUs <= 0) return 0f
        val plusProche = coupesUs.minOfOrNull { abs(instantDuPlanUs - it) } ?: return 0f
        if (plusProche >= moitieUs) return 0f
        return 1f - (plusProche.toFloat() / moitieUs.toFloat())
    }
}
