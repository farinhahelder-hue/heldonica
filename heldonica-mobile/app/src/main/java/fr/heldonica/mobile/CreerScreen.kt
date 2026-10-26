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

                // 3. Section "Génération Google Flow (Prompts rapides)"
                SectionTitre("Assistants Flow (Google Labs)")
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
                        Text("🎬 Flow Vidéo", fontSize = 12.sp)
                    }
                    OutlinedButton(
                        onClick = { demandeFlux = DemandeFlux(AssistantFlux.MUSIQUE, marque) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("🎵 Flow Music", fontSize = 12.sp)
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
    onFermer: () -> Unit
) {
    val contexte = LocalContext.current
    var texte by remember(demande) { mutableStateOf(promptFlux(demande)) }
    val outil = if (demande.type == AssistantFlux.VIDEO) "Google Flow" else "Flow Music"
    val url = if (demande.type == AssistantFlux.VIDEO) URL_FLOW else URL_FLOW_MUSIC

    AlertDialog(
        onDismissRequest = onFermer,
        title = { Text(outil) },
        text = {
            Column {
                Text(
                    "Le prompt est copié dans le presse-papier. Colle-le dans $outil, génère, télécharge, puis importe le fichier dans l'app.",
                    fontSize = 12.sp
                )
                OutlinedTextField(
                    value = texte,
                    onValueChange = { texte = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    minLines = 4,
                    maxLines = 8,
                    label = { Text("Prompt") }
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                copier(contexte, texte, outil)
                ouvrirLien(contexte, url)
                onFermer()
            }) {
                Text("Copier et ouvrir")
            }
        },
        dismissButton = {
            TextButton(onClick = onFermer) { Text("Annuler") }
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
private const val URL_FLOW_MUSIC = "https://flowmusic.google"
