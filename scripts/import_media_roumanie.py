import sys
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass
"""
Script Master pour Heldonica - Import Photos/Vidéos & Tracé GPS Roumanie
Télécharge les albums partagés Google Photos (via gallery-dl), extrait le GPS EXIF et génère le trajet GeoJSON.
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    Image = None

DEST_MEDIA_DIR = Path("public/images/destinations/roumanie")
DEST_DATA_DIR = Path("content/destinations/roumanie")


def dms_to_decimal(degrees, minutes, seconds, direction):
    """Convertit degrés/minutes/secondes en coordonnées décimales."""
    decimal = float(degrees) + float(minutes) / 60.0 + float(seconds) / 3600.0
    if direction in ['S', 'W']:
        decimal = -decimal
    return decimal


def extract_gps_and_date(image_path: Path):
    """Extrait les coordonnées GPS et la date d'une image."""
    if not Image:
        return None
    try:
        with Image.open(image_path) as img:
            exif_data = img._getexif()
            if not exif_data:
                return None

            date_taken = None
            gps_info = {}

            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, tag_id)
                if tag_name == 'DateTimeOriginal' or tag_name == 'DateTime':
                    date_taken = str(value)
                elif tag_name == 'GPSInfo':
                    for gps_tag_id, gps_val in value.items():
                        gps_tag_name = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_info[gps_tag_name] = gps_val

            if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
                lat = dms_to_decimal(
                    gps_info['GPSLatitude'][0],
                    gps_info['GPSLatitude'][1],
                    gps_info['GPSLatitude'][2],
                    gps_info.get('GPSLatitudeRef', 'N')
                )
                lon = dms_to_decimal(
                    gps_info['GPSLongitude'][0],
                    gps_info['GPSLongitude'][1],
                    gps_info['GPSLongitude'][2],
                    gps_info.get('GPSLongitudeRef', 'E')
                )
                return {
                    "filename": image_path.name,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "date": date_taken,
                    "path": f"/images/destinations/roumanie/{image_path.name}"
                }
    except Exception as e:
        pass
    return None


def download_from_url(url: str, dest_dir: Path):
    """Télécharge un album partagé Google Photos via gallery-dl."""
    print(f"\n[INFO] Téléchargement de l'album depuis le lien : {url}")
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        sys.executable, "-m", "gallery_dl",
        "--directory", str(dest_dir.resolve()),
        "--filename", "{filename}.{extension}",
        "--no-mtime",
        url
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("[OK] Téléchargement terminé avec succès !")
    except Exception as e:
        print(f"[ERREUR] Échec du téléchargement via gallery-dl : {e}")


def generate_trip_route(media_dir: Path, output_json: Path):
    """Analyse toutes les photos, extrait les coordonnées GPS et génère le fichier de trajet."""
    output_json.parent.mkdir(parents=True, exist_ok=True)
    print(f"\n[INFO] Analyse des métadonnées GPS et dates dans {media_dir}...")
    
    points = []
    extensions = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".dng"}
    
    for f in media_dir.iterdir():
        if f.is_file() and f.suffix.lower() in extensions:
            gps = extract_gps_and_date(f)
            if gps:
                points.append(gps)

    if not points:
        print("[INFO] Aucune métadonnée GPS trouvée dans les fichiers locaux.")
        return

    # Trier par date de prise de vue
    def sort_key(p):
        return p.get("date") or ""
        
    points.sort(key=sort_key)
    
    # Création du GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[p["longitude"], p["latitude"]] for p in points]
                },
                "properties": {
                    "name": "Itinéraire Roumanie",
                    "total_points": len(points)
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
            } for p in points
        ]
    }
    
    with open(output_json, "w", encoding="utf-8") as out:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "count": len(points),
            "points": points,
            "geojson": geojson
        }, out, indent=2, ensure_ascii=False)
        
    print(f"[OK] Tracé GPS de {len(points)} étape(s) généré dans : {output_json}")


def main():
    parser = argparse.ArgumentParser(description="Import Médias & Tracé GPS Roumanie pour Heldonica")
    parser.add_argument("--url", type=str, help="Lien de partage de l'album Google Photos")
    parser.add_argument("--scan", action="store_true", help="Scanner le dossier local et générer le trajet GPS")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("  🇷🇴 Heldonica — Import Médias & Trajet Roumanie")
    print("=" * 60)
    
    if args.url:
        download_from_url(args.url, DEST_MEDIA_DIR)
        
    generate_trip_route(DEST_MEDIA_DIR, DEST_DATA_DIR / "trajet_gps.json")


if __name__ == "__main__":
    main()
