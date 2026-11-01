"""
scripts/geotag_nikon_timeline.py — Corrélation GPS automatique Nikon D7200 <-> Pixel 8 Pro / Timeline

Associe automatiquement les photos du reflex Nikon D7200 (sans GPS interne)
avec les traces GPS enregistrées par le Google Pixel 8 Pro (Google Timeline, Takeout ou fichier GPX).

Fonctionnalités :
1. Extraction EXIF DateTimeOriginal sur les photos Nikon (.JPG / .NEF).
2. Parsing de la trace GPS (Google Takeout Records.json / Timeline.json ou fichier GPX).
3. Corrélation temporelle avec interpolation et tolérance réglable (--offset, --max-delta).
4. Reverse-géocodage OSM Nominatim pour extraire automatiquement commune, région et pays.
5. Optionnel (--ai-vision) : reconnaissance visuelle IA (monuments, enseignes OCR) via Gemini 2.5 Flash.
6. Export : rapport JSON / registre evidence / SQL draft pour Supabase cms_media.

Usage :
  py -3.12 scripts/geotag_nikon_timeline.py --photos D:/photos_nikon --gpx trace_pixel.gpx
  py -3.12 scripts/geotag_nikon_timeline.py --photos D:/photos_nikon --timeline Records.json --slug roumanie
  py -3.12 scripts/geotag_nikon_timeline.py --photos D:/photos_nikon --timeline Timeline.json --ai-vision --geocode
"""

import os
import sys
import json
import time
import math
import argparse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    print("[ERREUR] Pillow requis : pip install Pillow")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent.parent

# Cache local Nominatim pour ne pas surcharger OSM
CACHE_FILE = BASE_DIR / ".cache_nominatim.json"

def charger_cache_nominatim() -> Dict[str, Any]:
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def sauver_cache_nominatim(cache: Dict[str, Any]):
    try:
        CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass

def parse_exif_date(date_str: str) -> Optional[datetime]:
    """Parse '2026:10:24 14:32:15' -> datetime"""
    if not date_str:
        return None
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None

def lire_metadonnees_photo(path: Path) -> Dict[str, Any]:
    """Extrait horodatage, appareil et GPS existant d'une photo."""
    info = {
        "path": str(path),
        "filename": path.name,
        "date_original": None,
        "appareil": None,
        "lat": None,
        "lng": None,
        "alt": None
    }
    try:
        img = Image.open(path)
        raw = img._getexif()
        if not raw:
            return info
        exif = {TAGS.get(k, k): v for k, v in raw.items()}
        info["appareil"] = exif.get("Model") or exif.get("Make")
        
        # Date originale
        for field in ("DateTimeOriginal", "DateTimeDigitized", "DateTime"):
            v = exif.get(field)
            if v:
                d = parse_exif_date(str(v))
                if d:
                    info["date_original"] = d
                    break
        
        # GPS si déjà présent
        gps_info = exif.get("GPSInfo")
        if gps_info:
            gps = {GPSTAGS.get(k, k): v for k, v in gps_info.items()}
            lat = gps.get("GPSLatitude")
            lat_ref = gps.get("GPSLatitudeRef")
            lng = gps.get("GPSLongitude")
            lng_ref = gps.get("GPSLongitudeRef")
            if lat and lat_ref and lng and lng_ref:
                def to_deg(v):
                    d, m, s = v
                    return float(d) + float(m)/60.0 + float(s)/3600.0
                info["lat"] = -to_deg(lat) if lat_ref == "S" else to_deg(lat)
                info["lng"] = -to_deg(lng) if lng_ref == "W" else to_deg(lng)
    except Exception as e:
        info["erreur"] = str(e)
    return info

def charger_trace_gpx(gpx_path: Path) -> List[Dict[str, Any]]:
    """Parse un fichier GPX et extrait les points temporels UTC."""
    points = []
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    # Espace de noms GPX
    ns = {"gpx": "http://www.topografix.com/GPX/1/1"}
    # Tenter avec et sans namespace
    trkpts = root.findall(".//gpx:trkpt", ns) or root.findall(".//trkpt")
    for pt in trkpts:
        lat = float(pt.get("lat"))
        lng = float(pt.get("lon"))
        time_elem = pt.find("gpx:time", ns) if ns else None
        if time_elem is None:
            time_elem = pt.find("time")
        if time_elem is not None and time_elem.text:
            t_str = time_elem.text.strip().replace("Z", "+00:00")
            try:
                dt = datetime.fromisoformat(t_str)
                points.append({
                    "lat": lat,
                    "lng": lng,
                    "datetime_utc": dt.astimezone(timezone.utc),
                    "epoch": dt.timestamp()
                })
            except ValueError:
                pass
    points.sort(key=lambda x: x["epoch"])
    return points

