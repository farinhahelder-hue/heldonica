import os
import sys
import json
import time
import math
from pathlib import Path
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import requests

def get_decimal_from_dms(dms, ref):
    try:
        degrees = float(dms[0])
        minutes = float(dms[1])
        seconds = float(dms[2])
        dec = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ['S', 'W']:
            dec = -dec
        return dec
    except Exception:
        return None

def distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def extract_photo_metadata(filepath):
    try:
        with Image.open(filepath) as img:
            exif = img._getexif()
            if not exif:
                return None
            
            make = str(exif.get(271, '')).strip()
            model = str(exif.get(272, '')).strip()
            date = exif.get(36867) or exif.get(306) # DateTimeOriginal or DateTime
            
            lat, lon = None, None
            gps = exif.get(34853)
            if gps:
                gps_dict = {GPSTAGS.get(gk, gk): gv for gk, gv in gps.items()}
                if 'GPSLatitude' in gps_dict and 'GPSLatitudeRef' in gps_dict:
                    lat = get_decimal_from_dms(gps_dict['GPSLatitude'], gps_dict['GPSLatitudeRef'])
                if 'GPSLongitude' in gps_dict and 'GPSLongitudeRef' in gps_dict:
                    lon = get_decimal_from_dms(gps_dict['GPSLongitude'], gps_dict['GPSLongitudeRef'])
            
            return {
                'name': filepath.name,
                'path': str(filepath),
                'make': make,
                'model': model,
                'date': str(date) if date else None,
                'lat': lat,
                'lon': lon,
                'size': filepath.stat().st_size
            }
    except Exception:
        return None

def reverse_geocode(lat, lon, cache={}):
    # Clé de cache arrondie à 3 décimales (~110m)
    cache_key = (round(lat, 3), round(lon, 3))
    if cache_key in cache:
        return cache[cache_key]
    
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat:.6f}&lon={lon:.6f}&format=json&zoom=18&addressdetails=1"
    headers = {'User-Agent': 'HeldonicaSlowTravelPhotos/1.0 (contact@heldonica.fr)'}
    try:
        r = requests.get(url, headers=headers, timeout=6)
        if r.ok:
            data = r.json()
            addr = data.get('address', {})
            poi = (addr.get('tourism') or addr.get('historic') or addr.get('amenity') or 
                   addr.get('natural') or addr.get('viewpoint') or addr.get('leisure') or 
                   addr.get('road') or addr.get('building') or '')
            city = (addr.get('city') or addr.get('town') or addr.get('village') or 
                    addr.get('municipality') or addr.get('county') or '')
            country = addr.get('country', 'Monténégro')
            display = data.get('display_name', '')
            
            res = {
                'poi': poi,
                'city': city,
                'country': country,
                'display_name': display,
                'gmaps_url': f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}"
            }
            cache[cache_key] = res
            return res
    except Exception:
        pass
    
    res = {
        'poi': '',
        'city': '',
        'country': 'Monténégro',
        'display_name': '',
        'gmaps_url': f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}"
    }
    cache[cache_key] = res
    return res

def main():
    root = Path(r"C:\Users\conta\Downloads\Montenegro")
    exts = {'.jpg', '.jpeg', '.png', '.heic', '.webp'}
    all_files = [f for f in root.rglob('*') if f.is_file() and f.suffix.lower() in exts]
    print(f"Total photos trouvees : {len(all_files)}")

    parsed = []
    for i, f in enumerate(all_files):
        meta = extract_photo_metadata(f)
        if meta and meta['lat'] is not None and meta['lon'] is not None:
            parsed.append(meta)
        if (i + 1) % 400 == 0:
            print(f"  Analyse EXIF : {i + 1}/{len(all_files)}...")

    print(f"Photos exploitables avec GPS : {len(parsed)}/{len(all_files)}")
    
    # Trier par date chronologique
    parsed.sort(key=lambda x: x['date'] or '')

    # Regrouper par clusters géographiques de 300m
    spots = []
    for p in parsed:
        assigned = False
        for s in spots:
            dist = distance_km(p['lat'], p['lon'], s['lat'], s['lon'])
            if dist < 0.35: # 350m
                s['photos'].append(p['name'])
                assigned = True
                break
        if not assigned:
            spots.append({
                'lat': p['lat'],
                'lon': p['lon'],
                'first_date': p['date'],
                'photos': [p['name']],
                'devices': {f"{p['make']} {p['model']}".strip()}
            })

    print(f"Nombre de spots d'arret identifies : {len(spots)}")

    # Reverse geocoding avec tempo de 1s
    geo_cache = {}
    enriched_spots = []
    print("Geolocalisation des spots en cours...")
    for i, s in enumerate(spots):
        geo = reverse_geocode(s['lat'], s['lon'], geo_cache)
        spot_info = {
            'spot_id': f"mne-spot-{i+1:02d}",
            'poi': geo['poi'],
            'city': geo['city'],
            'country': geo['country'],
            'full_address': geo['display_name'],
            'lat': s['lat'],
            'lon': s['lon'],
            'gmaps_url': geo['gmaps_url'],
            'date': s['first_date'],
            'photo_count': len(s['photos']),
            'sample_photos': s['photos'][:5]
        }
        enriched_spots.append(spot_info)
        print(f"  [{i+1}/{len(spots)}] {geo['city']} - {geo['poi']} ({len(s['photos'])} photos) -> {geo['gmaps_url']}")
        time.sleep(1.0) # Respect rate limits

    # Sauvegarde JSON
    out_evidence = Path(r"V:\PRIVE (HELDER)\heldonica\content\evidence\montenegro.json")
    out_evidence.parent.mkdir(parents=True, exist_ok=True)
    with open(out_evidence, 'w', encoding='utf-8') as f:
        json.dump({
            'destination': 'Monténégro',
            'scanned_total': len(all_files),
            'gps_verified_photos': len(parsed),
            'spots_count': len(enriched_spots),
            'spots': enriched_spots
        }, f, ensure_ascii=False, indent=2)

    print(f"\nFini ! Fichier d'evidence genere dans : {out_evidence}")

if __name__ == '__main__':
    main()
