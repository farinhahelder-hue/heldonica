package fr.heldonica.mobile

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class PresetVideo(
    val id: String,
    val titre: String,
    val categorie: String,
    val description: String,
    val dureeS: Int,
    val mouvement: String,
    val promptFlow: String
)

data class SceneStoryboard(
    val numero: Int,
    val dureeS: Int,
    val visuel: String,
    val texteEcran: String,
    val mouvement: String
)

data class StoryboardVideo(
    val titre: String,
    val dureeTotaleS: Int,
    val musiqueRecommandee: String,
    val scenes: List<SceneStoryboard>,
    val accroche: String
)

object CatalogueVideo {
    private const val TAG = "CatalogueVideo"

    val PRESETS = listOf(
        PresetVideo(
            id = "sentier_matin",
            titre = "Sentier Brumeux",
            categorie = "🌿 Slow Travel • Forêt",
            description = "Travelling lent en avant sous les fougères et la brume matinale.",
            dureeS = 8,
            mouvement = "Slow Dolly Push",
            promptFlow = "Cinematic vertical 9:16 slow forward dolly push along an ancient damp cobblestone trail through lush mossy ferns and pine trees. Early morning golden light shafts pierce through rolling mist. Photorealistic 35mm film texture, gentle wind shaking droplets, peaceful slow travel contemplation, natural lighting, no text, no watermark."
        ),
        PresetVideo(
            id = "boutique_hotel_lin",
            titre = "Boutique Hôtel & Lin",
            categorie = "☕ Slow Travel • Architecture",
            description = "Rideau de lin blanc flottant, parquet de chêne et lumière douce.",
            dureeS = 8,
            mouvement = "Slow Floating Pan",
            promptFlow = "Cinematic vertical 9:16 interior shot of an authentic boutique hotel room with solid walnut wooden floors and a raw linen curtain gently undulating in a soft breeze. Warm sunlight illuminates limestone walls and an antique ceramic espresso cup on a small table. Meditative calm, architectural stillness, 35mm depth of field, no people, no text."
        ),
        PresetVideo(
            id = "falaises_ocean",
            titre = "Falaises & Océan",
            categorie = "🌊 Slow Travel • Côte",
            description = "Vue aérienne basse longeant des falaises volcaniques et l'écume turquoise.",
            dureeS = 8,
            mouvement = "Low Drone Glide",
            promptFlow = "Cinematic vertical 9:16 aerial shot gliding slowly along dramatic black volcanic sea cliffs battered by deep turquoise ocean waves. White foam swirls around basalt sea stacks. Crisp Atlantic breeze, cool oceanic atmosphere, photorealistic documentary realism, volumetric sea spray, no text."
        ),
        PresetVideo(
            id = "train_panoramique",
            titre = "Train Panoramique",
            categorie = "🚂 Slow Travel • Train",
            description = "Travelling latéral à travers la baie vitrée d'un train suisse.",
            dureeS = 8,
            mouvement = "Window Tracking",
            promptFlow = "Cinematic vertical 9:16 lateral tracking shot through a vintage panoramic train window moving slowly across green alpine meadows and distant glacier peaks. Soft glass reflections, gentle train motion blur, calm golden hour illumination, nostalgic slow travel journey, no text."
        ),
        PresetVideo(
            id = "cesar_rubicon",
            titre = "César au Rubicon",
            categorie = "🏛️ Memoria • Antiquité",
            description = "Jules César à cheval dans la brume glaciale nocturne du Rubicon.",
            dureeS = 8,
            mouvement = "Dramatic Push",
            promptFlow = "Cinematic vertical 9:16 slow forward dolly push towards Julius Caesar on his white horse standing on the muddy riverbank of the Rubicon at night. Winter mist rolls over shallow dark water. Violent flickering torches cast golden reflections on bronze armor. Intense tension, 35mm cinematic grain, photorealistic historical drama, no text."
        ),
        PresetVideo(
            id = "senat_romain",
            titre = "Sénat Romain",
            categorie = "⚔️ Memoria • Histoire",
            description = "Colère dans la Curie romaine sous les colonnades de marbre.",
            dureeS = 8,
            mouvement = "Slow Crane Descend",
            promptFlow = "Cinematic vertical 9:16 slow crane shot descending inside the Roman Curia. Senators in immaculate white and purple togas gesticulating furiously under tall shafts of morning light through marble colonnades. Dramatic shadows, photorealistic Roman historical realism, 8k resolution, no text."
        )
    )

