package fr.heldonica.mobile

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Connexion au CMS par le compte Google du proprietaire, cote telephone.
 *
 * Pourquoi ce module existe
 * -------------------------
 * Le panel s'affiche dans une vue web. Or Google **refuse** une authentification
 * OAuth dans une WebView (`disallowed_useragent`) : le bouton web ne peut donc pas
 * servir ici. La connexion se fait donc en natif — Credential Manager obtient un
 * jeton d'identite, que l'on echange contre le meme cookie de session que le mot
 * de passe. La vue web ne voit qu'un cookie deja pose, rien d'autre.
 *
 * Ce module ne remplace pas le mot de passe : sans client configure, ou si
 * l'utilisateur ferme la fenetre Google, l'appelant garde le mot de passe comme
 * voie normale.
 */
object ConnexionGoogle {

    private const val TAG = "Heldonica"
    const val COOKIE_SESSION = "heldonica_cms_session"

    sealed interface Resultat {
        data class Succes(val cookie: String) : Resultat
        /** Pas de connexion Google possible ici : l'appelant retombe sur le mot de passe. */
        data object Indisponible : Resultat
        data object Annule : Resultat
        data class Echec(val message: String) : Resultat
    }

    fun estConfiguree(): Boolean = BuildConfig.GOOGLE_SIGNIN_CLIENT_ID.isNotBlank()

    /**
     * Ouvre le selecteur de compte Google, puis echange le jeton contre la session.
     *
     * On propose tous les comptes de l'appareil, pas seulement ceux deja
     * autorises : le proprietaire se connecte rarement depuis ce telephone. Cette
     * largeur n'ouvre rien — l'adresse autorisee est verifiee cote serveur, sur
     * un jeton dont la signature et l'audience sont deja controlees.
     */
    suspend fun connecter(context: Context): Resultat {
        val clientId = BuildConfig.GOOGLE_SIGNIN_CLIENT_ID
        if (clientId.isBlank()) return Resultat.Indisponible

        // Deux temps, dans cet ordre : d'abord les comptes deja autorises avec
        // selection automatique (le proprietaire revient, rien a toucher) ; si
        // l'appareil n'en a aucun, on rouvre en proposant tous les comptes, sinon
        // la toute premiere connexion serait impossible.
        val jeton = try {
            demanderJeton(context, clientId, comptesAutorises = true)
                ?: demanderJeton(context, clientId, comptesAutorises = false)
        } catch (e: GetCredentialCancellationException) {
            // L'utilisateur a ferme la fenetre : ce n'est pas une erreur a afficher.
            return Resultat.Annule
        } ?: return Resultat.Indisponible

        return echangerJeton(jeton)
    }

    /**
     * Rend le jeton, ou `null` quand aucun compte n'est propose (l'appelant
     * retombe alors sur le mot de passe).
     */
    private suspend fun demanderJeton(
        context: Context,
        clientId: String,
        comptesAutorises: Boolean
    ): String? = try {
        val option = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(comptesAutorises)
            .setServerClientId(clientId)
            .setAutoSelectEnabled(comptesAutorises)
            .build()
        val requete = GetCredentialRequest.Builder()
            .addCredentialOption(option)
            .build()

        val reponse = CredentialManager.create(context)
            .getCredential(context = context, request = requete)
        val credencial = reponse.credential

        if (credencial is CustomCredential &&
            credencial.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            GoogleIdTokenCredential.createFrom(credencial.data).idToken
        } else {
            Log.w(TAG, "Credential inattendu: ${credencial.type}")
            null
        }
    } catch (e: NoCredentialException) {
        // Cas normal du premier passage : aucun compte autorise connu.
        Log.i(TAG, "Aucun compte Google autorise sur l'appareil")
        null
    } catch (e: GetCredentialCancellationException) {
        // Remonte a connecter(), qui en fait un Resultat.Annule.
        throw e
    } catch (e: GetCredentialException) {
        Log.e(TAG, "Connexion Google refusee", e)
        null
    }

    /** Echange le jeton d'identite contre le cookie de session signe. */
    private suspend fun echangerJeton(idToken: String): Resultat = withContext(Dispatchers.IO) {
        val base = BuildConfig.CMS_BASE_URL.trimEnd('/')
        try {
            val client = OkHttpClient.Builder().callTimeout(30, TimeUnit.SECONDS).build()
            val requete = Request.Builder()
                .url("$base/api/cms/auth/google")
                .post(
                    JSONObject().put("idToken", idToken).toString()
                        .toRequestBody("application/json".toMediaType())
                )
                .build()

            client.newCall(requete).execute().use { r ->
                if (!r.isSuccessful) {
                    Log.e(TAG, "Session Google refusee ${r.code}")
                    return@withContext when (r.code) {
                        503 -> Resultat.Indisponible
                        429 -> Resultat.Echec("Trop de tentatives. Reessaie dans une minute.")
                        else -> Resultat.Echec("Ce compte n'est pas autorise.")
                    }
                }
                // Le cookie voyage dans Set-Cookie ; on n'en garde que la valeur,
                // les attributs etant reposes par CookieManager.
                val cookie = extraireCookie(r.headers("Set-Cookie"))

                if (cookie == null) Resultat.Echec("Session illisible dans la reponse.")
                else Resultat.Succes(cookie)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Echange du jeton Google echoue", e)
            Resultat.Echec("Connexion au serveur impossible.")
        }
    }

    /**
     * Valeur du cookie de session dans les en-tetes `Set-Cookie`.
     *
     * Isole du reseau pour etre verifiable : c'est le genre de lecture qui casse
     * en silence (mauvais en-tete choisi, attribut garde par erreur) et qui ne se
     * voit qu'en production, sous la forme d'une page de connexion qui revient.
     */
    internal fun extraireCookie(enTetes: List<String>): String? =
        enTetes
            .firstOrNull { it.startsWith("$COOKIE_SESSION=") }
            ?.substringAfter("=")
            ?.substringBefore(";")
            ?.takeIf { it.isNotBlank() }
}
