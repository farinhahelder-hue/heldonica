package fr.heldonica.mobile

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import fr.heldonica.mobile.BuildConfig.CMS_BASE_URL
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Veille du registre `agent_tasks`.
 *
 * Le telephone remplace le poller du PC (`bridge_poller.py`) : il lit le registre
 * a intervalle regulier, sans PC allume. Ce n'est pas un service de premier plan
 * — c'est volontaire. Depuis Android 12, un service de premier plan exige une
 * notification permanente et un `foregroundServiceType`, pour un benefice nul :
 * on n'a pas besoin d'une seconde exacte, seulement d'un passage regulier.
 * `WorkManager` survit au redemarrage, respecte le mode veille (Doze) et attend
 * le reseau. Android peut repousser un cycle : c'est acceptable ici, et c'est
 * ecrit plutot que suppose.
 *
 * La veille est planifiee au premier lancement, puis pilotee depuis l'ecran
 * « Taches » (interrupteur). Un interrupteur eteint annule la tache periodique :
 * l'utilisateur peut toujours arreter ce qui tourne en fond.
 */
class VeilleTachesWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {

    companion object {
        const val NOM = "veille-taches"
        const val TAG_PREFS = "heldonica_veille"
        // « Deja configuree » (au moins une fois) et « active » sont deux choses
        // differentes. Sans la premiere, un interrupteur eteint se rallumerait a
        // chaque redemarrage de l'app : on ne saurait plus distinguer « jamais
        // configure » de « configure puis arrete ».
        const val CLE_CONFIGURE = "veilleConfiguree"
        const val CLE_DERNIER = "veilleDernierBattement"
        const val CLE_BILAN = "veilleDernierBilan"
        const val CLE_ACTIVE = "veilleActive"
        const val INTERVALLE_MINUTES = 60L
    }

    override suspend fun doWork(): Result {
        val baseUrl = CMS_BASE_URL.trimEnd('/')
        val motDePasse = BrainClient.obtenirMotDePasse(applicationContext)
        if (motDePasse.isBlank()) {
            return Result.failure(androidx.work.workDataOf("erreur" to "mot de passe CMS absent"))
        }

        return try {
            val client = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .callTimeout(45, TimeUnit.SECONDS)
                .build()

            // On lit le registre ET on demande le balayage des baux expires : le
            // meme appel sert les deux. Une tache prise par un telephone mort
            // redevient prenable au lieu de rester bloquee pour toujours.
            val requete = Request.Builder()
                .url("$baseUrl/api/agent-tasks?status=sent&limit=50&balayer=1")
                .header("x-cms-auth", motDePasse)
                .get()
                .build()

            client.newCall(requete).execute().use { reponse ->
                val corps = reponse.body?.string().orEmpty()
                if (!reponse.isSuccessful) {
                    // Une panne doit remonter : on rend `retry`, pas `success`.
                    // Un echec avale laisserait croire que la veille fonctionne.
                    return Result.retry()
                }
                val json = JSONObject(corps)
                val tableau = json.optJSONArray("tasks") ?: JSONArray()
                val enAttente = tableau.length()
                val baux = json.optInt("baux_liberes", 0)
                val horodatage = System.currentTimeMillis()

                applicationContext.getSharedPreferences(TAG_PREFS, Context.MODE_PRIVATE)
                    .edit()
                    .putLong(CLE_DERNIER, horodatage)
                    .putString(CLE_BILAN, "$enAttente en attente · $baux bail(aux) libere(s)")
                    .apply()

                Result.success()
            }
        } catch (e: Exception) {
            android.util.Log.w("VeilleTaches", "battement impossible : ${e.message}")
            // Reseau coupe, serveur injoignable : WorkManager reessaiera avec son
            // backoff. On ne marque jamais un echec comme un succes.
            Result.retry()
        }
    }
}

/**
 * Planification de la veille.
 *
 * On ne planifie qu'une seule tache periodique, nommee : la re-planifier ne cree
 * pas de doublon. Le contenu du planificateur est volontairement mince — lire
 * les horodatages et decider s'il faut (re)creer la veille.
 */
object VeilleTaches {

    /** Vrai si la veille n'a jamais ete configuree. Sert a l'installer une fois. */
    fun jamaisConfiguree(context: Context): Boolean =
        !prefs(context).getBoolean(VeilleTachesWorker.CLE_CONFIGURE, false)

    private fun prefs(context: Context) =
        context.getSharedPreferences(VeilleTachesWorker.TAG_PREFS, Context.MODE_PRIVATE)

    fun estActive(context: Context): Boolean =
        prefs(context).getBoolean(VeilleTachesWorker.CLE_ACTIVE, false)

    fun dernierBattement(context: Context): Long =
        prefs(context).getLong(VeilleTachesWorker.CLE_DERNIER, 0L)

    fun dernierBilan(context: Context): String =
        prefs(context).getString(VeilleTachesWorker.CLE_BILAN, "").orEmpty()

    /** Cree (ou remplace) la veille periodique, et la marque active. */
    fun planifier(context: Context) {
        val contraintes = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val requete = PeriodicWorkRequestBuilder<VeilleTachesWorker>(
            VeilleTachesWorker.INTERVALLE_MINUTES, TimeUnit.MINUTES
        )
            .setConstraints(contraintes)
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            VeilleTachesWorker.NOM,
            ExistingPeriodicWorkPolicy.UPDATE,
            requete
        )
        prefs(context).edit()
            .putBoolean(VeilleTachesWorker.CLE_CONFIGURE, true)
            .putBoolean(VeilleTachesWorker.CLE_ACTIVE, true)
            .apply()
    }

    /** Arrete la veille : l'utilisateur a demande qu'on ne lise plus le registre. */
    fun arreter(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(VeilleTachesWorker.NOM)
        prefs(context).edit()
            .putBoolean(VeilleTachesWorker.CLE_CONFIGURE, true)
            .putBoolean(VeilleTachesWorker.CLE_ACTIVE, false)
            .apply()
    }
}
