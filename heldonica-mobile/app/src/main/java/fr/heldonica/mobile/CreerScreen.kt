package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

enum class MarqueCreation(val titre: String, val sousTitre: String) {
    HELDONICA("Heldonica", "Slow travel, carnets & Instagram"),
    MEMORIA("Memoria Imperium", "YouTube Shorts & Histoire")
}

private enum class AssistantFlux { VIDEO, MUSIQUE }

private data class DemandeFlux(
    val type: AssistantFlux,
    val marque: MarqueCreation
)

/**
 * Espace de création unifié et direct pour Google Pixel 8 Pro.
 *
 * Utilise l'authentification native du Pixel (Photo Picker Android)
 * pour accéder directement à Google Photos sans login ni mot de passe.
 */
@Composable
fun CreerScreen(
    onPhoto: (carrousel: Boolean, ouvrirDirect: Boolean) -> Unit,
    onMontage: () -> Unit,
    onMontageAvecPiste: (String) -> Unit = {},
    onCarnet: () -> Unit,
    onCarrouselSite: () -> Unit,
    onCms: () -> Unit,
    onCerveau: () -> Unit
) {
    val contexte = LocalContext.current
    var marque by remember { mutableStateOf(MarqueCreation.HELDONICA) }
    var demandeFlux by remember { mutableStateOf<DemandeFlux?>(null) }

    Column(Modifier.fillMaxSize()) {
        // En-tête avec bascule de marque
        Column(Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Créer", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    MarqueCreation.values().forEach { candidate ->
                        if (candidate == marque) {
                            Button(
                                onClick = { marque = candidate },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(candidate.titre, fontSize = 12.sp)
                            }
                        } else {
                            OutlinedButton(
                                onClick = { marque = candidate },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(candidate.titre, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
            Text(
                marque.sousTitre,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 2.dp, bottom = 4.dp)
            )
        }

        if (marque == MarqueCreation.MEMORIA) {
            Box(Modifier.weight(1f)) {
                OngletMemoriaImperium()
            }
        } else {
            Column(
                Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp)
            ) {
                // 1. CARTE HERO GOOGLE PHOTOS (Action N°1)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(Modifier.padding(18.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("📸", fontSize = 32.sp)
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text(
                                    "Google Photos • Création IA",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Text(
                                    "Authentifié directement par ton Pixel 8 Pro",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                                )
                            }
                        }
                        Spacer(Modifier.height(10.dp))
                        Text(
                            "Choisis tes photos dans ta photothèque Google Photos. L'IA Heldonica (GTX 1660 Ti ou cloud) analyse l'image, le lieu et rédige ta légende sans ressaisie.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(Modifier.height(16.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { onPhoto(false, true) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("🖼️ Photo unique", fontSize = 13.sp)
                            }
                            FilledTonalButton(
                                onClick = { onPhoto(true, true) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("📑 Carrousel (1-10)", fontSize = 13.sp)
                            }
                        }
                    }
                }

                // 2. Section "Autres formats de voyage"
                SectionTitre("Autres formats")
                CarteAction(
                    icone = "✍️",
                    titre = "Écrire un carnet de route",
                    detail = "Rédiger un article ou récit slow travel assisté par l'IA."
                ) { onCarnet() }

                CarteAction(
                    icone = "🎬",
                    titre = "Monter une vidéo verticale",
                    detail = "Assembler des plans 9:16 avec musique et sous-titres."
                ) { onMontage() }

                CarteAction(
                    icone = "🖼️",
                    titre = "Éditeur de carrousel (site web)",
                    detail = "Composer des diapositives avancées pour heldonica.fr."
                ) { onCarrouselSite() }

                // 3. Section "Assistants Studio (Gemini & Flow)"
                SectionTitre("Assistants Studio (Gemini & Flow)")
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { demandeFlux = DemandeFlux(AssistantFlux.VIDEO, marque) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("🎬 Vidéo (Gemini & Flow)", fontSize = 12.sp)
                    }
                    OutlinedButton(
                        onClick = { demandeFlux = DemandeFlux(AssistantFlux.MUSIQUE, marque) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("🎵 Musique (Heldonica & FX)", fontSize = 12.sp)
                    }
                }

                // 4. Liens directs plateforme
                SectionTitre("Plateforme")
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onCms,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("🌐 CMS Heldonica", fontSize = 12.sp)
                    }
                    OutlinedButton(
                        onClick = onCerveau,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("🧠 Cerveau (8440)", fontSize = 12.sp)
                    }
                }
            }
        }
    }

    demandeFlux?.let { demande ->
        AssistantFluxDialog(
            demande = demande,
            onMontageAvecPiste = { pisteId ->
                demandeFlux = null
                onMontageAvecPiste(pisteId)
            },
            onFermer = { demandeFlux = null }
        )
    }
}

