package fr.heldonica.mobile

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

/**
 * Coque Studio Heldonica (slice 1) : un seul point d'entrée, quatre onglets.
 *
 * - Cerveau : console Brain en vue web (connexion manuelle, aucun secret stocké).
 * - CMS : ouvre EditeurActivity (session cookie déjà gérée là-bas).
 * - Studio / Insta : écrans d'attente câblés aux slices 2 et 3.
 */
class StudioActivity : ComponentActivity() {

    companion object {
        const val TAG = "HeldonicaStudio"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { EcranStudio() }
    }

    @Composable
    private fun EcranStudio() {
        var onglet by remember { mutableStateOf(OngletStudio.parDefaut()) }
        val contexte = LocalContext.current
        Column(Modifier.fillMaxSize()) {
            TabRow(selectedTabIndex = onglet.ordinal) {
                OngletStudio.values().forEach { o ->
                    Tab(
                        selected = (o == onglet),
                        onClick = { onglet = o },
                        text = { Text("${o.emoji} ${o.titre}") }
                    )
                }
            }
            when (onglet) {
                OngletStudio.CERVEAU -> CerveauScreen()
                OngletStudio.CMS -> {
                    // L'éditeur gère déjà mot de passe + cookie : on le réutilise tel quel.
                    contexte.startActivity(
                        Intent(contexte, EditeurActivity::class.java).putExtra(
                            EditeurActivity.EXTRA_CHEMIN, "/panel-manager"
                        )
                    )
                    onglet = OngletStudio.parDefaut()
                }
                OngletStudio.STUDIO -> OngletMemoriaImperium()
                OngletStudio.INSTA -> {
                    // Lancement direct de l'activité Terrain (photos réelles, EXIF, OSM, légendes slow travel, publication)
                    contexte.startActivity(Intent(contexte, MainActivity::class.java))
                    onglet = OngletStudio.parDefaut()
                }
            }
        }
    }
}
