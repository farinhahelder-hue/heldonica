#!/usr/bin/env python3
"""Mesure les legendes Instagram que les concurrents republient sur leur propre site.

Pourquoi ce script existe
-------------------------
Instagram bloque l'acces automatise. La seule source publique et citable pour
comparer la voix sociale est donc un site qui *republie* ses propres legendes.
Ce script lit ce HTML public et en tire des **comptages** (longueurs, hashtags,
pronoms, mots bannis) — jamais le texte.

Ce qu'il ne fait pas
--------------------
Il ne recopie aucune legende dans sa sortie : les comptages seuls sortent, plus
les noms propres de lieux (identification), jamais les phrases. C'est la regle
anti-plagiat du document.

Usage
-----
    python3 scripts/collect_instagram_legends.py

Sortie : un tableau de mesures horodate, pret a etre reporte dans
`docs/positionnement-editorial-concurrents.md`.
"""

import datetime
import html
import re
import sys
import urllib.request

# Mots bannis par lib/brand-voice.ts (extrait : ceux qui ressortent en social).
FORBIDDEN = [
    "bons plans", "bon plan", "incontournable", "must-see", "must-have",
    "tips", "astuces", "astuce", "voyage organisé", "circuit", "package",
    "inoubliable", "paradis", "paradisiaque", "magnifique", "splendide",
    "incroyable", "spot", "optimiser", "organisation de séjour",
]

PRONOUNS = ["je", "tu", "vous", "nous", "on", "moi", "toi"]

SOURCES = [
    # (acteur, url) — sites officiels du panel. Le script cherche, dans le HTML
    # public, un texte de legende (attribut aria-label long) ou un embed
    # instagram.com/p|reel|tv. Un site qui ne republie rien rend 0 : c'est le
    # resultat negatif qui justifie le [INDISPONIBLE] du document.
    ("Échappées Lointaines", "https://www.echappeeslointaines.fr/"),
    ("Novo-Monde", "https://www.novo-monde.com/"),
    ("Chilowé", "https://www.chilowe.com/"),
    ("Les Coflocs", "https://www.lescoflocs.com/"),
    ("Trace Directe", "https://www.tracedirecte.com/"),
    ("Voyages etc", "https://www.voyagesetc.fr/"),
    ("Perspectives de Voyage", "https://www.perspectives-de-voyage.fr/"),
    ("Imprudence des Voyages", "https://imprudencedesvoyages.com/"),
    ("Le Monde Cousu Main", "https://www.lemondecousumain.fr/"),
    ("Fabrique ton Voyage", "https://www.fabriquetonvoyage.fr/"),
    ("Destinaslow", "https://www.destinaslow.fr/"),
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Heldonica-Audit"
MIN_CAPTION = 200  # en deca, ce n'est pas une legende mais un libelle d'image


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")


def extract_captions(page: str) -> list:
    """Legendes republiees sur le site : attributs aria-label longs, dedupliques.

    Certains sites exposent le meme texte deux fois (variante desktop/mobile) :
    on deduplique sur le texte pour ne pas compter double.
    """
    raw = re.findall(r'aria-label="([^"]{%d,})"' % MIN_CAPTION, page)
    seen, captions = set(), []
    for c in raw:
        c = html.unescape(re.sub(r"\s+", " ", c)).strip()
        if c not in seen:
            seen.add(c)
            captions.append(c)
    return captions


def count_embeds(page: str) -> int:
    """Blocs Instagram officiels (<blockquote class=instagram-media>) : 0 ici."""
    return len(re.findall(r"instagram\.com/(?:p|reel|tv)/", page))


def count_vignettes(page: str) -> int:
    """Vignettes de la galerie : un conteneur id="item-action-…" par vignette."""
    return len(re.findall(r'id="item-action-', page))


def count_words(text: str, words) -> dict:
    out = {}
    for w in words:
        # Frontiere de mot : « on » ne doit pas compter dans « maison ».
        pat = r"(?<![\w-])" + re.escape(w) + r"(?![\w-])"
        out[w] = len(re.findall(pat, text, re.I))
    return out


def hashtags(text: str) -> list:
    return re.findall(r"#[\wÀ-ÿ]+", text)


def analyze(captions: list) -> dict:
    lengths = sorted(len(c) for c in captions)
    tags = [len(hashtags(c)) for c in captions]
    joined = "\n".join(captions)
    return {
        "n": len(captions),
        "len_min": lengths[0] if lengths else 0,
        "len_med": lengths[len(lengths) // 2] if lengths else 0,
        "len_max": lengths[-1] if lengths else 0,
        "tags_min": min(tags) if tags else 0,
        "tags_med": sorted(tags)[len(tags) // 2] if tags else 0,
        "tags_max": max(tags) if tags else 0,
        "pronouns": count_words(joined, PRONOUNS),
        "forbidden": {k: v for k, v in count_words(joined, FORBIDDEN).items() if v},
    }


def main() -> int:
    print(f"Releve du {datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M UTC}")
    print(f"Legende retenue si aria-label >= {MIN_CAPTION} caracteres\n")
    print(f"{'Acteur':<22} {'HTTP':<6} {'vignettes':>9} {'legendes':>8} {'embeds':>7}  statut")
    print("-" * 78)
    for actor, url in SOURCES:
        try:
            page = fetch(url)
        except Exception as e:  # reseau bloque, 403, DNS...
            print(f"{actor:<22} {'ERR':<6} {'-':>9} {'-':>8} {'-':>7}  {type(e).__name__}")
            continue
        captions = extract_captions(page)
        embeds = count_embeds(page)
        vignettes = count_vignettes(page)
        status = "LEGENDES EXPOSEES" if captions else (
            "embeds seuls" if embeds else "aucune legende exposee")
        print(f"{actor:<22} {'200':<6} {vignettes:>9} {len(captions):>8} {embeds:>7}  {status}")
        if captions:
            stats = analyze(captions)
            print(f"    longueur (car.)   : min {stats['len_min']} / med {stats['len_med']} / max {stats['len_max']}")
            print(f"    hashtags par post : min {stats['tags_min']} / med {stats['tags_med']} / max {stats['tags_max']}")
            print(f"    pronoms           : {stats['pronouns']}")
            print(f"    mots bannis       : {stats['forbidden'] or 'aucun'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
