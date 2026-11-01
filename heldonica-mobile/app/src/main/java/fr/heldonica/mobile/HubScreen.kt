package fr.heldonica.mobile

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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

/**
 * Entrée de service pour le Hub Créateur Heldonica.
 */
data class HubServiceItem(
    val titre: String,
    val description: String,
    val icone: String,
    val url: String,
    val categorie: String,
    val estInterneCms: Boolean = false,
    val cheminCms: String? = null
)

/**
 * Hub Créateur Mobile Heldonica :
 * Accès en un tap aux consoles Google, Meta, YouTube, Jules et aux moteurs SEO/Géo
 * sans reconnexion en réutilisant la session active du navigateur système ou du CMS.
 */
@Composable
fun HubScreen(
    onNaviguerCms: ((String) -> Unit)? = null
) {
    val context = LocalContext.current

    val services = remember {
        listOf(
            HubServiceItem(
                titre = "Google Search Console",
                description = "Indexation, requêtes clés, impressions & santé sc-domain:heldonica.fr",
                icone = "\uD83D\uDD0D",
                url = "https://search.google.com/search-console?resource_id=sc-domain%3Aheldonica.fr",
                categorie = "Google & Analytics"
            ),
            HubServiceItem(
                titre = "Google Analytics 4",
                description = "Trafic temps réel, engagement et conversions (G-JDJNTZLBJS)",
                icone = "\uD83D\uDCCA",
                url = "https://analytics.google.com/analytics/web/#/p477545934/reports/intelligenthome",
                categorie = "Google & Analytics"
            ),
            HubServiceItem(
                titre = "Meta Business Suite",
                description = "Planification, messages unifiés, insights Instagram & Facebook",
                icone = "\uD83D\uDCE2",
                url = "https://business.facebook.com/latest/home?asset_id=1073841119139682",
                categorie = "Réseaux & Diffusion"
            ),
            HubServiceItem(
                titre = "Instagram @heldonica",
                description = "Profil slow travel officiel, stories, reels et carrousels",
                icone = "\uD83D\uDCF8",
                url = "https://www.instagram.com/heldonica/",
                categorie = "Réseaux & Diffusion"
            ),
            HubServiceItem(
                titre = "YouTube Studio (Creator)",
                description = "Gestion des vidéos, shorts, sous-titres et rétention",
                icone = "\uD83C\uDFAC",
                url = "https://studio.youtube.com/channel/UCheldonica",
                categorie = "Réseaux & Diffusion"
            ),
            HubServiceItem(
                titre = "Chaîne YouTube",
                description = "Visionnage public et bibliothèque de créations",
                icone = "\u25B6\uFE0F",
                url = "https://www.youtube.com/@heldonica",
                categorie = "Réseaux & Diffusion"
            ),
            HubServiceItem(
                titre = "Google Jules (Agent IA)",
                description = "Console de l'agent asynchrone Google Cloud / GitHub",
                icone = "\uD83E\uDD16",
                url = "https://jules.google.com/",
                categorie = "Intelligence & Agents"
            ),
            HubServiceItem(
                titre = "Donneur de tâches Jules & APIs",
                description = "Délégation directe de requêtes de fond vers Jules, Groq et Brain",
                icone = "\u26A1",
                url = "/panel-manager?section=task-giver",
                categorie = "Intelligence & Agents",
                estInterneCms = true,
                cheminCms = "/panel-manager?section=task-giver"
            ),
            HubServiceItem(
                titre = "Moteur SEO & Géo OpenStreetMap",
                description = "Validation coordonnées GPS, altitudes, GeoJSON & balises schema.org",
                icone = "\uD83C\uDF0D",
                url = "/panel-manager?section=seo-geo",
                categorie = "SEO & Infrastructure",
                estInterneCms = true,
                cheminCms = "/panel-manager?section=seo-geo"
            ),
            HubServiceItem(
                titre = "Identité de Marque & Logos",
                description = "Générateur vectoriel SVG, palette carnet et pack d'icônes",
                icone = "\uD83C\uDFA8",
                url = "/panel-manager?section=branding",
                categorie = "SEO & Infrastructure",
                estInterneCms = true,
                cheminCms = "/panel-manager?section=branding"
            ),
            HubServiceItem(
                titre = "Console Supabase",
                description = "Base PostgreSQL de production, RLS, Storage et Logs",
                icone = "\uD83D\uDDC4\uFE0F",
                url = "https://supabase.com/dashboard/project/qgffqglzobzscvevhwlc",
                categorie = "SEO & Infrastructure"
            ),
            HubServiceItem(
                titre = "Vercel Deployments",
                description = "Statut des builds Next.js en production et variables",
                icone = "\u25B2",
                url = "https://vercel.com/heldonica",
                categorie = "SEO & Infrastructure"
            )
        )
    }

    val categories = remember(services) {
        services.map { it.categorie }.distinct()
    }

    fun ouvrirService(service: HubServiceItem) {
        if (service.estInterneCms && service.cheminCms != null) {
            if (onNaviguerCms != null) {
                onNaviguerCms(service.cheminCms)
            } else {
                context.startActivity(
                    Intent(context, EditeurActivity::class.java).apply {
                        putExtra(EditeurActivity.EXTRA_CHEMIN, service.cheminCms)
                    }
                )
            }
        } else {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(service.url)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(context, "Impossible d'ouvrir le lien : ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7F2))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF3ECE1)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "🚀 Hub Créateur Heldonica",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2C221E)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Accès direct sans reconnexion à Google Search Console, GA4, Meta, YouTube, Jules et aux outils SEO du CMS.",
                        fontSize = 13.sp,
                        color = Color(0xFF6B584E),
                        lineHeight = 18.sp
                    )
                }
            }
        }

        categories.forEach { cat ->
            item {
                Text(
                    text = cat.uppercase(),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF8C7B72),
                    modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                )
            }

            val itemsDeCat = services.filter { it.categorie == cat }
            items(itemsDeCat) { service ->
                Card(
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { ouvrirService(service) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = service.icone,
                            fontSize = 24.sp,
                            modifier = Modifier.padding(end = 14.dp)
                        )
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = service.titre,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF2C221E)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = service.description,
                                fontSize = 12.sp,
                                color = Color(0xFF7A6B62),
                                lineHeight = 16.sp
                            )
                        }
                        Text(
                            text = if (service.estInterneCms) "CMS →" else "↗",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E3A8A),
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
