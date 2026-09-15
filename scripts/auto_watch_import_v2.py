"""
Heldonica — Pipeline 100% automatisé V2
Création + Enrichissement via Google Takeout (Maps + Photos)

- Surveille ~/Downloads pour takeout*.zip
- Extrait : Photos (EXIF GPS), Saved Places, Timeline/Records.json, KML/GPX
- Génère :
  1. public/images/destinations/[slug]/... (médias)
  2. content/destinations/[slug]/trajet_gps.json (GeoJSON)
  3. content/evidence/[slug].json (registre preuves pour check-content-coherence)
  4. supabase/migrations/auto_takeout_*.sql (INSERTs drafts — published=false, source='takeout')
     -> à committer, jamais d'écriture directe en prod (AGENTS.md)

Usage:
  python scripts/auto_watch_import_v2.py
  python scripts/auto_watch_import_v2.py --zip ~/Downloads/takeout-20260902.zip --slug roumanie
  python scripts/auto_watch_import_v2.py --slug sicile --watch

V2: creation drafts + enrichissement POIs (metadata, google_place_id)
"""

import os, sys, time, json, zipfile, shutil, re, argparse
from pathlib import Path
from datetime import datetime
from xml.etree import ElementTree as ET

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    Image = None

# --- Config ---
DOWNLOADS_DIR = Path(os.path.expanduser("~")) / "Downloads"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
HELDONICA_MEDIA = PROJECT_ROOT / "public" / "images" / "destinations"
HELDONICA_CONTENT = PROJECT_ROOT / "content" / "destinations"
HELDONICA_EVIDENCE = PROJECT_ROOT / "content" / "evidence"
MIGRATIONS_DIR = PROJECT_ROOT / "supabase" / "migrations"

# Category mapping Google -> Heldonica POI
CATEGORY_MAP = {
    "restaurant": "restaurant", "food": "restaurant", "cafe": "restaurant",
    "lodging": "logement", "hotel": "logement", "hostel": "logement",
    "parking": "parking", "gas_station": "parking",
    "tourist_attraction": "point_vue", "viewpoint": "point_vue", "museum": "point_vue",
    "beach": "baignade", "natural_feature": "baignade",
    "hiking": "activite", "trail": "activite",
    "bus_station": "transport", "train_station": "transport", "airport": "transport",
}

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:60] or "lieu"

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
                return {"filename": image_path.name, "latitude": round(lat, 6), "longitude": round(lon, 6), "date": date_taken}
    except Exception:
        pass
    return None

def parse_saved_places(data: dict) -> list:
    """Parse Google Takeout Saved Places - gère 3 formats possibles"""
    places = []
    # Format 1: {"features": [{"properties": {"Title":..., "Location": {"Address":...}}, "geometry": {"coordinates": [lng, lat]}}]}
    # Format 2: {"savedPlaces": [{"title":..., "url":..., "location": {"latitudeE7":..., "longitudeE7":...}}]}
    # Format 3: liste brute
    candidates = []
    if isinstance(data, dict):
        if "features" in data:
            candidates = data["features"]
        elif "savedPlaces" in data:
            candidates = data["savedPlaces"]
        elif "places" in data:
            candidates = data["places"]
        else:
            # Cherche une liste dans les valeurs
            for v in data.values():
                if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                    candidates = v
                    break
    elif isinstance(data, list):
        candidates = data

    for item in candidates:
        try:
            title = item.get("Title") or item.get("title") or item.get("name") or "Lieu sans nom"
            url = item.get("url") or item.get("link") or item.get("googleMapsUrl") or ""
            address = ""
            lat = lng = None
            place_id = item.get("placeId") or item.get("place_id") or item.get("googlePlaceId") or None

            # Geometry
            if "geometry" in item and "coordinates" in item["geometry"]:
                lng, lat = item["geometry"]["coordinates"][:2]
            elif "location" in item:
                loc = item["location"]
                if "latitudeE7" in loc:
                    lat = loc["latitudeE7"] / 1e7
                    lng = loc["longitudeE7"] / 1e7
                elif "latitude" in loc:
                    lat = float(loc["latitude"])
                    lng = float(loc["longitude"])
                address = loc.get("address") or loc.get("Address") or ""
            elif "lat" in item and "lng" in item:
                lat = float(item["lat"]); lng = float(item["lng"])

            # Properties fallback
            if not address:
                props = item.get("properties") or {}
                address = props.get("Location", {}).get("Address", "") or props.get("address", "") or ""

            if lat is not None and lng is not None:
                places.append({"title": title, "lat": float(lat), "lng": float(lng), "address": address, "url": url, "place_id": place_id, "raw": item})
        except Exception as e:
            print(f"  [WARN] SavedPlace skip: {e}")
    return places