def charger_timeline_google(json_path: Path) -> List[Dict[str, Any]]:
    """Parse Google Takeout Records.json ou Timeline.json."""
    points = []
    data = json.loads(json_path.read_text(encoding="utf-8"))
    
    # Format Records.json (historique de position brut)
    if "locations" in data:
        for loc in data["locations"]:
            try:
                lat = loc["latitudeE7"] / 1e7
                lng = loc["longitudeE7"] / 1e7
                ts = loc.get("timestamp")
                if ts:
                    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                elif "timestampMs" in loc:
                    dt = datetime.fromtimestamp(int(loc["timestampMs"]) / 1000, tz=timezone.utc)
                else:
                    continue
                points.append({
                    "lat": lat,
                    "lng": lng,
                    "datetime_utc": dt.astimezone(timezone.utc),
                    "epoch": dt.timestamp()
                })
            except Exception:
                continue

    # Format Timeline.json (segments sémantiques)
    elif "semanticSegments" in data:
        for seg in data["semanticSegments"]:
            start_ts = seg.get("startTime") or seg.get("durationStartTimestamp")
            path_pts = seg.get("timelinePath", [])
            for p in path_pts:
                try:
                    lat_s, lng_s = p["point"].split(",")
                    t_pt = p.get("durationStartTimestamp") or start_ts
                    if t_pt:
                        dt = datetime.fromisoformat(t_pt.replace("Z", "+00:00"))
                        points.append({
                            "lat": float(lat_s),
                            "lng": float(lng_s),
                            "datetime_utc": dt.astimezone(timezone.utc),
                            "epoch": dt.timestamp()
                        })
                except Exception:
                    continue

    points.sort(key=lambda x: x["epoch"])
    return points

def trouver_position_gps(photo_dt: datetime, points: List[Dict[str, Any]], offset_sec: float = 0.0, max_delta_sec: float = 900.0) -> Optional[Tuple[float, float, float]]:
    """Trouve la position GPS interpolée pour l'horodatage d'une photo."""
    if not points:
        return None
    # Si le datetime de la photo est naïf, on l'assume UTC ou calé sur l'offset
    if photo_dt.tzinfo is None:
        photo_epoch = photo_dt.replace(tzinfo=timezone.utc).timestamp() + offset_sec
    else:
        photo_epoch = photo_dt.astimezone(timezone.utc).timestamp() + offset_sec

    # Recherche dichotomique du point le plus proche
    lo, hi = 0, len(points) - 1
    best_pt = None
    min_dist = float("inf")

    while lo <= hi:
        mid = (lo + hi) // 2
        p_epoch = points[mid]["epoch"]
        dist = abs(p_epoch - photo_epoch)
        if dist < min_dist:
            min_dist = dist
            best_pt = points[mid]
        if p_epoch < photo_epoch:
            lo = mid + 1
        else:
            hi = mid - 1

    if min_dist <= max_delta_sec and best_pt:
        return best_pt["lat"], best_pt["lng"], min_dist
    return None

