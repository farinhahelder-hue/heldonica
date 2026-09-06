package fr.heldonica.mobile

import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * Transcription d'un montage, par la route du site.
 *
 * La cle Groq reste sur le serveur : l'application ne la voit jamais. Elle
 * depose le fichier sur le stockage par URL signee - le meme chemin que les
 * photos, et pour la meme raison, la requete entrante d'une fonction Vercel
 * plafonnant a 4,5 Mo - puis n'envoie que son adresse.
 *
 * Seule la bande son part : un montage de cinq secondes pese 46 Mo, son audio
 * moins d'un. Ce n'est pas qu'une economie - le stockage plafonne, et Groq
 * refuse au-dela de 25 Mo.
 */

sealed interface ResultatTranscription {
    data class Reussi(val segments: List<Segment>) : ResultatTranscription
    data class Echoue(val motif: String) : ResultatTranscription
}

private const val TAG_TRANSCRIPTION = "Heldonica"

/** Depose le fichier et rend son adresse publique. */
private fun deposer(
    client: OkHttpClient,
    baseUrl: String,
    motDePasse: String,
    fichier: File,
): String? {
    val demande = Request.Builder()
        .url("$baseUrl/api/cms/mobile-publish/upload-url")
        .header("x-cms-auth", motDePasse)
        .post(
            JSONObject()
                .put("fichiers", org.json.JSONArray().put(fichier.name))
                .put("dossier", "montages")
                .toString()
                .toRequestBody("application/json".toMediaType())
        )
        .build()

    val cible = client.newCall(demande).execute().use { r ->
        if (!r.isSuccessful) {
            Log.e(TAG_TRANSCRIPTION, "URL signee refusee ${r.code} : ${r.body?.string()}")
            return null
        }
        JSONObject(r.body?.string().orEmpty()).getJSONArray("cibles").getJSONObject(0)
    }

    val envoi = Request.Builder()
        .url(cible.getString("signedUrl"))
        .put(fichier.asRequestBody("audio/mp4".toMediaType()))
        .build()

    client.newCall(envoi).execute().use { r ->
        if (!r.isSuccessful) {
            // Le corps porte le motif : sans lui, un 400 ne dit pas s'il s'agit
            // d'un fichier trop lourd, d'un chemin deja pris, ou d'autre chose.
            Log.e(TAG_TRANSCRIPTION, "Depot du montage refuse ${r.code} : ${r.body?.string()}")
            return null
        }
    }

    return cible.getString("url")
}

fun transcrire(baseUrl: String, motDePasse: String, montage: File): ResultatTranscription {
    if (motDePasse.isBlank()) {
        return ResultatTranscription.Echoue(
            "Mot de passe CMS absent de cette compilation : la transcription passe par le site."
        )
    }

    // Whisper travaille en quelques secondes, mais le depot d'un montage peut
    // etre long sur un reseau lent : le delai couvre les deux.
    val client = OkHttpClient.Builder()
        .callTimeout(3, TimeUnit.MINUTES)
        .writeTimeout(3, TimeUnit.MINUTES)
        .build()

    val base = baseUrl.trimEnd('/')

    val adresse = try {
        deposer(client, base, motDePasse, montage)
    } catch (e: Exception) {
        Log.e(TAG_TRANSCRIPTION, "Depot impossible", e)
        null
    } ?: return ResultatTranscription.Echoue("Le montage n'a pas pu être déposé.")

    return try {
        val demande = Request.Builder()
            .url("$base/api/cms/transcrire")
            .header("x-cms-auth", motDePasse)
            .post(
                JSONObject().put("url", adresse).put("langue", "fr").toString()
                    .toRequestBody("application/json".toMediaType())
            )
            .build()

        client.newCall(demande).execute().use { r ->
            val corps = r.body?.string().orEmpty()

            if (!r.isSuccessful) {
                // Le motif vient du serveur, qui distingue deja les cas :
                // fichier trop lourd, aucune parole, service injoignable.
                val motif = runCatching { JSONObject(corps).optString("error") }.getOrNull()
                Log.e(TAG_TRANSCRIPTION, "Transcription refusee ${r.code} : $corps")
                return ResultatTranscription.Echoue(
                    motif?.takeIf { it.isNotBlank() } ?: "La transcription a échoué."
                )
            }

            val bruts = JSONObject(corps).optJSONArray("segments")
            val segments = buildList {
                for (i in 0 until (bruts?.length() ?: 0)) {
                    val s = bruts!!.getJSONObject(i)
                    val texte = s.optString("texte").trim()
                    if (texte.isNotEmpty()) {
                        add(Segment(s.optDouble("debut", 0.0), s.optDouble("fin", 0.0), texte))
                    }
                }
            }

            if (segments.isEmpty()) {
                ResultatTranscription.Echoue("Aucune parole détectée dans ce montage.")
            } else {
                ResultatTranscription.Reussi(segments)
            }
        }
    } catch (e: Exception) {
        Log.e(TAG_TRANSCRIPTION, "Transcription injoignable", e)
        ResultatTranscription.Echoue("Service de transcription injoignable.")
    }
}