    /**
     * Génère un storyboard complet de 4-5 scènes avec Gemini sans jamais ouvrir Google Flow.
     */
    suspend fun genererStoryboardGemini(
        context: Context,
        sujet: String,
        lieu: String = "",
        style: String = "slow_travel"
    ): StoryboardVideo? = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.CMS_BASE_URL.trimEnd('/')
        val password = BrainClient.obtenirMotDePasse(context)
        val client = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(35, TimeUnit.SECONDS)
            .build()

        val jsonPayload = JSONObject().apply {
            put("sujet", sujet)
            put("lieu", lieu)
            put("style", style)
        }

        val request = Request.Builder()
            .url("$baseUrl/api/cms/ai-video-storyboard")
            .header("x-cms-auth", password)
            .post(jsonPayload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        try {
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                Log.w(TAG, "Échec appel storyboard API: ${response.code}")
                return@withContext genererStoryboardSecours(sujet, lieu)
            }

            val bodyStr = response.body?.string().orEmpty()
            val root = JSONObject(bodyStr)
            val sb = root.optJSONObject("storyboard") ?: return@withContext genererStoryboardSecours(sujet, lieu)

            val scenesList = mutableListOf<SceneStoryboard>()
            val scenesArray = sb.optJSONArray("scenes")
            if (scenesArray != null) {
                for (i in 0 until scenesArray.length()) {
                    val sObj = scenesArray.getJSONObject(i)
                    scenesList.add(
                        SceneStoryboard(
                            numero = sObj.optInt("numero", i + 1),
                            dureeS = sObj.optInt("duree_s", 3),
                            visuel = sObj.optString("visuel", ""),
                            texteEcran = sObj.optString("texte_ecran", ""),
                            mouvement = sObj.optString("mouvement_camera", "slow_pan")
                        )
                    )
                }
            }

            StoryboardVideo(
                titre = sb.optString("titre", sujet),
                dureeTotaleS = sb.optInt("duree_totale_s", 15),
                musiqueRecommandee = sb.optString("musique_recommandee", "atrium_lin_brut"),
                scenes = scenesList,
                accroche = sb.optString("accroche_partage", "")
            )
        } catch (e: Exception) {
            Log.w(TAG, "Exception storyboard Gemini: ${e.message}")
            genererStoryboardSecours(sujet, lieu)
        }
    }

    private fun genererStoryboardSecours(sujet: String, lieu: String): StoryboardVideo {
        val nomLieu = if (lieu.isNotBlank()) lieu else "ce havre"
        return StoryboardVideo(
            titre = if (sujet.isNotBlank()) sujet else "Instants à $nomLieu",
            dureeTotaleS = 14,
            musiqueRecommandee = "atrium_lin_brut",
            scenes = listOf(
                SceneStoryboard(1, 4, "Plan large : horizon brumeux et premières lueurs sur $nomLieu.", "Le jour se lève sans bruit.", "slow_zoom_in"),
                SceneStoryboard(2, 3, "Plan rapproché : textures de bois mouillé et gouttes suspendues.", "Le temps s'étire dans les détails.", "slow_pan_right"),
                SceneStoryboard(3, 4, "Plan moyen : vapeur douce d'un café chaud posé sur la table.", "Ralentir avant que le monde n'accélère.", "slow_zoom_out"),
                SceneStoryboard(4, 3, "Plan d'atmosphère : silhouette immobile contemplant le paysage.", "[À TOI : ce que tu as ressenti là]", "static_contemplation")
            ),
            accroche = "Un instant suspendu à $nomLieu."
        )
    }
}