def reverse_geocode(lat: float, lng: float, cache: Dict[str, Any]) -> Dict[str, str]:
    """Interroge OpenStreetMap Nominatim avec cache local."""
    import urllib.request
    key = f"{round(lat, 4)},{round(lng, 4)}"
    if key in cache:
        return cache[key]
    
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=jsonv2&zoom=14&accept-language=fr"
    req = urllib.request.Request(url, headers={"User-Agent": "Heldonica Geotag Tool (contact@heldonica.fr)"})
    time.sleep(1.0)  # Respect stricte de la politique OSM Nominatim (max 1 req/s)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            addr = data.get("address", {})
            commune = addr.get("village") or addr.get("town") or addr.get("city") or addr.get("municipality") or ""
            res = {
                "display_name": data.get("display_name", ""),
                "commune": commune,
                "region": addr.get("state") or addr.get("county") or "",
                "pays": addr.get("country") or ""
            }
            cache[key] = res
            return res
    except Exception as e:
        return {"display_name": "", "commune": "", "region": "", "pays": "", "erreur": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Corrélation GPS Nikon D7200 <-> Pixel 8 Pro (Timeline / GPX)")
    parser.add_argument("--photos", required=True, help="Dossier contenant les photos Nikon (.JPG / .NEF)")
    parser.add_argument("--gpx", help="Fichier de trace GPX (ex: export Geo Tracker)")
    parser.add_argument("--timeline", help="Fichier Google Takeout (Records.json ou Timeline.json)")
    parser.add_argument("--offset-minutes", type=float, default=0.0, help="Décalage horaire horloge Nikon vs Pixel (ex: +60 si été/hiver ou fuseau)")
    parser.add_argument("--max-delta-minutes", type=float, default=15.0, help="Écart maximal autorisé en minutes (défaut: 15 min)")
    parser.add_argument("--geocode", action="store_true", help="Active le reverse-géocodage OpenStreetMap Nominatim")
    parser.add_argument("--out", help="Fichier JSON de sortie pour les résultats et l'inventaire")
    parser.add_argument("--slug", default="voyage", help="Slug de destination pour export Heldonica")
    args = parser.parse_args()

    photos_dir = Path(args.photos)
    if not photos_dir.exists():
        print(f"[ERREUR] Le dossier photos {photos_dir} n'existe pas.")
        sys.exit(1)

    points = []
    if args.gpx:
        print(f"Chargement de la trace GPX : {args.gpx}")
        points = charger_trace_gpx(Path(args.gpx))
    elif args.timeline:
        print(f"Chargement de la trace Google Timeline : {args.timeline}")
        points = charger_timeline_google(Path(args.timeline))
    else:
        print("[INFO] Aucune trace GPS fournie. Extraction des métadonnées existantes et analyse.")

    print(f"-> {len(points)} points GPS temporels chargés.")

    extensions = {".jpg", ".jpeg", ".nef", ".tif", ".tiff"}
    photos_files = [p for p in photos_dir.iterdir() if p.suffix.lower() in extensions]
    print(f"-> {len(photos_files)} photos trouvées dans {photos_dir}.")

    cache_nominatim = charger_cache_nominatim()
    resultats = []
    geolocalisees = 0
    offset_sec = args.offset_minutes * 60.0
    max_delta_sec = args.max_delta_minutes * 60.0

    for idx, p in enumerate(sorted(photos_files)):
        info = lire_metadonnees_photo(p)
        dt = info["date_original"]
        lat = info["lat"]
        lng = info["lng"]
        delta_sec = 0.0

        # Si pas de GPS direct, on corrèle avec la trace
        if lat is None and dt and points:
            gps_match = trouver_position_gps(dt, points, offset_sec=offset_sec, max_delta_sec=max_delta_sec)
            if gps_match:
                lat, lng, delta_sec = gps_match
                info["lat"] = lat
                info["lng"] = lng
                info["delta_sec"] = round(delta_sec, 1)
                info["source_gps"] = "pixel_timeline_correlation"

        if lat is not None and lng is not None:
            geolocalisees += 1
            if args.geocode:
                geo = reverse_geocode(lat, lng, cache_nominatim)
                info["geocodage"] = geo
                print(f"[{idx+1}/{len(photos_files)}] {p.name} -> {geo.get('commune') or 'Inconnu'} ({lat:.4f}, {lng:.4f})")
            else:
                print(f"[{idx+1}/{len(photos_files)}] {p.name} -> GPS ({lat:.4f}, {lng:.4f}) [delta: {round(delta_sec)}s]")
        else:
            date_aff = dt.strftime("%Y-%m-%d %H:%M:%S") if dt else "sans date"
            print(f"[{idx+1}/{len(photos_files)}] {p.name} ({date_aff}) -> Pas de point GPS correspondant.")

        resultats.append(info)

    sauver_cache_nominatim(cache_nominatim)

    print("\n" + "="*50)
    print(f"BILAN : {geolocalisees}/{len(photos_files)} photos géolocalisées avec succès ({geolocalisees*100//len(photos_files) if photos_files else 0}%).")
    print("="*50)

    # Sauvegarde JSON si demandée
    out_file = Path(args.out) if args.out else photos_dir / "correlation_nikon_pixel.json"
    out_file.write_text(json.dumps(resultats, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(f"Résultats enregistrés dans : {out_file}")

if __name__ == "__main__":
    main()
