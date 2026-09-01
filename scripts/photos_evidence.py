"""
photos_evidence — construit le registre de preuves a partir des photos du voyage.

Principe : une photo porte des faits verifiables (coordonnees GPS, horodatage de
prise de vue). Ce sont les SEULES affirmations de vecu qu'on s'autorise a ecrire
sur le site. Le registre produit ici sert de source a check-content-evidence.mjs,
qui refuse toute date ou tout lieu revendique sans photo pour l'attester.

Sans ce garde-fou, check-content-coherence.mjs valide n'importe quel texte
contenant "en 202..." : le critere E-E-A-T mesure la ressemblance avec du vecu,
pas le vecu lui-meme.

Usage :
  python scripts/photos_evidence.py                        # table de lieux locale
  python scripts/photos_evidence.py --geocode              # + reverse geocoding OSM
  python scripts/photos_evidence.py --dir <chemin> --out <fichier.json>
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    print("[ERREUR] Pillow manquant : python -m pip install Pillow")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SRC = BASE_DIR.parent / "public" / "images" / "destinations" / "roumanie"
DEFAULT_OUT = BASE_DIR.parent / "content" / "evidence" / "roumanie.json"

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff"}
VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv", ".m4v"}

MOIS_FR = ["janvier", "fevrier", "mars", "avril", "mai", "juin",
           "juillet", "aout", "septembre", "octobre", "novembre", "decembre"]

# Reperes approximatifs (degres decimaux) pour nommer une grappe de photos sans
# appel reseau. Volontairement indicatif : le rayon de rattachement est large et
# la distance est reportee, pour qu'un nom errone reste visible a la relecture.
# La verite dure reste le couple (GPS, horodatage) ; --geocode donne mieux.
LIEUX_REPERES = [
    ("Garda de Sus", 46.4500, 22.8000),
    ("Gheatarul de la Scarisoara", 46.4894, 22.8103),
    ("Cheile Ordancusei", 46.4600, 22.8200),
    ("Pestera Poarta lui Ionele", 46.4667, 22.8167),
    ("Platoul Padis", 46.6000, 22.7200),
    ("Pestera Ghetarul de la Vartop", 46.4900, 22.7200),
    ("Cucurbata Mare", 46.4586, 22.6839),
    ("Cascada Pisoaia", 46.3800, 22.9300),
    ("Abrud", 46.2758, 23.0642),
    ("Tebea", 46.1500, 22.8500),
    ("Timisoara", 45.7489, 21.2087),
    ("Cluj-Napoca", 46.7712, 23.6236),
    ("Sighisoara", 46.2197, 24.7925),
    ("Alba Iulia", 46.0733, 23.5805),
    ("Castelul Banffy, Bontida", 46.9147, 23.8019),
]
RAYON_KM = 12.0


def _to_degrees(value):
    def f(x):
        try:
            return float(x)
        except TypeError:
            return float(x[0]) / float(x[1])
    d, m, s = value
    return f(d) + f(m) / 60.0 + f(s) / 3600.0


def lire_exif(path: Path):
    """Retourne (lat, lon, prise_de_vue) — chaque champ None si absent."""
    try:
        img = Image.open(path)
        raw = img._getexif()
    except Exception:
        return None, None, None
    if not raw:
        return None, None, None

    exif = {TAGS.get(k, k): v for k, v in raw.items()}

    prise = None
    for champ in ("DateTimeOriginal", "DateTimeDigitized", "DateTime"):
        val = exif.get(champ)
        if val:
            try:
                prise = datetime.strptime(str(val), "%Y:%m:%d %H:%M:%S")
                break
            except ValueError:
                continue

    lat = lon = None
    gps_raw = exif.get("GPSInfo")
    if gps_raw:
        gps = {GPSTAGS.get(k, k): v for k, v in gps_raw.items()}
        try:
            if gps.get("GPSLatitude") and gps.get("GPSLongitude"):
                lat = _to_degrees(gps["GPSLatitude"])
                if str(gps.get("GPSLatitudeRef", "N")).upper().startswith("S"):
                    lat = -lat
                lon = _to_degrees(gps["GPSLongitude"])
                if str(gps.get("GPSLongitudeRef", "E")).upper().startswith("W"):
                    lon = -lon
        except Exception:
            lat = lon = None

    return lat, lon, prise


def distance_km(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, asin, sqrt
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * 6371.0 * asin(sqrt(a))


def lieu_local(lat, lon):
    if lat is None or lon is None:
        return None, None
    meilleur, ecart = None, None
    for nom, rlat, rlon in LIEUX_REPERES:
        d = distance_km(lat, lon, rlat, rlon)
        if ecart is None or d < ecart:
            meilleur, ecart = nom, d
    if ecart is not None and ecart <= RAYON_KM:
        return meilleur, round(ecart, 1)
    return None, None


def lieu_osm(lat, lon, cache):
    """Reverse geocoding Nominatim (OpenStreetMap). 1 requete/s, cache par cle."""
    import urllib.request
    import urllib.parse
    cle = f"{round(lat, 3)},{round(lon, 3)}"
    if cle in cache:
        return cache[cle]
    params = urllib.parse.urlencode({
        "lat": lat, "lon": lon, "format": "jsonv2", "zoom": 14, "accept-language": "fr",
    })
    req = urllib.request.Request(
        f"https://nominatim.openstreetmap.org/reverse?{params}",
        headers={"User-Agent": "heldonica-evidence/1.0 (contact via heldonica.fr)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
        adr = data.get("address", {})
        nom = (adr.get("village") or adr.get("town") or adr.get("city")
               or adr.get("municipality") or adr.get("county") or data.get("name"))
        pays = adr.get("country")
        resultat = {"lieu": nom, "pays": pays} if nom else None
    except Exception as e:
        print(f"  [WARN] reverse geocoding echoue ({e})")
        resultat = None
    cache[cle] = resultat
    time.sleep(1.1)
    return resultat


def main():
    p = argparse.ArgumentParser(description="Registre de preuves photo pour Heldonica")
    p.add_argument("--dir", default=str(DEFAULT_SRC), help="Dossier des medias")
    p.add_argument("--out", default=str(DEFAULT_OUT), help="Fichier JSON de sortie")
    p.add_argument("--geocode", action="store_true",
                   help="Nommer les lieux via OpenStreetMap (reseau, 1 req/s)")
    args = p.parse_args()

    src = Path(args.dir)
    if not src.exists():
        print(f"[ERREUR] Dossier introuvable : {src}")
        print("Lance d'abord scripts/photos_picker.py pour telecharger les medias.")
        sys.exit(1)

    fichiers = sorted(
        f for f in src.iterdir()
        if f.is_file() and f.suffix.lower() in (IMAGE_EXT | VIDEO_EXT)
    )
    if not fichiers:
        print(f"[INFO] Aucun media dans {src}.")
        sys.exit(1)

    print(f"[INFO] Analyse de {len(fichiers)} fichier(s) dans {src}\n")

    medias, cache = [], {}
    sans_gps = sans_date = 0

    for f in fichiers:
        est_video = f.suffix.lower() in VIDEO_EXT
        lat, lon, prise = (None, None, None) if est_video else lire_exif(f)

        if not est_video:
            if lat is None:
                sans_gps += 1
            if prise is None:
                sans_date += 1

        lieu = source_lieu = None
        ecart = None
        if lat is not None:
            if args.geocode:
                r = lieu_osm(lat, lon, cache)
                if r:
                    lieu, source_lieu = r["lieu"], "openstreetmap"
            if not lieu:
                lieu, ecart = lieu_local(lat, lon)
                if lieu:
                    source_lieu = "table-locale"

        medias.append({
            "fichier": f.name,
            "type": "video" if est_video else "photo",
            "prise_de_vue": prise.isoformat() if prise else None,
            "gps": {"lat": round(lat, 6), "lon": round(lon, 6)} if lat is not None else None,
            "lieu": lieu,
            "lieu_source": source_lieu,
            "lieu_ecart_km": ecart,
        })

    dates = sorted(m["prise_de_vue"][:10] for m in medias if m["prise_de_vue"])
    mois_prouves, lieux_prouves = set(), {}

    for m in medias:
        if m["prise_de_vue"]:
            d = datetime.fromisoformat(m["prise_de_vue"])
            mois_prouves.add(f"{MOIS_FR[d.month - 1]} {d.year}")
        if m["lieu"]:
            lieux_prouves.setdefault(m["lieu"], 0)
            lieux_prouves[m["lieu"]] += 1

    registre = {
        "genere_le": datetime.now().isoformat(timespec="seconds"),
        "source": str(src),
        "avertissement": (
            "Faits etablis par les metadonnees des photos. Toute date ou tout lieu "
            "revendique dans le contenu du site doit figurer ici. Le reste (ressenti, "
            "anecdote, horaire, prix) vient de l'auteur, jamais d'une generation."
        ),
        "resume": {
            "medias": len(medias),
            "photos": sum(1 for m in medias if m["type"] == "photo"),
            "videos": sum(1 for m in medias if m["type"] == "video"),
            "sans_gps": sans_gps,
            "sans_date": sans_date,
            "premiere_date": dates[0] if dates else None,
            "derniere_date": dates[-1] if dates else None,
            "annees_prouvees": sorted({d[:4] for d in dates}),
            "mois_prouves": sorted(mois_prouves),
            "lieux_prouves": dict(sorted(lieux_prouves.items(), key=lambda kv: -kv[1])),
        },
        "medias": medias,
    }

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(registre, ensure_ascii=False, indent=2), encoding="utf-8")

    r = registre["resume"]
    print("=" * 60)
    print("  REGISTRE DE PREUVES")
    print("=" * 60)
    print(f"  Medias           : {r['medias']} ({r['photos']} photos, {r['videos']} videos)")
    print(f"  Periode prouvee  : {r['premiere_date'] or '?'} -> {r['derniere_date'] or '?'}")
    print(f"  Mois prouves     : {', '.join(r['mois_prouves']) or 'aucun'}")
    print(f"  Sans GPS / date  : {r['sans_gps']} / {r['sans_date']}")
    if r["lieux_prouves"]:
        print("  Lieux prouves    :")
        for nom, n in r["lieux_prouves"].items():
            print(f"    - {nom} ({n} media(s))")
    else:
        print("  Lieux prouves    : aucun (pas de GPS exploitable)")
    print(f"\n[OK] Registre ecrit : {out}")


if __name__ == "__main__":
    main()
