package fr.heldonica.mobile

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Editeur du site, dans l'application.
 *
 * Le panel d'administration existe deja et couvre tout — articles, zones
 * editables, carrousels, medias, theme. Le reecrire en natif reviendrait a
 * maintenir deux implementations du meme CMS, et a porter chaque evolution
 * deux fois. On l'affiche donc tel quel, et l'application se charge de ce que
 * seul le natif fait bien : l'appareil photo, le GPS, l'EXIF, la file d'attente
 * hors ligne.
 *
 * La seule piece a ecrire est le pont d'authentification : l'application detient
 * le mot de passe, elle obtient le cookie de session et le pose dans la vue web,
 * pour eviter une saisie a chaque ouverture.
 */
class EditeurActivity : ComponentActivity() {

    companion object {
        const val TAG = "Heldonica"
        const val EXTRA_CHEMIN = "chemin"
        private const val COOKIE_SESSION = "heldonica_cms_session"
    }

    private lateinit var web: WebView
    private lateinit var barre: ProgressBar
    private lateinit var message: TextView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val racine = FrameLayout(this)
        web = WebView(this)
        barre = ProgressBar(this).apply { isIndeterminate = true }
        message = TextView(this).apply {
            setPadding(48, 48, 48, 48)
            visibility = android.view.View.GONE
        }

        racine.addView(web, ViewGroup.LayoutParams(-1, -1))
        racine.addView(barre, FrameLayout.LayoutParams(-2, -2, android.view.Gravity.CENTER))
        racine.addView(message, FrameLayout.LayoutParams(-1, -2, android.view.Gravity.CENTER))
        setContentView(racine)

        web.settings.apply {
            javaScriptEnabled = true
            // Le panel s'appuie sur le stockage local pour son etat d'edition ;
            // sans lui, l'editeur repart de zero a chaque navigation.
            domStorageEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
        }

        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                barre.visibility = android.view.View.GONE
            }

            // Sans ce cas, une coupure reseau laissait une page blanche muette :
            // impossible de savoir s'il fallait attendre, recharger, ou si
            // l'editeur etait casse.
            override fun onReceivedError(
                view: WebView?,
                requete: android.webkit.WebResourceRequest?,
                erreur: android.webkit.WebResourceError?
            ) {
                if (requete?.isForMainFrame != true) return
                Log.e(TAG, "Chargement editeur echoue: " + erreur?.description)
                afficherMessage(
                    "Impossible de charger l'editeur.\n\n" +
                    "Verifie ta connexion, puis rouvre depuis l'accueil."
                )
            }
        }

        // Le bouton retour navigue dans l'historique de l'editeur avant de
        // quitter l'ecran : sans cela, une fausse manoeuvre ferme tout.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        ouvrir(intent.getStringExtra(EXTRA_CHEMIN) ?: "/panel-manager")
    }

    private fun ouvrir(chemin: String) {
        val base = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val motDePasse = BuildConfig.CMS_PASSWORD

        if (motDePasse.isBlank()) {
            afficherMessage(
                "Mot de passe CMS absent de cette compilation.\n\n" +
                "Renseigne cms.password dans local.properties, ou le secret " +
                "CMS_PASSWORD si l'APK vient de la CI."
            )
            return
        }

        lifecycleScope.launch {
            val cookie = withContext(Dispatchers.IO) { obtenirSession(base, motDePasse) }

            if (cookie == null) {
                afficherMessage(
                    "Connexion au CMS refusee.\n\n" +
                    "Le mot de passe compile dans l'application ne correspond pas " +
                    "a celui du serveur."
                )
                return@launch
            }

            CookieManager.getInstance().apply {
                setAcceptCookie(true)
                setAcceptThirdPartyCookies(web, true)
                // setCookie est asynchrone : on attend sa confirmation avant de
                // charger la page. Sans cela, /panel-manager s'en sortait - sa
                // coquille se charge sans cookie et ses appels partent une fois
                // le cookie pose - mais /admin verifie la session des la premiere
                // requete, arrivait sans cookie, et renvoyait vers l'accueil du
                // panneau. La carte « Apparence du site » n'atteignait donc
                // jamais l'editeur de theme.
                setCookie(base, "$COOKIE_SESSION=$cookie; path=/") {
                    flush()
                    web.loadUrl(base + chemin)
                }
            }
        }
    }

    /** Echange le mot de passe contre un cookie de session signe. */
    private fun obtenirSession(base: String, motDePasse: String): String? {
        return try {
            val client = OkHttpClient.Builder().callTimeout(30, TimeUnit.SECONDS).build()
            val req = Request.Builder()
                .url("$base/api/cms/auth")
                .post(
                    JSONObject().put("password", motDePasse).toString()
                        .toRequestBody("application/json".toMediaType())
                )
                .build()

            client.newCall(req).execute().use { r ->
                if (!r.isSuccessful) {
                    Log.e(TAG, "Session CMS refusee ${r.code}")
                    return null
                }
                // Le cookie voyage dans Set-Cookie ; on n'en garde que la valeur,
                // les attributs etant reposes par CookieManager.
                r.headers("Set-Cookie")
                    .firstOrNull { it.startsWith("$COOKIE_SESSION=") }
                    ?.substringAfter("=")
                    ?.substringBefore(";")
                    ?.takeIf { it.isNotBlank() }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Echec de la session CMS", e)
            null
        }
    }

    private fun afficherMessage(texte: String) {
        barre.visibility = android.view.View.GONE
        web.visibility = android.view.View.GONE
        message.text = texte
        message.visibility = android.view.View.VISIBLE
    }
}
