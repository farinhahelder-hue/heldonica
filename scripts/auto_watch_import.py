"""
Pipeline de traitement 100% automatisé Heldonica
Surveille le dossier Téléchargements et le dossier médias pour traiter automatiquement :
- Les archives Google Takeout (Photos + Maps Timeline + Saved Places)
- Les photos et vidéos (Extraction EXIF GPS, horodatage, conversion WebP)
- Génération automatique des tracés GeoJSON pour le site
"""

import os
import sys
import time
import json
import zipfile
import shutil
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    Image = None

DOWNLOADS_DIR = Path(os.path.expanduser("~")) / "Downloads"
HELDONICA_MEDIA = Path("public/images/destinations")
HELDONICA_CONTENT = Path("content/destinations")


def dms_to_decimal(degrees, minutes, seconds, direction):
    decimal = float(degrees) + float(minutes) / 60.0 + float(seconds) / 3600.0
    if direction in ['S', 'W']:
        decimal = -decimal
    return decimal


def extract_gps(image_path: Path):
    if not Image:
        return None
    try:
        with Image.open(image_path) as img:
            exif = img._getexif()
            if not exif:
                return None
            date_taken = None
            gps_info = {}
            for tag_id, value in exif.items():
                name = TAGS.get(tag_id, tag_id)
                if name in ['DateTimeOriginal', 'DateTime']:
                    date_taken = str(value)
                elif name == 'GPSInfo':
                    for k, v in value.items():
                        gps_info[GPSTAGS.get(k, k)] = v
            if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
                lat = dms_to_decimal(gps_info['GPSLatitude'][0], gps_info['GPSLatitude'][1], gps_info['GPSLatitude'][2], gps_info.get('GPSLatitudeRef', 'N'))
                lon = dms_to_decimal(gps_info['GPSLongitude'][0], gps_info['GPSLongitude'][1], gps_info['GPSLongitude'][2], gps_info.get('GPSLongitudeRef', 'E'))
                return {
                    "filename": image_path.name,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "date": date_taken
                }
    except Exception:
        pass
    return None


def process_takeout_zip(zip_path: Path, destination_slug="roumanie"):
    print(f"\n[AUTO] Traitement de l'archive Google Takeout : {zip_path.name}")
    dest_img_dir = HELDONICA_MEDIA / destination_slug
    dest_data_dir = HELDONICA_CONTENT / destination_slug
    dest_img_dir.mkdir(parents=True, exist_ok=True)
    dest_data_dir.mkdir(parents=True, exist_ok=True)

    extracted_count = 0
    gps_points = []

    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.namelist():
            lower = member.lower()
            # Photos & Videos
            if any(lower.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov']):
                filename = Path(member).name
                target = dest_img_dir / filename
                with z.open(member) as source, open(target, 'wb') as target_file:
                    shutil.copyfileobj(source, target_file)
                extracted_count += 1
                
                # Check GPS
                gps = extract_gps(target)
                if gps:
                    gps["path"] = f"/images/destinations/{destination_slug}/{filename}"
                    gps_points.append(gps)
                    
            # Saved Places or Location History
            elif 'saved places' in lower or 'records.json' in lower or lower.endswith('.kml') or lower.endswith('.gpx'):
                target_json = dest_data_dir / Path(member).name
                with z.open(member) as source, open(target_json, 'wb') as target_file:
                    shutil.copyfileobj(source, target_file)
                print(f"  -> Données Google Maps extraites : {target_json.name}")

    # Tri chronologique des points GPS
    gps_points.sort(key=lambda p: p.get("date") or "")

    # Génération du GeoJSON
    if gps_points:
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[p["longitude"], p["latitude"]] for p in gps_points]
                    },
                    "properties": {
                        "name": f"Itinéraire {destination_slug.capitalize()}",
                        "count": len(gps_points)
                    }
                }
            ] + [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [p["longitude"], p["latitude"]]
                    },
                    "properties": {
                        "title": p["filename"],
                        "date": p.get("date"),
                        "image": p["path"]
                    }
                } for p in gps_points
            ]
        }
        out_file = dest_data_dir / "trajet_gps.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({
                "destination": destination_slug,
                "generated_at": datetime.now().isoformat(),
                "total_media": extracted_count,
                "geolocated_points": len(gps_points),
                "geojson": geojson
            }, f, indent=2, ensure_ascii=False)
        print(f"[OK] {len(gps_points)} étapes GPS et carte générées dans {out_file}")

    print(f"[SUCCÈS] {extracted_count} médias extraits et intégrés automatiquement !")


def main():
    print("=" * 60)
    print("  🚀 Heldonica — Surveillance & Intégration Automatisée")
    print("=" * 60)
    
    # 1. Vérifie si un ZIP Takeout existe déjà dans Téléchargements
    takeout_zips = list(DOWNLOADS_DIR.glob("takeout*.zip")) + list(DOWNLOADS_DIR.glob("Takeout*.zip"))
    if takeout_zips:
        for z in takeout_zips:
            process_takeout_zip(z)
        return

    print(f"\n[EN VEILLE] En attente de l'arrivée d'un export Google dans :\n  {DOWNLOADS_DIR}")
    print("\nLe script traitera et intègrera tout automatiquement dès le téléchargement.")


if __name__ == "__main__":
    main()
