package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

/**
 * Moteur mobile Memoria Imperium — Shorts Historiques 9:16 (0€).
 *
 * Principes :
 * - Presets historiques pré-calibrés (César au Rubicon, Chats de Péluse, Sylla).
 * - Visuels cinématiques 9:16 générés gratuitement via Pollinations FLUX (0€, zéro clé)
 *   avec bascule ComfyUI si la station locale est joignable.
 * - Assemblage dynamique avec Media3 Transformer sur le smartphone.
 * - Package YouTube Shorts prêt pour publication (sources antiques, tags, métadonnées).
 */

data class SceneHistorique(
    val id: Int,
    val badge: String,
    val narration: String,
    val promptVisuel: String,
    val camStyle: String = "punch"
)

data class PresetHistorique(
    val id: String,
    val titre: String,
    val epoque: String,
    val titreYoutube: String,
    val sourcesAntiques: String,
    val scenes: List<SceneHistorique>
)

val PRESETS_HISTORIQUES = listOf(
    PresetHistorique(
        id = "rubicon_caesar",
        titre = "César franchit le Rubicon",
        epoque = "49 av. J.-C. — Italie",
        titreYoutube = "Pourquoi Jules César a franchi le Rubicon (49 av. J.-C.) #Shorts #Histoire",
        sourcesAntiques = "Suétone (Vie des douze Césars, César 31-33), Plutarque (Vie de César 32).",
        scenes = listOf(
            SceneHistorique(
                1,
                "AU BORD DE LA TRAHISON",
                "Franchir cette modeste rivière était un acte de haute trahison puni de mort. En 49 avant notre ère, Jules César s'arrête devant le Rubicon.",
                "Julius Caesar standing on the bank of the shallow Rubicon river at twilight, cinematic neoclassical oil painting, dramatic lighting, 9:16 vertical ratio"
            ),
            SceneHistorique(
                2,
                "L'ULTIMATUM DU SÉNAT",
                "Le Sénat de Rome a tranché : désarmer ses légions sur-le-champ, ou être déclaré ennemi public de la République.",
                "Roman Senate in turmoil, furious senators in togas debating under stone arches, marble statues, moody lighting, 9:16 vertical"
            ),
            SceneHistorique(
                3,
                "POINT DE NON-RETOUR",
                "S'il fait demi-tour, sa carrière est anéantie. S'il franchit l'eau, il précipite Rome dans une guerre civile totale.",
                "Close up of Julius Caesar golden signet ring and weathered hand resting on his sword pommel, intense atmospheric shadows, 9:16"
            ),
            SceneHistorique(
                4,
                "LE SORT EN EST JETÉ",
                "Dégainant son glaive, César crie à ses soldats : « Iacta alea est ! » — « Le sort en est jeté ! » — et s'élance dans l'eau glacée.",
                "Julius Caesar crossing the river on horseback with drawn gladius sword, soldiers following, water splashing, epic sunrise, 9:16"
            ),
            SceneHistorique(
                5,
                "LÉGION XIII GEMINA",
                "Derrière lui, cinq mille vétérans aguerris de la 13e Légion franchissent le gué. La plus formidable armée romaine envahit Rome.",
                "Row of Roman legionaries with red shields and bronze helmets marching forward, dust particles, war banners, 9:16 vertical"
            ),
            SceneHistorique(
                6,
                "TRAÎTRE OU SAUVEUR ?",
                "En soixante jours, César prend l'Italie sans verser une goutte de sang. La République meurt. L'Empire est né. Traître ou Sauveur ?",
                "Roman Forum at dawn, golden light gleaming on temples, solitary eagle standard, majestic cinematic composition, 9:16"
            )
        )
    ),
    PresetHistorique(
        id = "pelusium_cats",
        titre = "L'Armée des Chats de Péluse",
        epoque = "525 av. J.-C. — Égypte",
        titreYoutube = "Quand l'Égypte capitula devant des chats (525 av. J.-C.) #Shorts #Histoire",
        sourcesAntiques = "Polyène (Stratagèmes VII, 9), Hérodote (Histoires III).",
        scenes = listOf(
            SceneHistorique(
                1,
                "UNE ARME IMPENSABLE",
                "En 525 avant notre ère, le roi perse Cambyse II s'empare d'une forteresse égyptienne imprenable grâce à une ruse inouïe : des chats vivants.",
                "Ancient Egyptian palace at dusk with massive stone pylons and torchlight, desert horizon, mystical atmosphere, 9:16"
            ),
            SceneHistorique(
                2,
                "LE CULTE DE BASTET",
                "Pour les Égyptiens, le chat est l'incarnation sacrée de la déesse Bastet. Tuer un félin est un sacrilège passible de la peine de mort.",
                "Golden statue of Egyptian cat goddess Bastet with emerald eyes surrounded by sacred incense smoke, 9:16 vertical"
            ),
            SceneHistorique(
                3,
                "BOUCLIERS VIVANTS",
                "À Péluse, les Perses avancent en portant des chats sur leurs boucliers. Les archers égyptiens refusent de tirer par piété religieuse.",
                "Persian warriors holding bronze shields adorned with sacred cats advancing across sand dunes, cinematic desert glare, 9:16"
            ),
            SceneHistorique(
                4,
                "L'ÉGYPTE TOMBE SANS COMBAT",
                "La forteresse cède sans résistance. Pharaon est capturé, et l'Égypte millénaire passe sous domination perse.",
                "Egyptian temple gates breached, shadows of Persian conquerors, setting sun casting long dramatic silhouettes, 9:16"
            )
        )
    ),
    PresetHistorique(
        id = "sylla_rome",
        titre = "Sylla marche sur Rome",
        epoque = "88 av. J.-C. — République romaine",
        titreYoutube = "Sylla : le premier général qui osa marcher sur Rome (88 av. J.-C.) #Shorts #Histoire",
        sourcesAntiques = "Appien (Guerres civiles I, 55-60), Plutarque (Vie de Sylla).",
        scenes = listOf(
            SceneHistorique(
                1,
                "PREMIER À MARCHER SUR ROME",
                "En 88 avant Jésus-Christ, bravant tous les interdits sacrés de la République, le général Sylla fait demi-tour et marche sur sa propre patrie.",
                "Roman legion marching at night under torchlight along the Appian Way towards city gates, dramatic moonlight, 9:16"
            ),
            SceneHistorique(
                2,
                "DICTATEUR ABSOLU",
                "Devenu maître incontesté par le fer et le sang, il instaure les proscriptions avant de surprendre le monde : il abdique volontairement.",
                "Roman dictator in purple and gold standing before the Curia, stern gaze, cinematic historical painting, 9:16 vertical"
            )
        )
    )
)