def parse_timeline_records(data: dict) -> list:
    points = []
    # Records.json : {"locations": [{"latitudeE7":..., "longitudeE7":..., "timestamp":...}]}
    # Timeline.json : {"semanticSegments": [{"timelinePath": [{"point": "lat,lng"}]}]}
    if "locations" in data:
        for loc in data["locations"][:5000]:  # limite
            try:
                lat = loc["latitudeE7"] / 1e7
                lng = loc["longitudeE7"] / 1e7
                ts = loc.get("timestamp") or loc.get("timestampMs") or ""
                points.append({"lat": lat, "lng": lng, "timestamp": ts})
            except: pass
    elif "semanticSegments" in data:
        for seg in data["semanticSegments"]:
            for p in seg.get("timelinePath", []):
                try:
                    lat, lng = p["point"].split(",")
                    points.append({"lat": float(lat), "lng": float(lng), "timestamp": p.get("durationStartTimestamp") or ""})
                except: pass
    return points

def parse_kml(content: bytes) -> list:
    try:
        root = ET.fromstring(content)
        ns = {"kml": "http://www.opengis.net/kml/2.2"}
        points = []
        for coord in root.findall(".//kml:coordinates", ns):
            for pair in coord.text.strip().split():
                parts = pair.split(",")
                if len(parts) >= 2:
                    points.append({"lat": float(parts[1]), "lng": float(parts[0]), "timestamp": ""})
        return points
    except: return []

def infer_category(place: dict) -> str:
    raw = json.dumps(place.get("raw", {})).lower()
    for keyword, cat in CATEGORY_MAP.items():
        if keyword in raw:
            return cat
    return "point_vue" if not place.get("address") else "info"