@Composable
private fun SectionTitre(texte: String) {
    Text(
        texte,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 10.dp, bottom = 6.dp)
    )
}

@Composable
private fun CarteAction(
    icone: String,
    titre: String,
    detail: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(icone, fontSize = 24.sp, modifier = Modifier.padding(end = 12.dp))
            Column(Modifier.weight(1f)) {
                Text(titre, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                Text(
                    detail,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun AssistantFluxDialog(
    demande: DemandeFlux,
    onMontageAvecPiste: (String) -> Unit,
    onFermer: () -> Unit
) {
    val contexte = LocalContext.current
    val portee = rememberCoroutineScope()
    var ongletMusique by remember { mutableStateOf(0) }
    var ongletVideo by remember { mutableStateOf(0) }
    var idPisteEnLecture by remember { mutableStateOf(CatalogueMusique.idPisteEnLecture) }
    var texte by remember(demande) { mutableStateOf(promptFlux(demande)) }
    var sujetVideo by remember { mutableStateOf("") }
    var lieuVideo by remember { mutableStateOf("") }
    var enChargementStoryboard by remember { mutableStateOf(false) }
    var storyboardGenere by remember { mutableStateOf<StoryboardVideo?>(null) }

    AlertDialog(
        onDismissRequest = {
            CatalogueMusique.arreterPreview()
            onFermer()
        },
        title = {
            Text(
                if (demande.type == AssistantFlux.MUSIQUE) "🎵 Studio Musique Heldonica" else "🎬 Studio Vidéo (Gemini & Flow)",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                if (demande.type == AssistantFlux.MUSIQUE) {
                    TabRow(
                        selectedTabIndex = ongletMusique,
                        modifier = Modifier.padding(bottom = 12.dp)
                    ) {
                        Tab(
                            selected = (ongletMusique == 0),
                            onClick = { ongletMusique = 0 },
                            text = { Text("Pistes prêtes (1 clic)", fontSize = 12.sp) }
                        )
                        Tab(
                            selected = (ongletMusique == 1),
                            onClick = { ongletMusique = 1 },
                            text = { Text("Google MusicFX", fontSize = 12.sp) }
                        )
                    }

                    if (ongletMusique == 0) {
                        Text(
                            "Musiques originales slow travel prêtes à l'emploi. Aucun copier-coller requis : écoute et applique directement à ton montage.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 10.dp)
                        )
                        CatalogueMusique.PISTES.forEach { piste ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 8.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (idPisteEnLecture == piste.id) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                                )
                            ) {
                                Column(Modifier.padding(10.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(piste.titre, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                        Text("${piste.bpm} BPM • ${piste.duree}", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                                    }
                                    Text(piste.ambiance, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(top = 2.dp))
                                    Text(piste.description, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 2.dp))

                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(top = 6.dp),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = {
                                                CatalogueMusique.basculerPreview(contexte, piste) {
                                                    idPisteEnLecture = CatalogueMusique.idPisteEnLecture
                                                }
                                            },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text(if (idPisteEnLecture == piste.id) "⏹️ Stop" else "🎧 Écouter", fontSize = 11.sp)
                                        }
                                        Button(
                                            onClick = {
                                                CatalogueMusique.arreterPreview()
                                                onMontageAvecPiste(piste.id)
                                                onFermer()
                                            },
                                            modifier = Modifier.weight(1.3f)
                                        ) {
                                            Text("🎬 Utiliser", fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        Text(
                            "Choisis un preset pour calibrer le prompt sans le taper à la main, puis ouvre Google MusicFX.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("Styles pré-calibrés :", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            CatalogueMusique.PISTES.forEach { p ->
                                SuggestionChip(
                                    onClick = {
                                        texte = p.promptGoogleFlow
                                        copier(contexte, texte, "Google MusicFX")
                                    },
                                    label = { Text("${p.titre} (${p.bpm} BPM)", fontSize = 11.sp) }
                                )
                            }
                        }

                        OutlinedTextField(
                            value = texte,
                            onValueChange = { texte = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 6.dp),
                            minLines = 3,
                            maxLines = 6,
                            label = { Text("Prompt pour Google MusicFX", fontSize = 12.sp) }
                        )

                        Button(
                            onClick = {
                                copier(contexte, texte, "Google MusicFX")
                                ouvrirLien(contexte, URL_FLOW_MUSIC)
                                onFermer()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 10.dp)
                        ) {
                            Text("🚀 Copier et ouvrir Google MusicFX")
                        }
                    }
                } else {
                    // Flow Vidéo (Veo & Gemini)
                    TabRow(
                        selectedTabIndex = ongletVideo,
                        modifier = Modifier.padding(bottom = 12.dp)
                    ) {
                        Tab(
                            selected = (ongletVideo == 0),
                            onClick = { ongletVideo = 0 },
                            text = { Text("Storyboard Gemini", fontSize = 12.sp) }
                        )
                        Tab(
                            selected = (ongletVideo == 1),
                            onClick = { ongletVideo = 1 },
                            text = { Text("Google Flow (Veo)", fontSize = 12.sp) }
                        )
                    }

                    if (ongletVideo == 0) {
                        Text(
                            "Génère un découpage vertical 9:16 complet en 4 plans (mouvements caméra, voix off, musique) directement avec Gemini, sans passer par Google Flow.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )

                        OutlinedTextField(
                            value = sujetVideo,
                            onValueChange = { sujetVideo = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 6.dp),
                            label = { Text("Sujet ou ambiance (ex: Matin brumeux)", fontSize = 12.sp) },
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = lieuVideo,
                            onValueChange = { lieuVideo = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            label = { Text("Lieu (optionnel, ex: Honfleur)", fontSize = 12.sp) },
                            singleLine = true
                        )

                        Button(
                            onClick = {
                                enChargementStoryboard = true
                                portee.launch {
                                    val sb = CatalogueVideo.genererStoryboardGemini(
                                        context = contexte,
                                        sujet = sujetVideo,
                                        lieu = lieuVideo,
                                        style = if (demande.marque == MarqueCreation.HELDONICA) "slow_travel" else "memoria_histoire"
                                    )
                                    storyboardGenere = sb
                                    enChargementStoryboard = false
                                }
                            },
                            enabled = !enChargementStoryboard,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp)
                        ) {
                            if (enChargementStoryboard) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    strokeWidth = 2.dp
                                )
                                Spacer(Modifier.width(8.dp))
                                Text("🧠 Découpage par Gemini…", fontSize = 12.sp)
                            } else {
                                Text("🧠 Découper le storyboard (Gemini)", fontSize = 12.sp)
                            }
                        }

                        storyboardGenere?.let { sb ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 8.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Column(Modifier.padding(10.dp)) {
                                    Text(sb.titre, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    if (sb.accroche.isNotBlank()) {
                                        Text(
                                            "\"${sb.accroche}\"",
                                            fontSize = 12.sp,
                                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                            modifier = Modifier.padding(top = 2.dp)
                                        )
                                    }
                                    Text(
                                        "⏱️ ${sb.dureeTotaleS}s • 🎵 Musique : ${sb.musiqueRecommandee}",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.outline,
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                }
                            }

                            sb.scenes.forEach { sc ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 6.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                                    )
                                ) {
                                    Column(Modifier.padding(8.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text("Plan ${sc.numero} (${sc.dureeS}s)", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                                            Text(sc.mouvement, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                                        }
                                        Text("🎥 ${sc.visuel}", fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                                        Text("🗣️ ${sc.texteEcran}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 2.dp))
                                    }
                                }
                            }

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        val recap = buildString {
                                            appendLine("🎬 Storyboard : ${sb.titre}")
                                            appendLine("Accroche : ${sb.accroche}")
                                            sb.scenes.forEach { s ->
                                                appendLine("Plan ${s.numero} (${s.dureeS}s) [${s.mouvement}] : ${s.visuel}")
                                                appendLine("Narration : ${s.texteEcran}")
                                            }
                                        }
                                        copier(contexte, recap, "Storyboard")
                                    },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("📋 Copier", fontSize = 11.sp)
                                }

                                Button(
                                    onClick = {
                                        onMontageAvecPiste(sb.musiqueRecommandee)
                                        onFermer()
                                    },
                                    modifier = Modifier.weight(1.3f)
                                ) {
                                    Text("🎬 Monter (Media3)", fontSize = 11.sp)
                                }
                            }
                        }
                    } else {
                        Text(
                            "Presets cinématographiques pré-calibrés pour Google Flow (Veo). Un toucher copie le prompt sans saisie clavier.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("Styles pré-calibrés :", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            CatalogueVideo.PRESETS.forEach { p ->
                                SuggestionChip(
                                    onClick = {
                                        texte = p.promptFlow
                                        copier(contexte, texte, "Google Flow")
                                    },
                                    label = { Text("${p.titre} • ${p.mouvement}", fontSize = 11.sp) }
                                )
                            }
                        }

                        OutlinedTextField(
                            value = texte,
                            onValueChange = { texte = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 6.dp),
                            minLines = 4,
                            maxLines = 8,
                            label = { Text("Prompt pour Google Flow (Veo)", fontSize = 12.sp) }
                        )

                        Button(
                            onClick = {
                                copier(contexte, texte, "Google Flow")
                                ouvrirLien(contexte, URL_FLOW)
                                onFermer()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 10.dp)
                        ) {
                            Text("🎬 Copier et ouvrir Google Flow")
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = {
                CatalogueMusique.arreterPreview()
                onFermer()
            }) { Text("Fermer") }
        }
    )
}

private fun promptFlux(demande: DemandeFlux): String {
    val heldonica = demande.marque == MarqueCreation.HELDONICA
    return when (demande.type) {
        AssistantFlux.VIDEO -> if (heldonica) {
            "Vidéo verticale 9:16, 8 secondes, slow travel à [LIEU], lumière naturelle douce, caméra lente, palette crème et olive, aucun texte à l'écran."
        } else {
            "Vidéo verticale 9:16, 8 secondes, [SUJET HISTORIQUE], peinture à l'huile cinématographique, lumière dramatique, texture fine, aucun texte à l'écran."
        }
        AssistantFlux.MUSIQUE -> if (heldonica) {
            "Musique instrumentale de 30 secondes, guitare acoustique, nappe ambient, 85 BPM, sans voix, pour un reel slow travel."
        } else {
            "Musique orchestrale épique de 30 secondes, cuivres, percussions, chœur lointain, ton sombre et majestueux, sans voix, pour un short historique."
        }
    }
}

private fun copier(contexte: Context, texte: String, etiquette: String) {
    val clipboard = contexte.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText(etiquette, texte))
    Toast.makeText(contexte, "Prompt copié. Colle-le dans $etiquette.", Toast.LENGTH_SHORT).show()
}

private fun ouvrirLien(contexte: Context, url: String) {
    runCatching {
        contexte.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    }.onFailure {
        Toast.makeText(contexte, "Aucun navigateur n'a pu ouvrir $url", Toast.LENGTH_LONG).show()
    }
}

private const val URL_FLOW = "https://labs.google/fx/tools/flow"
private const val URL_FLOW_MUSIC = "https://aitestkitchen.withgoogle.com/tools/music-fx"