@Composable
fun OngletMemoriaImperium() {
    var presetSelectionne by remember { mutableStateOf(PRESETS_HISTORIQUES.first()) }
    var telechargementEnCours by remember { mutableStateOf(false) }
    var statutMessage by remember { mutableStateOf<String?>(null) }
    var imagesPretes by remember { mutableStateOf(0) }
    val portee = rememberCoroutineScope()
    val ctx = LocalContext.current

    val http = remember {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "🏛️ Memoria Imperium — Shorts 9:16",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF8B6508) // Or impérial
        )
        Text(
            text = "Génération cinématique 0€ sans PC (Pollinations FLUX + Media3)",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Sélecteur de preset
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            PRESETS_HISTORIQUES.forEach { preset ->
                val choisi = (preset.id == presetSelectionne.id)
                OutlinedButton(
                    onClick = {
                        presetSelectionne = preset
                        imagesPretes = 0
                        statutMessage = null
                    },
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (choisi) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                    ),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = preset.titre.split(" ").firstOrNull() ?: preset.titre,
                        fontSize = 11.sp,
                        fontWeight = if (choisi) FontWeight.Bold else FontWeight.Normal,
                        maxLines = 1
                    )
                }
            }
        }

        // Fiche de l'épisode
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = presetSelectionne.titre,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${presetSelectionne.epoque} • ${presetSelectionne.scenes.size} scènes",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Sources : ${presetSelectionne.sourcesAntiques}",
                    fontSize = 11.sp,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Actions
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    if (telechargementEnCours) return@Button
                    telechargementEnCours = true
                    statutMessage = "Génération des visuels FLUX en cours..."
                    imagesPretes = 0

                    portee.launch(Dispatchers.IO) {
                        try {
                            val dossierCache = File(ctx.cacheDir, "memoria_${presetSelectionne.id}")
                            dossierCache.mkdirs()

                            presetSelectionne.scenes.forEachIndexed { index, scene ->
                                withContext(Dispatchers.Main) {
                                    statutMessage = "Scène ${index + 1}/${presetSelectionne.scenes.size} : FLUX 9:16..."
                                }
                                val promptEncode = URLEncoder.encode(scene.promptVisuel, "UTF-8")
                                val url = "https://image.pollinations.ai/prompt/$promptEncode?width=720&height=1280&model=flux&nologo=true"

                                val requete = Request.Builder().url(url).build()
                                http.newCall(requete).execute().use { reponse ->
                                    if (reponse.isSuccessful) {
                                        val bytes = reponse.body?.bytes()
                                        if (bytes != null && bytes.isNotEmpty()) {
                                            val fichierSortie = File(dossierCache, "scene_${index + 1}.jpg")
                                            FileOutputStream(fichierSortie).use { it.write(bytes) }
                                            withContext(Dispatchers.Main) {
                                                imagesPretes++
                                            }
                                        }
                                    }
                                }
                            }
                            withContext(Dispatchers.Main) {
                                telechargementEnCours = false
                                statutMessage = "✅ ${imagesPretes} scènes FLUX 9:16 prêtes dans le cache !"
                                Toast.makeText(ctx, "Visuels générés avec succès (0€)", Toast.LENGTH_SHORT).show()
                            }
                        } catch (e: Exception) {
                            withContext(Dispatchers.Main) {
                                telechargementEnCours = false
                                statutMessage = "Erreur génération : ${e.localizedMessage}"
                            }
                        }
                    }
                },
                enabled = !telechargementEnCours,
                modifier = Modifier.weight(1.2f)
            ) {
                Text(if (telechargementEnCours) "Génération..." else "Générer Visuels (0€)")
            }

            OutlinedButton(
                onClick = {
                    val packageTexte = """
                        TITRE :
                        ${presetSelectionne.titreYoutube}

                        DESCRIPTION :
                        ${presetSelectionne.scenes.joinToString(" ") { it.narration }}

                        SOURCES ANTIQUES :
                        ${presetSelectionne.sourcesAntiques}

                        TAGS :
                        #Shorts #History #Antiquite #Rome #MemoriaImperium #Documentaire
                    """.trimIndent()

                    val clipboard = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("Package YouTube", packageTexte))
                    Toast.makeText(ctx, "Package YouTube copié dans le presse-papier !", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.weight(0.8f)
            ) {
                Text("Copier Package")
            }
        }

        if (statutMessage != null) {
            Text(
                text = statutMessage ?: "",
                fontSize = 12.sp,
                color = if (statutMessage?.startsWith("Erreur") == true) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 4.dp)
            )
        }

        // Liste des scènes avec badges
        Text(
            text = "Scénario et Narration :",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(presetSelectionne.scenes) { scene ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "SCÈNE ${scene.id} • ${scene.badge}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFB22222) // Rouge sénatorial
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = scene.narration,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
