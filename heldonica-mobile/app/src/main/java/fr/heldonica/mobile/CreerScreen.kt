package fr.heldonica.mobile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class MarqueCreation(val titre: String, val sousTitre: String) {
    HELDONICA("Heldonica", "Instagram, site, carrousels"),
    MEMORIA("Memoria Imperium", "YouTube Shorts, histoire")
}

private enum class AssistantFlux { VIDEO, MUSIQUE }

private data class DemandeFlux(
    val type: AssistantFlux,
    val marque: MarqueCreation
)

/**
 * Espace de création unifié.
 *
 * Heldonica : photo + légende, carrousel, Google Photos, articles et CMS.
 * Memoria Imperium : le studio de shorts historiques existant est embarqué tel quel.
 *
 * Flow et Flow Music n'ont pas d'API publique : on prépare le prompt, on copie,
 * on ouvre l'outil Google, puis on importe le fichier produit. Aucun jeton.
 */
@Composable
fun CreerScreen(
    onPhoto: (carrousel: Boolean) -> Unit,
    onMontage: () -> Unit,
    onCarnet: () -> Unit,
    onPhotosGoogle: () -> Unit,
    onCarrouselSite: () -> Unit,
    onCms: () -> Unit,
    onCerveau: () -> Unit
) {
    val contexte = LocalContext.current
    val modeleLocal = CerveauLocal.estInstalle(contexte)
    var marque by remember { mutableStateOf(MarqueCreation.HELDONICA) }
    var demandeFlux by remember { mutableStateOf<DemandeFlux?>(null) }
    var cmsConfigure by remember {
        mutableStateOf(BrainClient.obtenirMotDePasse(contexte).isNotBlank())
    }
    var demandeMotDePasse by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize()) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Text("Créer", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Une seule app, deux univers. Choisis la marque, puis l'action.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 2.dp, bottom = 10.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MarqueCreation.values().forEach { candidate ->
                    if (candidate == marque) {
                        Button(onClick = { marque = candidate }) {
                            Text(candidate.titre, fontSize = 12.sp)
                        }
                    } else {
                        OutlinedButton(onClick = { marque = candidate }) {
                            Text(candidate.titre, fontSize = 12.sp)
                        }
                    }
                }
            }
            Text(
                marque.sousTitre,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 6.dp, bottom = 8.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { demandeFlux = DemandeFlux(AssistantFlux.VIDEO, marque) },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Flow vidéo", fontSize = 12.sp)
                }
                OutlinedButton(
                    onClick = { demandeFlux = DemandeFlux(AssistantFlux.MUSIQUE, marque) },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Flow Music", fontSize = 12.sp)
                }
            }
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
                if (!cmsConfigure) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp, bottom = 8.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer
                        )
                    ) {
                        Column(Modifier.padding(14.dp)) {
                            Text(
                                "Site et Instagram : accès à configurer",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp
                            )
                            Text(
                                "Le mot de passe CMS est nécessaire pour créer les brouillons " +
                                    "sur heldonica.fr. Il reste sur ce téléphone.",
                                fontSize = 12.sp,
                                modifier = Modifier.padding(top = 3.dp)
                            )
                            TextButton(onClick = { demandeMotDePasse = true }) {
                                Text("Configurer maintenant")
                            }
                        }
                    }
                }

                if (!modeleLocal) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.tertiaryContainer
                        )
                    ) {
                        Column(Modifier.padding(14.dp)) {
                            Text(
                                "IA locale : modèle non installé",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp
                            )
                            Text(
                                "Télécharge le modèle Qwen (1,6 Go, une seule fois) pour " +
                                    "générer les légendes sans connexion. Sinon, le site prend le relais.",
                                fontSize = 12.sp,
                                modifier = Modifier.padding(top = 3.dp)
                            )
                            TextButton(onClick = onCerveau) {
                                Text("Ouvrir Cerveau")
                            }
                        }
                    }
                }

                SectionTitre("Publier")
                CarteCreer(
                    titre = "Photo + légende",
                    detail = "Photos locales, EXIF, lieu, légende IA et brouillon site/Instagram.",
                    principale = true
                ) { onPhoto(false) }
                CarteCreer(
                    titre = "Carrousel Instagram",
                    detail = "Plusieurs photos, légende IA et brouillon carrousel dans la même flow."
                ) { onPhoto(true) }
                CarteCreer(
                    titre = "Carrousel avancé (site)",
                    detail = "Ouvrir l'éditeur de diapositives du site pour composer et illustrer."
                ) { onCarrouselSite() }

                SectionTitre("Importer")
                CarteCreer(
                    titre = "Photos Google",
                    detail = "Importer depuis Google Photos vers la médiathèque du site."
                ) { onPhotosGoogle() }
                CarteCreer(
                    titre = "CMS & brouillons",
                    detail = "Retrouver les articles, brouillons et médias sur le site."
                ) { onCms() }

                SectionTitre("Écrire et monter")
                CarteCreer(
                    titre = "Article / carnet",
                    detail = "Écrire un carnet avec l'IA locale ou cloud, puis l'enregistrer."
                ) { onCarnet() }
                CarteCreer(
                    titre = "Monter une vidéo",
                    detail = "Assembler des plans, ajouter musique et sous-titres sur le téléphone."
                ) { onMontage() }

                Spacer(Modifier.height(20.dp))
                Text(
                    "Flow et Flow Music : le prompt est copié, l'outil Google s'ouvre, " +
                        "puis tu importes le fichier téléchargé dans Photos ou Montage. " +
                        "Aucune API, aucun jeton.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 20.dp)
                )
            }
        }
    }

    demandeFlux?.let { demande ->
        AssistantFluxDialog(
            demande = demande,
            onFermer = { demandeFlux = null }
        )
    }

    if (demandeMotDePasse) {
        MotDePasseCmsDialog(
            onFermer = { demandeMotDePasse = false },
            onEnregistre = {
                cmsConfigure = true
                demandeMotDePasse = false
            }
        )
    }
}