def generate_migration_sql(slug: str, saved_places: list, timeline_points: list, gps_points: list, total_media: int) -> str:
    now = datetime.now().isoformat()
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    lines = []
    lines.append(f"-- Auto-generated from Takeout — {now}")
    lines.append(f"-- Destination: {slug} | Places: {len(saved_places)} | Timeline: {len(timeline_points)} | Photos GPS: {len(gps_points)}")
    lines.append(f"-- !! REVIEW REQUIRED — tous les INSERTs sont en draft / inactive, published=false !!")
    lines.append(f"-- Appliquer via: supabase db push")
    lines.append("")

    # 1. article_map_pois depuis Saved Places (enrichissement)
    if saved_places:
        lines.append("-- 1. POIs depuis Google Maps Saved Places (source='gmaps_saved', à enrichir via /api/cron/enrich-places)")
        for p in saved_places:
            cat = infer_category(p)
            title_esc = p['title'].replace("'", "''")
            addr_esc = (p['address'] or "").replace("'", "''")
            url_esc = (p['url'] or "").replace("'", "''")
            pid = p['place_id']
            pid_sql = f"'{pid.replace(chr(39), chr(39)+chr(39))}'" if pid else "NULL"
            meta = json.dumps({"imported_at": now, "google_place_id": pid, "raw_types": []}, ensure_ascii=False).replace("'", "''")
            lines.append(f"INSERT INTO public.article_map_pois (content_slug, name, category, lat, lng, address, maps_url, google_place_id, source, metadata)")
            lines.append(f"VALUES ('{slug}', '{title_esc}', '{cat}', {p['lat']}, {p['lng']}, '{addr_esc}', '{url_esc}', {pid_sql}, 'gmaps_saved', '{meta}'::jsonb)")
            lines.append(f"ON CONFLICT DO NOTHING;")
        lines.append("")

    # 2. article_map_routes depuis Timeline / GPS photos
    all_coords = []
    if timeline_points:
        all_coords.extend([(pt["lng"], pt["lat"]) for pt in timeline_points[:200]])  # limite 200 pour lisibilité
    elif gps_points:
        all_coords.extend([(pt["longitude"], pt["latitude"]) for pt in gps_points])

    if len(all_coords) >= 2:
        route_name = f"Itinéraire {slug.capitalize()} (auto Takeout {ts})"
        route_name_esc = route_name.replace("'", "''")
        lines.append(f"-- 2. Route auto depuis Timeline/GPS (source='takeout', is_active=false pour review)")
        lines.append(f"INSERT INTO public.article_map_routes (content_slug, content_type, name, source, is_active, metadata)")
        lines.append(f"VALUES ('{slug}', 'destination', '{route_name_esc}', 'takeout', false, '{{\"imported_at\": \"{now}\", \"points\": {len(all_coords)}}}'::jsonb)")
        lines.append(f"RETURNING id; -- récupérer l'id pour les points ci-dessous (à faire manuellement ou via script)")
        lines.append(f"-- Points (à insérer après récupération de route_id) :")
        for i, (lng, lat) in enumerate(all_coords[:100]):  # limite 100 points
            lines.append(f"-- INSERT INTO public.article_map_route_points (route_id, lat, lng, seq) VALUES ('<route_id>', {lat}, {lng}, {i});")
        lines.append("")

    # 3. Draft blog post si cluster détecté (au moins 3 POIs ou 5 photos)
    if len(saved_places) >= 3 or len(gps_points) >= 5:
        post_slug = f"{slug}-carnet-{ts}"
        title = f"Carnet {slug.capitalize()} — brouillon auto ({len(saved_places)} lieux, {len(gps_points)} photos)"
        title_esc = title.replace("'", "''")
        excerpt = f"Brouillon généré automatiquement depuis Google Takeout du {now[:10]}. {len(saved_places)} lieux enregistrés, {len(gps_points)} photos géolocalisées. À relire et enrichir avant publication."
        excerpt_esc = excerpt.replace("'", "''")
        content = f"<p><em>Brouillon auto — ne pas publier tel quel.</em></p><p>Sources : Google Maps Saved Places + Photos EXIF GPS. Vérifier chaque lieu (adresse, horaires) et remplacer les descriptions par votre vécu.</p><ul>" + "".join(f"<li>{p['title']} — {p['address']}</li>" for p in saved_places[:10]) + "</ul>"
        content_esc = content.replace("'", "''")
        meta = json.dumps({"imported_at": now, "saved_places": len(saved_places), "gps_photos": len(gps_points), "timeline_points": len(timeline_points)}, ensure_ascii=False).replace("'", "''")
        lines.append(f"-- 3. Draft article (published=false, auto_generated=true) — CRÉATION")
        lines.append(f"INSERT INTO public.cms_blog_posts (title, slug, excerpt, content, category, tags, featured_image, author, published, auto_generated, source, source_metadata)")
        lines.append(f"VALUES ('{title_esc}', '{post_slug}', '{excerpt_esc}', '{content_esc}', 'Carnet', ARRAY['{slug}','auto-import'], '', 'Heldonica', false, true, 'takeout', '{meta}'::jsonb)")
        lines.append(f"ON CONFLICT (slug) DO NOTHING;")
        lines.append("")

    lines.append(f"INSERT INTO public.import_logs (import_type, filename, total_items, created_items, metadata)")
    lines.append(f"VALUES ('takeout', 'takeout-{ts}.zip', {len(saved_places)+len(gps_points)}, {len(saved_places)}, '{{\"slug\": \"{slug}\", \"timeline\": {len(timeline_points)}}}'::jsonb);")
    return "\n".join(lines)

