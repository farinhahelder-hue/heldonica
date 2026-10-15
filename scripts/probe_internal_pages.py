#!/usr/bin/env python3
"""Sonde les pages internes des concurrents : legendes republiees ou embeds Instagram.

Pourquoi ce script existe
-------------------------
`scripts/collect_instagram_legends.py` ne lit que la **page d'accueil** de chaque
site. Une legende republiee sur une page interne (destination, article) lui
echappe. Ce script leve cette reserve : pour chaque acteur dont un sitemap public
est disponible, il extrait les URL puis sonde **jusqu'a 40 pages internes**.

Ce qu'il ne fait pas
--------------------
Il ne recopie aucun texte : la sortie ne contient que des **comptages**
(legendes lisibles, embeds Instagram). C'est la regle anti-plagiat du document
`docs/positionnement-editorial-concurrents.md`.

Usage
-----
    python3 scripts/probe_internal_pages.py

Sortie : un tableau horodate, pret a etre reporte dans la §3.6 du document.
"""

import datetime
import re
import sys
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Heldonica-Audit"
MIN_CAPTION = 200  # en deca, ce n'est pas une legende mais un libelle d'image
MAX_PAGES = 40     # plafond par acteur (certains sitemaps en publient des milliers)

# (acteur, sitemap) — sitemap public quand il existe. Fabrique ton Voyage et
# Voyages etc n'ont pas de sitemap exploitable (404 / 403) : ils sont signales.
SITEMAPS = [
    ("Novo-Monde", "https://www.novo-monde.com/sitemap_index.xml"),
    ("Chilowe", "https://www.chilowe.com/sitemap_index.xml"),
    ("Les Coflocs", "https://www.lescoflocs.com/sitemap_index.xml"),
    ("Trace Directe", "https://www.tracedirecte.com/sitemap.xml"),
    ("Perspectives de Voyage", "https://www.perspectives-de-voyage.fr/sitemap.xml"),
    ("Imprudence des Voyages", "https://imprudencedesvoyages.com/sitemap.xml"),
    ("Le Monde Cousu Main", "https://www.lemondecousumain.fr/sitemap.xml"),
    ("Destinaslow", "https://www.destinaslow.fr/post-sitemap.xml"),
    ("Fabrique ton Voyage (blog)", "https://blog.fabriquetonvoyage.fr/sitemap.xml"),
    ("Echappees Lointaines", "https://www.echappeeslointaines.fr/sitemap.xml"),
    ("Voyages etc", "https://www.voyagesetc.fr/sitemap.xml"),
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", errors="replace")


def locs(page: str) -> list:
    """<loc>url</loc> et <loc><![CDATA[url]]></loc> (deux formats rencontres)."""
    out = re.findall(r"<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*</loc>", page)
    return [u.strip() for u in out if u.strip()]


def page_urls(sitemap_url: str) -> list:
    """URL de pages : suit un index de sitemaps, ignore les .xml eux-memes."""
    page = fetch(sitemap_url)
    found = locs(page)
    if "<sitemapindex" in page:
        urls = []
        for sub in found[:8]:
            if sub.endswith(".xml"):
                try:
                    urls.extend(locs(fetch(sub)))
                except Exception:
                    continue
        found = urls
    return [u for u in found if not u.endswith(".xml")]


def main() -> int:
    print(f"Sonde des pages internes - releve du "
          f"{datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M UTC}")
    print(f"Legende retenue si aria-label >= {MIN_CAPTION} caracteres ; plafond {MAX_PAGES} pages/acteur\n")
    print(f"{'Acteur':<28} {'URLs':>6} {'testees':>8} {'legendes':>9} {'embeds':>7}  statut")
    print("-" * 82)
    for actor, index in SITEMAPS:
        try:
            urls = page_urls(index)
        except Exception as e:  # 403, 404, DNS...
            print(f"{actor:<28} {'-':>6} {'-':>8} {'-':>9} {'-':>7}  {type(e).__name__}")
            continue
        sample = urls[:MAX_PAGES]
        legends = embeds = ok = 0
        for u in sample:
            try:
                html = fetch(u)
                ok += 1
            except Exception:
                continue
            legends += len(re.findall(r'aria-label="([^"]{%d,})"' % MIN_CAPTION, html))
            embeds += len(re.findall(r"instagram\.com/(?:p|reel|tv)/", html))
        status = "LEGENDES EXPOSEES" if legends else (
            "embed seul" if embeds else "aucune legende")
        print(f"{actor:<28} {len(urls):>6} {ok:>8} {legends:>9} {embeds:>7}  {status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
