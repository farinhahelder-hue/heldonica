"""
reprise_media_storage — recrée dans cms_media les fiches des objets deja
presents dans le stockage Supabase (bucket media/destinations/<dest>/).

Pourquoi : le 21/09/2026, l'import Google Photos a televerse 75 photos de
Roumanie puis a echoue 75 fois sur l'insertion en base (aucune contrainte
unique pour son ON CONFLICT). Les fichiers sont la, les fiches non. Plutot
que de redemander a l'autrice de tout reselectionner, on lit chaque objet,
son EXIF (date de prise de vue, GPS s'il a survecu — Google le retire des
telechargements du Picker) et on ecrit la fiche, idempotent par chemin.

Regle 1 : rien n'est deduit. Sans EXIF, taken_at et latitude restent NULL.

Usage :
  python scripts/reprise_media_storage.py --destination roumanie
  python scripts/reprise_media_storage.py --destination roumanie --dry-run
"""
import argparse
import io
import json
import re
import sys
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
from photos_evidence import lire_exif  # noqa: E402

BUCKET = "media"
# DJI_20260827_222212_341.jpg, IMG_20260827_134657.jpg : l'appareil ecrit
# l'instant de prise de vue dans le nom. Google reencode certains fichiers du
# Picker et y perd l'EXIF de date (mesure sur un Osmo Mobile). Le nom reste
# une donnee de l'appareil, pas une deduction : on l'etiquette date_source.
RE_DATE_NOM = re.compile(r"(20\d{2})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})")


def date_du_nom(nom):
    m = RE_DATE_NOM.search(nom)
    if not m:
        return None
    from datetime import datetime
    try:
        return datetime(*map(int, m.groups()))
    except ValueError:
        return None
IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
VIDEOS = {".mp4", ".mov", ".webm", ".m4v"}


def lire_env():
    env = {}
    for nom in (".env.local", ".env"):
        f = Path(nom)
        if not f.exists():
            continue
        for ligne in f.read_text(encoding="utf-8").splitlines():
            if "=" in ligne and not ligne.lstrip().startswith("#"):
                k, v = ligne.split("=", 1)
                env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def requete(url, cle, methode="GET", corps=None, entetes=None):
    h = {"apikey": cle, "Authorization": f"Bearer {cle}"}
    if entetes:
        h.update(entetes)
    data = None
    if corps is not None:
        data = json.dumps(corps).encode("utf-8")
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=h, method=methode)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def lister(url, cle, prefixe):
    objets, offset = [], 0
    while True:
        page = json.loads(requete(f"{url}/storage/v1/object/list/{BUCKET}", cle, "POST",
                                  {"prefix": prefixe, "limit": 500, "offset": offset,
                                   "sortBy": {"column": "name", "order": "asc"}}))
        objets.extend(o for o in page if o.get("id"))  # les « dossiers » n'ont pas d'id
        if len(page) < 500:
            break
        offset += 500
    return objets


def main():
    p = argparse.ArgumentParser(description="Recreer les fiches cms_media depuis le stockage")
    p.add_argument("--destination", required=True, help="Sous-dossier de destinations/, ex. roumanie")
    p.add_argument("--dry-run", action="store_true", help="Lire et afficher, ne rien ecrire")
    args = p.parse_args()

    env = lire_env()
    url, cle = env.get("NEXT_PUBLIC_SUPABASE_URL"), env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not cle:
        print("[ERREUR] NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquent dans .env.local")
        sys.exit(1)

    dest = re.sub(r"[^a-z0-9-]", "", args.destination.lower())
    prefixe = f"destinations/{dest}"
    objets = lister(url, cle, prefixe)
    print(f"[INFO] {len(objets)} objet(s) sous {BUCKET}/{prefixe}/")

    # Fiches deja presentes : on ne relit pas l'EXIF de ce qui est deja decrit.
    existants = json.loads(requete(
        f"{url}/rest/v1/cms_media?select=path&path=like.{urllib.parse.quote(prefixe + '/%', safe='')}", cle))
    deja = {e["path"] for e in existants}
    print(f"[INFO] {len(deja)} fiche(s) deja en base pour ce prefixe")

    crees = avec_date = avec_gps = echecs = 0
    for o in objets:
        chemin = f"{prefixe}/{o['name']}"
        if chemin in deja:
            continue
        ext = Path(o["name"]).suffix.lower()
        mime = (o.get("metadata") or {}).get("mimetype") or ("video/mp4" if ext in VIDEOS else "image/jpeg")
        taille = (o.get("metadata") or {}).get("size")
        lat = lon = prise = None
        date_source = "aucune"
        if ext in IMAGES:
            try:
                octets = requete(f"{url}/storage/v1/object/{BUCKET}/{urllib.parse.quote(chemin)}", cle)
                with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                    tmp.write(octets)
                    tmp_path = Path(tmp.name)
                try:
                    lat, lon, prise = lire_exif(tmp_path)
                    if prise:
                        date_source = "exif"
                finally:
                    tmp_path.unlink(missing_ok=True)
            except Exception as e:  # une photo illisible n'arrete pas la reprise
                print(f"  [EXIF] {o['name']} : {e}")
        if prise is None:
            prise = date_du_nom(o["name"])
            if prise:
                date_source = "nom_fichier"
        fiche = {
            "filename": o["name"],
            "url": f"{url}/storage/v1/object/public/{BUCKET}/{chemin}",
            "path": chemin,
            "mime_type": mime,
            "size": taille,
            "source": "gphotos",
            "google_photo_id": None,
            "latitude": lat,
            "longitude": lon,
            "taken_at": prise.isoformat() if prise else None,
            "metadata": {"destination": dest, "reprise": "storage-2026-09-21", "date_source": date_source},
        }
        avec_date += bool(prise)
        avec_gps += lat is not None
        if args.dry_run:
            print(f"  {o['name'][:44]:<44} {(prise.isoformat()[:16] if prise else '-'):<16} {date_source:<12} {'gps' if lat is not None else '-'}")
            continue
        try:
            requete(f"{url}/rest/v1/cms_media?on_conflict=path", cle, "POST", fiche,
                    {"Prefer": "resolution=merge-duplicates,return=minimal"})
            crees += 1
        except urllib.error.HTTPError as e:
            echecs += 1
            print(f"  [BASE] {o['name']} : {e.read().decode()[:160]}")

    print(f"[BILAN] {crees} fiche(s) ecrite(s), {avec_date} avec date, {avec_gps} avec GPS, {echecs} echec(s)"
          + (" (simulation)" if args.dry_run else ""))


if __name__ == "__main__":
    main()