def process_takeout_zip(zip_path: Path, destination_slug="roumanie"):
    print(f"\n[AUTO V2] Traitement : {zip_path.name} -> slug={destination_slug}")
    dest_img_dir = HELDONICA_MEDIA / destination_slug
    dest_data_dir = HELDONICA_CONTENT / destination_slug
    dest_img_dir.mkdir(parents=True, exist_ok=True)
    dest_data_dir.mkdir(parents=True, exist_ok=True)
    HELDONICA_EVIDENCE.mkdir(parents=True, exist_ok=True)

    extracted_count = 0
    gps_points = []
    saved_places = []
    timeline_points = []

    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.namelist():
            lower = member.lower()

            # Photos & Videos
            if any(lower.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.heic']):
                filename = Path(member).name
                if not filename or filename.startswith('.'):
                    continue
                target = dest_img_dir / filename
                # évite écrasement
                if target.exists():
                    stem, suffix = target.stem, target.suffix
                    target = dest_img_dir / f"{stem}_{int(time.time())}{suffix}"
                with z.open(member) as source, open(target, 'wb') as tf:
                    shutil.copyfileobj(source, tf)
                extracted_count += 1
                gps = extract_gps(target)
                if gps:
                    gps["path"] = f"/images/destinations/{destination_slug}/{target.name}"
                    gps_points.append(gps)

            # Saved Places JSON
            elif 'saved' in lower and lower.endswith('.json'):
                try:
                    with z.open(member) as f:
                        data = json.loads(f.read().decode('utf-8', errors='ignore'))
                    places = parse_saved_places(data)
                    saved_places.extend(places)
                    print(f"  -> Saved Places : {member} ({len(places)} lieux)")
                    # copie brute pour audit
                    (dest_data_dir / f"saved_places_{Path(member).stem}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
                except Exception as e:
                    print(f"  [WARN] Saved Places parse fail {member}: {e}")

            # Timeline / Records
            elif 'records.json' in lower or 'timeline.json' in lower or ('location' in lower and lower.endswith('.json')):
                try:
                    with z.open(member) as f:
                        data = json.loads(f.read().decode('utf-8', errors='ignore'))
                    pts = parse_timeline_records(data)
                    timeline_points.extend(pts)
                    print(f"  -> Timeline : {member} ({len(pts)} points)")
                    (dest_data_dir / f"timeline_{Path(member).stem}.json").write_text(json.dumps(data, ensure_ascii=False)[:500000], encoding='utf-8')
                except Exception as e:
                    print(f"  [WARN] Timeline parse fail {member}: {e}")

            # KML / GPX
            elif lower.endswith('.kml'):
                try:
                    with z.open(member) as f:
                        pts = parse_kml(f.read())
                    timeline_points.extend(pts)
                    print(f"  -> KML : {member} ({len(pts)} points)")
                    target_kml = dest_data_dir / Path(member).name
                    with z.open(member) as src, open(target_kml, 'wb') as tf:
                        shutil.copyfileobj(src, tf)
                except Exception as e:
                    print(f"  [WARN] KML fail {member}: {e}")
            elif lower.endswith('.gpx'):
                try:
                    with z.open(member) as f:
                        pts = parse_kml(f.read())  # GPX ~ KML coords
                    timeline_points.extend(pts)
                    print(f"  -> GPX : {member} ({len(pts)} points)")
                except: pass

    gps_points.sort(key=lambda p: p.get("date") or "")

    # GeoJSON
    geojson = None
    if gps_points or timeline_points:
        features = []
        coords_line = []
        if timeline_points:
            coords_line = [[p["lng"], p["lat"]] for p in timeline_points[:1000]]
        elif gps_points:
            coords_line = [[p["longitude"], p["latitude"]] for p in gps_points]
        if len(coords_line) >= 2:
            features.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": coords_line}, "properties": {"name": f"Itinéraire {destination_slug.capitalize()}", "count": len(coords_line)}})
        for p in gps_points:
            features.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [p["longitude"], p["latitude"]]}, "properties": {"title": p["filename"], "date": p.get("date"), "image": p["path"]}})
        geojson = {"type": "FeatureCollection", "features": features}
        out_file = dest_data_dir / "trajet_gps.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({"destination": destination_slug, "generated_at": datetime.now().isoformat(), "total_media": extracted_count, "geolocated_points": len(gps_points), "saved_places": len(saved_places), "timeline_points": len(timeline_points), "geojson": geojson}, f, indent=2, ensure_ascii=False)
        print(f"[OK] GeoJSON : {out_file} ({len(gps_points)} photos GPS, {len(timeline_points)} timeline)")

    # Registre preuves (pour check-content-coherence)
    if gps_points:
        evidence = {
            "genere_le": datetime.now().isoformat(timespec="seconds"),
            "source": str(dest_img_dir),
            "avertissement": "Faits établis par métadonnées photos. Toute date/lieu revendiqué doit figurer ici.",
            "resume": {"medias": extracted_count, "geolocated": len(gps_points), "saved_places": len(saved_places)},
            "medias": gps_points
        }
        (HELDONICA_EVIDENCE / f"{destination_slug}.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[OK] Registre preuves : content/evidence/{destination_slug}.json")

    # Migration SQL auto (à committer)
    sql = generate_migration_sql(destination_slug, saved_places, timeline_points, gps_points, extracted_count)
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    mig_file = MIGRATIONS_DIR / f"20260902{ts}_auto_takeout_{destination_slug}.sql"
    mig_file.write_text(sql, encoding="utf-8")
    print(f"[OK] Migration générée : {mig_file.name}")
    print(f"  -> {len(saved_places)} POIs (gmaps_saved, à enrichir)")
    print(f"  -> {len(timeline_points)} points timeline")
    if len(saved_places) >= 3 or len(gps_points) >= 5:
        print(f"  -> 1 draft article (published=false)")

    print(f"\n[SUCCÈS] {extracted_count} médias | {len(gps_points)} GPS | {len(saved_places)} lieux | {len(timeline_points)} trace")
    print(f"  Next: git add {mig_file.name} && supabase db push -- puis enrichissement via /api/cron/enrich-places")

