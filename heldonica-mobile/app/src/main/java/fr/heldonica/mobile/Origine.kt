package fr.heldonica.mobile

/**
 * Ramene les horodatages d'un calque au temps du plan.
 *
 * Media3 ne dit pas quel temps recoit un effet pose sur un plan : celui du plan
 * (zero a la premiere image), celui du montage entier (decale par les plans
 * precedents), ou celui du fichier source (decale par la decoupe). Les trois
 * conventions se defendent, et se tromper deplace sous-titres et fondus sans
 * qu'aucune erreur ne soit levee — le meme genre de panne muette qui avait deja
 * fait passer les calques pour poses alors qu'ils ne l'etaient pas.
 *
 * Plutot que de parier, on retient le plus petit horodatage vu et on compte a
 * partir de lui : la premiere image du plan vaut zero, quelle que soit la
 * convention. Si Media3 comptait deja depuis zero, le calcul ne change rien.
 */
class Origine {

    private var premier = Long.MAX_VALUE

    fun relatif(presentationTimeUs: Long): Long {
        if (presentationTimeUs < premier) premier = presentationTimeUs
        return presentationTimeUs - premier
    }
}