@Composable
private fun MotDePasseCmsDialog(
    onFermer: () -> Unit,
    onEnregistre: () -> Unit
) {
    val contexte = LocalContext.current
    var mdp by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onFermer,
        title = { Text("Accès au site") },
        text = {
            Column {
                Text(
                    "Mot de passe CMS défini dans Vercel (CMS_PASSWORD). " +
                        "Il est stocké dans le stockage privé de l'app.",
                    fontSize = 12.sp
                )
                OutlinedTextField(
                    value = mdp,
                    onValueChange = { mdp = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    singleLine = true,
                    label = { Text("Mot de passe CMS") },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = androidx.compose.ui.text.input.KeyboardType.Password
                    )
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = mdp.isNotBlank(),
                onClick = {
                    BrainClient.sauvegarderMotDePasse(contexte, mdp)
                    onEnregistre()
                }
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onFermer) { Text("Annuler") }
        }
    )
}

@Composable
private fun SectionTitre(texte: String) {
    Text(
        texte,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 14.dp, bottom = 6.dp)
    )
}

@Composable
private fun CarteCreer(
    titre: String,
    detail: String,
    principale: Boolean = false,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (principale) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            }
        )
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(titre, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
            Text(
                detail,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 3.dp)
            )
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
                    "Le prompt est copié dans le presse-papier. Colle-le dans $outil, " +
                        "génère, télécharge, puis importe le fichier dans l'app.",
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
            "Vidéo verticale 9:16, 8 secondes, slow travel à [LIEU], lumière naturelle douce, " +
                "caméra lente, palette crème et olive, aucun texte à l'écran."
        } else {
            "Vidéo verticale 9:16, 8 secondes, [SUJET HISTORIQUE], peinture à l'huile " +
                "cinématographique, lumière dramatique, texture fine, aucun texte à l'écran."
        }
        AssistantFlux.MUSIQUE -> if (heldonica) {
            "Musique instrumentale de 30 secondes, guitare acoustique, nappe ambient, " +
                "85 BPM, sans voix, pour un reel slow travel."
        } else {
            "Musique orchestrale épique de 30 secondes, cuivres, percussions, chœur " +
                "lointain, ton sombre et majestueux, sans voix, pour un short historique."
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