def main():
    parser = argparse.ArgumentParser(description="Heldonica Takeout V2")
    parser.add_argument("--zip", dest="zip_path", help="Chemin zip Takeout")
    parser.add_argument("--slug", default="roumanie", help="Slug destination (ex: roumanie, sicile, madere)")
    parser.add_argument("--watch", action="store_true", help="Mode veille ~/Downloads")
    args = parser.parse_args()

    print("="*60)
    print("  🚀 Heldonica — Takeout V2 (Création + Enrichissement)")
    print("="*60)

    if args.zip_path:
        process_takeout_zip(Path(args.zip_path), args.slug)
        return

    takeout_zips = list(DOWNLOADS_DIR.glob("takeout*.zip")) + list(DOWNLOADS_DIR.glob("Takeout*.zip"))
    if takeout_zips:
        for z in takeout_zips:
            process_takeout_zip(z, args.slug)
        return

    if args.watch:
        print(f"\n[VEILLE] {DOWNLOADS_DIR} — en attente de takeout*.zip ...")
        seen = set(takeout_zips)
        while True:
            time.sleep(5)
            current = set(DOWNLOADS_DIR.glob("takeout*.zip")) | set(DOWNLOADS_DIR.glob("Takeout*.zip"))
            new = current - seen
            for z in new:
                process_takeout_zip(z, args.slug)
            seen = current
    else:
        print(f"\n[EN VEILLE] Aucun ZIP trouvé dans {DOWNLOADS_DIR}")
        print(f"  Usage: python scripts/auto_watch_import_v2.py --zip ~/Downloads/takeout.zip --slug {args.slug}")
        print(f"  Ou:    python scripts/auto_watch_import_v2.py --watch --slug {args.slug}")

if __name__ == "__main__":
    main()
