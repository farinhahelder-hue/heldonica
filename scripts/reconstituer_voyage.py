"""
reconstituer_voyage — reconstitue un voyage jour par jour a partir de l'export
Timeline du telephone et des photos.

Principe (regle 1) : la Timeline et l'EXIF donnent ce qui est mesurable — ou on
etait, quand, combien de kilometres, quelles photos a quel endroit. Le script
n'ecrit RIEN d'autre : pas de nom de lieu invente (coordonnees + « a nommer »
sans --geocode), pas de ressenti, pas de prix. Le recit reste a l'auteur, dans
les balises [A TOI] de voyage.md, comme dans draft_from_evidence.mjs.

Entrees :
  - un export Timeline. Depuis 2024 Google ne le met plus dans Takeout : il se
    fait depuis Google Maps sur le telephone (photo de profil > Vos trajets >
    reglages > Exporter les donnees Timeline) et donne un Timeline.json avec
    semanticSegments / rawSignals. Les anciens formats Takeout sont acceptes
    aussi : Records.json (locations[]) et Semantic Location History
    (timelineObjects[] avec placeVisit / activitySegment, qui portent des noms).
  - optionnellement un dossier de photos (EXIF : date de prise de vue, GPS),
    lues par les memes fonctions que photos_evidence.py — ou, avec --photos-cms,
    les photos deja importees dans la mediatheque du panneau (Google Photos >
    /panel-manager/photos > table cms_media : date, GPS s'il a survecu, url).

Sorties (dans le dossier de sortie, par defaut imports/<slug>/, non versionne —
les positions sont des donnees personnelles) :
  - voyage.json : la reconstitution structuree (jours > lieux > photos, trajets,
    distances, durees) — les faits, et d'ou ils viennent.
  - voyage.md   : la relecture, jour par jour, avec les balises [A TOI].

Usage :
  python scripts/reconstituer_voyage.py --timeline ~/Downloads/Timeline.json --slug madere-2024
  python scripts/reconstituer_voyage.py --timeline Timeline.json --photos ~/Photos/Madere --slug madere-2024
  python scripts/reconstituer_voyage.py --timeline Timeline.json --slug x --from 2024-04-15 --to 2024-04-22 --geocode
  python scripts/reconstituer_voyage.py --timeline Timeline.json --photos-cms madere --slug madere-2024
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
try:
    from photos_evidence import lire_exif, distance_km, IMAGE_EXT, MOIS_FR
except ImportError as e:  # pragma: no cover
    print(f"[ERREUR] photos_evidence.py introuvable ou Pillow manquant ({e})")
    sys.exit(1)

# Un arret = des positions brutes qui restent dans ce rayon pendant au moins
# cette duree. Sert uniquement quand l'export n'a pas deja ses « visites ».
RAYON_ARRET_M = 150
DUREE_ARRET_MIN = 15
# Une photo sans GPS est rattachee au lieu ou l'on etait a cette heure-la ;
# avec GPS, au lieu le plus proche s'il est a moins de ce rayon.
RAYON_PHOTO_KM = 1.0
# Une photo prise en chemin (randonnee) est loin du point d'arret mais colle a la
# trace du jour : dans ce rayon de la trace, elle va au lieu en cours a cette heure.
RAYON_TRACE_KM = 0.5

ACTIVITES_FR = {
    "WALKING": "a pied", "ON_FOOT": "a pied", "RUNNING": "en courant",
    "HIKING": "en randonnee", "CYCLING": "a velo", "ON_BICYCLE": "a velo",
    "IN_PASSENGER_VEHICLE": "en voiture", "IN_VEHICLE": "en voiture",
    "MOTORCYCLING": "a moto", "IN_BUS": "en bus", "IN_TRAIN": "en train",
    "IN_SUBWAY": "en metro", "IN_TRAM": "en tram", "IN_FERRY": "en ferry",
    "SAILING": "en bateau", "FLYING": "en avion", "SKIING": "a ski",
    "UNKNOWN_ACTIVITY_TYPE": "trajet", "UNKNOWN": "trajet",
}
A_PIED = {"WALKING", "ON_FOOT", "RUNNING", "HIKING"}


# ---------------------------------------------------------------- lecture --

def parse_latlng(valeur):
    """'32.65°, -16.9°' | 'geo:32.65,-16.9' | {'latitudeE7':…} → (lat, lon) ou None."""
    if valeur is None:
        return None
    if isinstance(valeur, dict):
        if "latitudeE7" in valeur and "longitudeE7" in valeur:
            return valeur["latitudeE7"] / 1e7, valeur["longitudeE7"] / 1e7
        if "latLng" in valeur:
            return parse_latlng(valeur["latLng"])
        if "LatLng" in valeur:
            return parse_latlng(valeur["LatLng"])
        return None
    s = str(valeur).strip()
    if s.startswith("geo:"):
        s = s[4:]
    nombres = re.findall(r"-?\d+(?:\.\d+)?", s)
    if len(nombres) < 2:
        return None
    lat, lon = float(nombres[0]), float(nombres[1])
    if abs(lat) > 90 or abs(lon) > 180:
        return None
    return lat, lon


def parse_temps(valeur):
    """ISO 8601 avec ou sans millisecondes / offset. Sans offset → UTC."""
    if valeur is None:
        return None
    s = str(valeur).strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def lire_timeline(chemin: Path):
    """Retourne (visites, trajets, positions, format).

    visite   : {debut, fin, lat, lon, nom, adresse, type_semantique}
    trajet   : {debut, fin, type, distance_m, lat_debut, lon_debut, lat_fin, lon_fin}
    position : (dt, lat, lon)
    """
    with open(chemin, encoding="utf-8") as f:
        data = json.load(f)

    visites, trajets, positions = [], [], []
    fmt = None

    # Export telephone (Android : objet avec semanticSegments ; iOS : liste).
    segments = None
    if isinstance(data, dict) and "semanticSegments" in data:
        segments, fmt = data["semanticSegments"], "timeline-telephone"
    elif isinstance(data, list) and data and isinstance(data[0], dict) and (
        "visit" in data[0] or "activity" in data[0] or "timelinePath" in data[0]
    ):
        segments, fmt = data, "timeline-telephone-ios"

    if segments is not None:
        for seg in segments:
            debut, fin = parse_temps(seg.get("startTime")), parse_temps(seg.get("endTime"))
            if "visit" in seg and debut and fin:
                cand = (seg["visit"] or {}).get("topCandidate") or {}
                ll = parse_latlng(cand.get("placeLocation"))
                if ll:
                    visites.append({
                        "debut": debut, "fin": fin, "lat": ll[0], "lon": ll[1],
                        "nom": None, "adresse": None,
                        "type_semantique": cand.get("semanticType"),
                    })
            if "activity" in seg and debut and fin:
                act = seg["activity"] or {}
                cand = act.get("topCandidate") or {}
                d0, d1 = parse_latlng(act.get("start")), parse_latlng(act.get("end"))
                trajets.append({
                    "debut": debut, "fin": fin,
                    "type": cand.get("type") or "UNKNOWN",
                    "distance_m": float(act.get("distanceMeters") or 0),
                    "lat_debut": d0[0] if d0 else None, "lon_debut": d0[1] if d0 else None,
                    "lat_fin": d1[0] if d1 else None, "lon_fin": d1[1] if d1 else None,
                })
            for p in seg.get("timelinePath") or []:
                ll = parse_latlng(p.get("point"))
                t = parse_temps(p.get("time"))
                if t is None and debut is not None and "durationMinutesOffsetFromStartTime" in p:
                    t = debut + timedelta(minutes=float(p["durationMinutesOffsetFromStartTime"]))
                if ll and t:
                    positions.append((t, ll[0], ll[1]))
        for sig in (data.get("rawSignals") if isinstance(data, dict) else None) or []:
            pos = sig.get("position")
            if pos:
                ll = parse_latlng(pos.get("LatLng") or pos.get("latLng"))
                t = parse_temps(pos.get("timestamp"))
                if ll and t:
                    positions.append((t, ll[0], ll[1]))

    # Takeout ancien : Records.json
    elif isinstance(data, dict) and "locations" in data:
        fmt = "takeout-records"
        for loc in data["locations"]:
            ll = parse_latlng(loc)
            t = parse_temps(loc.get("timestamp") or loc.get("timestampMs"))
            if t is None and loc.get("timestampMs"):
                t = datetime.fromtimestamp(int(loc["timestampMs"]) / 1000, tz=timezone.utc)
            if ll and t:
                positions.append((t, ll[0], ll[1]))

    # Takeout ancien : Semantic Location History (un fichier par mois)
    elif isinstance(data, dict) and "timelineObjects" in data:
        fmt = "takeout-semantic"
        for obj in data["timelineObjects"]:
            if "placeVisit" in obj:
                pv = obj["placeVisit"]
                loc, dur = pv.get("location") or {}, pv.get("duration") or {}
                ll = parse_latlng(loc)
                debut, fin = parse_temps(dur.get("startTimestamp")), parse_temps(dur.get("endTimestamp"))
                if ll and debut and fin:
                    visites.append({
                        "debut": debut, "fin": fin, "lat": ll[0], "lon": ll[1],
                        "nom": loc.get("name"), "adresse": loc.get("address"),
                        "type_semantique": loc.get("semanticType"),
                    })
            if "activitySegment" in obj:
                seg = obj["activitySegment"]
                dur = seg.get("duration") or {}
                debut, fin = parse_temps(dur.get("startTimestamp")), parse_temps(dur.get("endTimestamp"))
                d0, d1 = parse_latlng(seg.get("startLocation")), parse_latlng(seg.get("endLocation"))
                if debut and fin:
                    trajets.append({
                        "debut": debut, "fin": fin,
                        "type": seg.get("activityType") or "UNKNOWN",
                        "distance_m": float(seg.get("distance") or 0),
                        "lat_debut": d0[0] if d0 else None, "lon_debut": d0[1] if d0 else None,
                        "lat_fin": d1[0] if d1 else None, "lon_fin": d1[1] if d1 else None,
                    })
                for chemin_pts in ((seg.get("waypointPath") or {}).get("waypoints") or []):
                    ll = parse_latlng({"latitudeE7": chemin_pts.get("latE7"), "longitudeE7": chemin_pts.get("lngE7")}) \
                        if "latE7" in chemin_pts else None
                    if ll:
                        positions.append((debut, ll[0], ll[1]))
                for p in ((seg.get("simplifiedRawPath") or {}).get("points") or []):
                    ll = parse_latlng({"latitudeE7": p.get("latE7"), "longitudeE7": p.get("lngE7")}) if "latE7" in p else None
                    t = parse_temps(p.get("timestamp"))
                    if ll and t:
                        positions.append((t, ll[0], ll[1]))

    if fmt is None:
        raise ValueError(
            "Format non reconnu : attendu un Timeline.json du telephone (semanticSegments), "
            "un Records.json (locations) ou un fichier Semantic Location History (timelineObjects)."
        )

    positions.sort(key=lambda p: p[0])
    visites.sort(key=lambda v: v["debut"])
    trajets.sort(key=lambda t: t["debut"])
    return visites, trajets, positions, fmt


# ------------------------------------------------------------- reconstruction --

def arrets_depuis_positions(positions):
    """Detection d'arrets sur positions brutes : on reste dans RAYON_ARRET_M
    pendant au moins DUREE_ARRET_MIN. Retourne des visites sans nom."""
    arrets = []
    i, n = 0, len(positions)
    while i < n:
        t0, lat0, lon0 = positions[i]
        j = i + 1
        lats, lons = [lat0], [lon0]
        while j < n:
            _, lat, lon = positions[j]
            if distance_km(lat0, lon0, lat, lon) * 1000 > RAYON_ARRET_M:
                break
            lats.append(lat); lons.append(lon)
            j += 1
        t1 = positions[j - 1][0]
        if (t1 - t0) >= timedelta(minutes=DUREE_ARRET_MIN):
            arrets.append({
                "debut": t0, "fin": t1,
                "lat": sum(lats) / len(lats), "lon": sum(lons) / len(lons),
                "nom": None, "adresse": None, "type_semantique": None,
            })
            i = j
        else:
            i += 1
    return arrets


def distance_chemin_km(positions):
    total = 0.0
    for (t0, la0, lo0), (t1, la1, lo1) in zip(positions, positions[1:]):
        d = distance_km(la0, lo0, la1, lo1)
        # Un saut aberrant (GPS qui decroche) ne compte pas comme du chemin.
        if d < 50:
            total += d
    return total


def jour_local(dt: datetime) -> str:
    return dt.date().isoformat()


def rattacher_photos(photos, visites, positions):
    """Avec GPS : au lieu le plus proche du meme jour s'il est a moins de
    RAYON_PHOTO_KM — et si aucun ne l'est, la photo reste sans lieu (le GPS
    contredit la Timeline, on ne force pas). Sans GPS : au lieu ou l'on etait
    a cette heure-la."""
    for ph in photos:
        ph["lieu_index"] = None
        ph["rattachement"] = None
        prise = ph["prise_dt"]
        if prise is None:
            continue
        if ph["gps"]:
            meilleur, ecart = None, None
            for idx, v in enumerate(visites):
                if jour_local(v["debut"]) != jour_local(prise):
                    continue
                d = distance_km(ph["gps"]["lat"], ph["gps"]["lon"], v["lat"], v["lon"])
                if ecart is None or d < ecart:
                    meilleur, ecart = idx, d
            if meilleur is not None and ecart <= RAYON_PHOTO_KM:
                ph["lieu_index"] = meilleur
                ph["rattachement"] = f"gps ({ecart:.2f} km)"
                continue
            # Loin de tout arret, mais sur la trace du jour ? (photo en chemin)
            jour = jour_local(prise)
            d_trace = None
            for t, la, lo in positions:
                if jour_local(t) != jour:
                    continue
                d = distance_km(ph["gps"]["lat"], ph["gps"]["lon"], la, lo)
                if d_trace is None or d < d_trace:
                    d_trace = d
            if d_trace is not None and d_trace <= RAYON_TRACE_KM:
                for idx, v in enumerate(visites):
                    if v["debut"] <= prise <= v["fin"]:
                        ph["lieu_index"] = idx
                        ph["rattachement"] = f"gps sur la trace du jour ({d_trace:.2f} km de la trace, {ecart:.1f} km de l'arret)"
                        break
                if ph["lieu_index"] is None:
                    ph["rattachement"] = f"gps sur la trace du jour ({d_trace:.2f} km) mais aucun arret a cette heure"
            elif ecart is not None:
                ph["rattachement"] = f"gps a {ecart:.1f} km du lieu le plus proche"
            continue
        for idx, v in enumerate(visites):
            if v["debut"] <= prise <= v["fin"]:
                ph["lieu_index"] = idx
                ph["rattachement"] = "heure"
                break


def sidecar_takeout(f: Path):
    """Takeout Google Photos pose un .json a cote de chaque photo :
    photoTakenTime.timestamp et geoData (position estimee par Google quand la
    photo n'a pas de GPS EXIF). On le lit en complement, jamais a la place."""
    candidats = [f.with_name(f.name + ".json"), f.with_name(f.name + ".supplemental-metadata.json"),
                 f.with_name(f.stem + ".json")]
    for c in candidats:
        if c.exists():
            try:
                d = json.loads(c.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                return None, None, None
            ts = (d.get("photoTakenTime") or {}).get("timestamp")
            prise = datetime.fromtimestamp(int(ts), tz=timezone.utc) if ts else None
            geo = d.get("geoData") or d.get("geoDataExif") or {}
            lat, lon = geo.get("latitude"), geo.get("longitude")
            if not lat and not lon:
                lat = lon = None
            return lat, lon, prise
    return None, None, None


def lire_photos(dossier: Path):
    photos = []
    for f in sorted(dossier.iterdir()):
        if not f.is_file() or f.suffix.lower() not in IMAGE_EXT:
            continue
        lat, lon, prise = lire_exif(f)
        source = "exif"
        if lat is None or prise is None:
            s_lat, s_lon, s_prise = sidecar_takeout(f)
            if lat is None and s_lat is not None:
                lat, lon, source = s_lat, s_lon, "takeout-json"
            if prise is None and s_prise is not None:
                prise, source = s_prise, "takeout-json"
        prise_dt = None
        if prise is not None:
            # L'EXIF n'a pas de fuseau : on prend l'heure telle quelle, comme heure
            # locale du lieu — c'est ce que l'appareil a ecrit. Le sidecar Takeout
            # est en UTC (timestamp), il garde son fuseau.
            prise_dt = prise if prise.tzinfo else prise.replace(tzinfo=timezone.utc)
        photos.append({
            "fichier": f.name,
            "prise_de_vue": prise.isoformat() if prise else None,
            "prise_dt": prise_dt,
            "prise_fuseau_connu": prise is not None and prise.tzinfo is not None,
            "gps": {"lat": round(lat, 6), "lon": round(lon, 6)} if lat is not None else None,
            "source": source,
        })
    return photos


def lire_env_local():
    """NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY depuis .env.local,
    jamais depuis le code (regle 3)."""
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


def lire_photos_cms(destination: str):
    """Les photos de la mediatheque (cms_media) pour une destination : celles
    que l'auteur a choisies dans Google Photos via /panel-manager/photos, ou
    envoyees depuis l'APK. Meme structure que lire_photos, meme regle : on ne
    prend que ce qui est mesure (taken_at, latitude/longitude) — rien n'est
    deduit. Google retire le GPS des fichiers telecharges par le Picker : ces
    photos se placent alors par l'heure, sur la Timeline."""
    import urllib.request
    env = lire_env_local()
    url, cle = env.get("NEXT_PUBLIC_SUPABASE_URL"), env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not cle:
        raise ValueError("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquent dans .env.local")
    # Les photos venues de l'APK n'ont pas de destination : « toutes » les prend
    # aussi, la fenetre de dates fait ensuite le tri.
    dest = re.sub(r"[^a-z0-9-]", "", destination.lower())
    filtre = "" if dest in ("", "toutes", "tout", "all") else f"&metadata->>destination=eq.{dest}"
    requete = (f"{url}/rest/v1/cms_media?select=filename,url,taken_at,latitude,longitude,source,metadata"
               f"{filtre}&order=taken_at.asc.nullslast&limit=1000")
    req = urllib.request.Request(requete, headers={"apikey": cle, "Authorization": f"Bearer {cle}"})
    with urllib.request.urlopen(req, timeout=60) as r:
        lignes = json.load(r)
    photos = []
    for l in lignes:
        prise_dt = None
        if l.get("taken_at"):
            try:
                prise_dt = datetime.fromisoformat(str(l["taken_at"]).replace("Z", "+00:00"))
            except ValueError:
                prise_dt = None
            if prise_dt is not None and prise_dt.tzinfo is None:
                prise_dt = prise_dt.replace(tzinfo=timezone.utc)
        lat, lon = l.get("latitude"), l.get("longitude")
        photos.append({
            "fichier": l.get("filename") or l.get("url"),
            "url": l.get("url"),
            "prise_de_vue": prise_dt.isoformat() if prise_dt else None,
            "prise_dt": prise_dt,
            "prise_fuseau_connu": prise_dt is not None,
            "gps": {"lat": round(float(lat), 6), "lon": round(float(lon), 6)} if lat is not None and lon is not None else None,
            "source": f"cms:{l.get('source') or '?'}",
        })
    return photos


def nom_lieu_osm(lat, lon, cache):
    """Nom fin d'un arret (zoom 17 : lieu-dit, commerce, rue) + commune. Nominatim,
    1 requete/s. Different de lieu_osm (niveau commune) qui sert au registre."""
    import urllib.request
    import urllib.parse
    cle = f"{round(lat, 4)},{round(lon, 4)}"
    if cle in cache:
        return cache[cle]
    params = urllib.parse.urlencode({"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 17, "accept-language": "fr"})
    req = urllib.request.Request(f"https://nominatim.openstreetmap.org/reverse?{params}",
                                 headers={"User-Agent": "heldonica-evidence/1.0 (contact via heldonica.fr)"})
    resultat = None
    try:
        import time as _t
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
        adr = data.get("address", {})
        commune = adr.get("village") or adr.get("town") or adr.get("city") or adr.get("municipality")
        precis = data.get("name") or adr.get("hamlet") or adr.get("neighbourhood") or adr.get("suburb") or adr.get("road")
        if precis and commune and precis != commune:
            resultat = f"{precis}, {commune}"
        else:
            resultat = precis or commune
        _t.sleep(1.1)
    except Exception as e:
        print(f"  [WARN] reverse geocoding echoue ({e})")
    cache[cle] = resultat
    return resultat


def aligner_fuseau_photos(photos, visites):
    """L'EXIF est en heure locale sans fuseau ; la Timeline porte ses offsets.
    On donne aux photos l'offset de la visite du meme jour la plus proche, pour
    que les comparaisons d'heures aient un sens."""
    offsets_par_jour = {}
    for v in visites:
        offsets_par_jour.setdefault(jour_local(v["debut"]), v["debut"].utcoffset())
    for ph in photos:
        if ph["prise_dt"] is None or ph.get("prise_fuseau_connu"):
            continue
        naive = ph["prise_dt"].replace(tzinfo=None)
        off = offsets_par_jour.get(naive.date().isoformat())
        if off is not None:
            ph["prise_dt"] = naive.replace(tzinfo=timezone(off))


def reconstituer(visites, trajets, positions, photos, date_min, date_max):
    def dans_fenetre(dt):
        j = jour_local(dt)
        return (date_min is None or j >= date_min) and (date_max is None or j <= date_max)

    visites = [v for v in visites if dans_fenetre(v["debut"])]
    trajets = [t for t in trajets if dans_fenetre(t["debut"])]
    positions = [p for p in positions if dans_fenetre(p[0])]
    photos = [p for p in photos if p["prise_dt"] is None or dans_fenetre(p["prise_dt"])]

    source_lieux = "visites-timeline"
    if not visites and positions:
        visites = arrets_depuis_positions(positions)
        source_lieux = "arrets-detectes"

    rattacher_photos(photos, visites, positions)

    jours = defaultdict(lambda: {"lieux": [], "trajets": [], "photos_sans_lieu": [], "positions": []})
    for idx, v in enumerate(visites):
        jours[jour_local(v["debut"])]["lieux"].append((idx, v))
    for t in trajets:
        jours[jour_local(t["debut"])]["trajets"].append(t)
    for p in positions:
        jours[jour_local(p[0])]["positions"].append(p)
    for ph in photos:
        if ph["lieu_index"] is None and ph["prise_dt"] is not None:
            jours[jour_local(ph["prise_dt"])]["photos_sans_lieu"].append(ph)
    photos_sans_date = [ph["fichier"] for ph in photos if ph["prise_dt"] is None]

    sortie = []
    for date in sorted(jours):
        j = jours[date]
        lieux = []
        for idx, v in j["lieux"]:
            duree = int((v["fin"] - v["debut"]).total_seconds() // 60)
            lieux.append({
                "arrivee": v["debut"].isoformat(timespec="minutes"),
                "depart": v["fin"].isoformat(timespec="minutes"),
                "duree_min": duree,
                "lat": round(v["lat"], 6), "lon": round(v["lon"], 6),
                "nom": v.get("nom"), "nom_source": v.get("nom_source"),
                "adresse": v.get("adresse"),
                "type_semantique": v.get("type_semantique"),
                "photos": [
                    {"fichier": ph["fichier"], "prise_de_vue": ph["prise_de_vue"], "rattachement": ph.get("rattachement"), "source": ph.get("source")}
                    for ph in photos if ph["lieu_index"] == idx
                ],
            })
        trajets_j = []
        for t in j["trajets"]:
            trajets_j.append({
                "debut": t["debut"].isoformat(timespec="minutes"),
                "fin": t["fin"].isoformat(timespec="minutes"),
                "duree_min": int((t["fin"] - t["debut"]).total_seconds() // 60),
                "mode": ACTIVITES_FR.get(t["type"], t["type"].lower()),
                "mode_brut": t["type"],
                "distance_km": round(t["distance_m"] / 1000, 1),
            })
        dist_trajets = sum(t["distance_km"] for t in trajets_j)
        dist_chemin = round(distance_chemin_km(j["positions"]), 1) if j["positions"] else None
        marche = round(sum(t["distance_km"] for t in trajets_j if t["mode_brut"] in A_PIED), 1)
        sortie.append({
            "date": date,
            "lieux": lieux,
            "trajets": trajets_j,
            "distance_km": round(dist_trajets, 1) if trajets_j else dist_chemin,
            "distance_source": "trajets-timeline" if trajets_j else ("positions" if dist_chemin is not None else None),
            "marche_km": marche if trajets_j else None,
            "photos_sans_lieu": [{"fichier": ph["fichier"], "prise_de_vue": ph["prise_de_vue"], "raison": ph.get("rattachement") or "aucun lieu a cette heure"} for ph in j["photos_sans_lieu"]],
            "positions": len(j["positions"]),
        })
    return sortie, source_lieux, photos_sans_date, len(photos)


# ------------------------------------------------------------------ sorties --

def heure(iso):
    return iso[11:16] if iso else "?"


def etiquette_lieu(l):
    if l["nom"]:
        return l["nom"]
    if l.get("type_semantique") in ("HOME", "INFERRED_HOME"):
        return f"hebergement, deduit par la Timeline ({l['lat']}, {l['lon']})"
    return f"lieu a nommer ({l['lat']}, {l['lon']})"


def moments_photos(photos, ecart_min=45):
    """Regroupe des photos datees en « moments » : une serie de prises de vue
    sans trou de plus de `ecart_min` minutes. Sans Timeline, c'est la seule
    structure mesurable d'une journee — ou on a sorti l'appareil, et quand.
    Rien d'autre n'est deduit : ni lieu, ni activite."""
    datees = sorted((p for p in photos if p.get("prise_de_vue")), key=lambda p: p["prise_de_vue"])
    moments, courant = [], []
    for p in datees:
        dt = datetime.fromisoformat(p["prise_de_vue"])
        if courant and (dt - datetime.fromisoformat(courant[-1]["prise_de_vue"])).total_seconds() > ecart_min * 60:
            moments.append(courant)
            courant = []
        courant.append(p)
    if courant:
        moments.append(courant)
    return moments


def ecrire_markdown(voyage, chemin: Path):
    L = []
    r = voyage["resume"]
    L.append(f"# Reconstitution : {voyage['slug']}")
    L.append("")
    L.append(f"_{r['jours']} jour(s), du {r['premier_jour']} au {r['dernier_jour']} — "
             f"{r['lieux']} lieu(x), {r['distance_km_total']} km, {r['photos']} photo(s). "
             f"Source : {voyage['source']['format']}, lieux : {voyage['source']['lieux']}._")
    L.append("")
    L.append("> Tout ce qui est chiffre ici vient de la Timeline et des photos. Les balises "
             "[A TOI] sont a toi : ressenti, odeurs, prix, ce qu'on a moins aime. "
             "Un lieu « a nommer » n'a pas de nom dans l'export — ne pas en inventer un, "
             "l'ecrire de memoire ou relancer avec --geocode.")
    L.append("")
    for n, j in enumerate(voyage["jours"], 1):
        d = datetime.fromisoformat(j["date"])
        L.append(f"## Jour {n} — {d.day} {MOIS_FR[d.month - 1]} {d.year}")
        faits = []
        if j["distance_km"] is not None:
            faits.append(f"{j['distance_km']} km")
        if j["marche_km"]:
            faits.append(f"dont {j['marche_km']} km a pied")
        nb_photos = sum(len(l["photos"]) for l in j["lieux"]) + len(j["photos_sans_lieu"])
        faits.append(f"{nb_photos} photo(s)")
        L.append(f"_{' · '.join(faits)}_")
        L.append("")
        if not j["lieux"]:
            L.append("- (aucun arret detecte ce jour-la)")
        for l in j["lieux"]:
            duree = f"{l['duree_min'] // 60} h {l['duree_min'] % 60:02d}" if l["duree_min"] >= 60 else f"{l['duree_min']} min"
            L.append(f"- **{heure(l['arrivee'])} → {heure(l['depart'])}** ({duree}) — {etiquette_lieu(l)}")
            if l["adresse"]:
                L.append(f"  - adresse : {l['adresse']}")
            for ph in l["photos"]:
                L.append(f"  - photo `{ph['fichier']}` ({heure(ph['prise_de_vue'])}, {ph['rattachement']})")
            L.append("  - [A TOI : ce qu'on a vu, entendu, goute ici — et ce qu'on a moins aime]")
        if j["trajets"]:
            L.append("")
            L.append("Trajets : " + " · ".join(
                f"{heure(t['debut'])} {t['mode']} {t['distance_km']} km ({t['duree_min']} min)" for t in j["trajets"]
            ))
        if j["photos_sans_lieu"]:
            L.append("")
            moments = moments_photos(j["photos_sans_lieu"])
            if not j["lieux"] and moments:
                # Journee sans Timeline : les moments de prise de vue sont la
                # seule trame. Un [A TOI] par moment, jamais un lieu invente.
                L.append("Moments (series de photos, sans lieu connu) :")
                for m in moments:
                    h1, h2 = heure(m[0]["prise_de_vue"]), heure(m[-1]["prise_de_vue"])
                    plage = h1 if h1 == h2 else f"{h1} -> {h2}"
                    apercu = ", ".join(f"`{p['fichier']}`" for p in m[:3]) + (f" … (+{len(m) - 3})" if len(m) > 3 else "")
                    L.append(f"- {plage} — {len(m)} photo(s) : {apercu}")
                    L.append("  - [A TOI : ou etait-on, qu'est-ce qu'on faisait, ce qu'on a moins aime]")
                sans_date = [p for p in j["photos_sans_lieu"] if not p.get("prise_de_vue")]
                if sans_date:
                    L.append("- sans heure : " + ", ".join(f"`{p['fichier']}`" for p in sans_date))
            else:
                L.append("Photos du jour sans lieu rattache : " + ", ".join(f"`{p['fichier']}` ({p['raison']})" for p in j["photos_sans_lieu"]))
        L.append("")
    if voyage["resume"]["photos_sans_date"]:
        L.append("## Photos sans date EXIF (non placees)")
        L.append(", ".join(f"`{f}`" for f in voyage["resume"]["photos_sans_date"]))
        L.append("")
    chemin.write_text("\n".join(L), encoding="utf-8")


def main():
    p = argparse.ArgumentParser(description="Reconstituer un voyage depuis la Timeline et les photos")
    p.add_argument("--timeline", help="Timeline.json (telephone), Records.json ou fichier Semantic Location History. "
                   "Facultatif si des photos sont fournies : le squelette se fait alors par jour, sans lieux.")
    p.add_argument("--photos", help="Dossier de photos (EXIF)")
    p.add_argument("--photos-cms", metavar="DESTINATION",
                   help="Photos deja importees dans la mediatheque du panneau pour cette destination (ex. madere), ou « toutes »")
    p.add_argument("--slug", required=True, help="Nom du voyage, ex. madere-2024")
    p.add_argument("--from", dest="date_min", help="Premier jour (AAAA-MM-JJ)")
    p.add_argument("--to", dest="date_max", help="Dernier jour (AAAA-MM-JJ)")
    p.add_argument("--geocode", action="store_true", help="Nommer les lieux via OpenStreetMap (reseau, 1 req/s)")
    p.add_argument("--out", help="Dossier de sortie (defaut : imports/<slug>/)")
    args = p.parse_args()

    if not args.timeline and not (args.photos or args.photos_cms):
        print("[ERREUR] Donne une Timeline (--timeline) ou des photos (--photos / --photos-cms), sinon il n'y a rien a reconstituer.")
        sys.exit(1)

    visites, trajets, positions, fmt = [], [], [], "aucune"
    if args.timeline:
        chemin_timeline = Path(args.timeline)
        if not chemin_timeline.exists():
            print(f"[ERREUR] Fichier introuvable : {chemin_timeline}")
            sys.exit(1)
        try:
            visites, trajets, positions, fmt = lire_timeline(chemin_timeline)
        except (ValueError, json.JSONDecodeError) as e:
            print(f"[ERREUR] {e}")
            sys.exit(1)
        print(f"[INFO] Timeline lue ({fmt}) : {len(visites)} visite(s), {len(trajets)} trajet(s), {len(positions)} position(s)")
    else:
        # Sans Timeline, le squelette n'a que des jours et des photos : aucun
        # lieu, aucune distance. Les lieux viendront de l'export du telephone.
        print("[INFO] Pas de Timeline : squelette par jour depuis les photos seulement, sans lieux ni trajets.")

    photos = []
    if args.photos:
        dossier = Path(args.photos)
        if not dossier.exists():
            print(f"[ERREUR] Dossier de photos introuvable : {dossier}")
            sys.exit(1)
        photos = lire_photos(dossier)
        aligner_fuseau_photos(photos, visites)
        print(f"[INFO] {len(photos)} photo(s) lue(s), {sum(1 for x in photos if x['gps'])} avec GPS, "
              f"{sum(1 for x in photos if x['prise_dt'])} avec date")
    if args.photos_cms:
        try:
            cms = lire_photos_cms(args.photos_cms)
        except (ValueError, OSError) as e:
            print(f"[ERREUR] Mediatheque illisible : {e}")
            sys.exit(1)
        photos.extend(cms)
        print(f"[INFO] {len(cms)} photo(s) de la mediatheque pour « {args.photos_cms} », "
              f"{sum(1 for x in cms if x['gps'])} avec GPS, {sum(1 for x in cms if x['prise_dt'])} avec date")

    # Fenetre par defaut : les jours ou il y a des photos, sinon tout l'export.
    date_min, date_max = args.date_min, args.date_max
    if date_min is None and date_max is None and photos:
        dates = sorted(jour_local(x["prise_dt"]) for x in photos if x["prise_dt"])
        if dates:
            date_min, date_max = dates[0], dates[-1]
            print(f"[INFO] Fenetre deduite des photos : {date_min} -> {date_max}")

    jours, source_lieux, photos_sans_date, nb_photos = reconstituer(visites, trajets, positions, photos, date_min, date_max)
    if not jours:
        print("[ERREUR] Rien dans la fenetre demandee - verifier --from/--to ou les dates des photos.")
        sys.exit(1)

    # Nommage (apres le filtrage : on ne geocode que ce qui sert).
    toutes_visites = [l for j in jours for l in j["lieux"]]
    if args.geocode:
        cache = {}
        for l in toutes_visites:
            if not l["nom"]:
                nom = nom_lieu_osm(l["lat"], l["lon"], cache)
                if nom:
                    l["nom"], l["nom_source"] = nom, "openstreetmap"
    for l in toutes_visites:
        if l["nom"] and not l.get("nom_source"):
            l["nom_source"] = "timeline"

    distance_totale = round(sum(j["distance_km"] or 0 for j in jours), 1)
    voyage = {
        "slug": args.slug,
        "genere_le": datetime.now().isoformat(timespec="seconds"),
        "source": {"fichier": str(args.timeline) if args.timeline else None, "format": fmt, "lieux": source_lieux,
                   "photos": str(args.photos) if args.photos else None},
        "avertissement": (
            "Faits mesures par la Timeline du telephone et l'EXIF des photos. Aucun nom de lieu "
            "n'est invente : sans nom dans l'export ni --geocode, un lieu reste « a nommer ». "
            "Ressenti, prix, horaires d'ouverture, anecdotes : a l'auteur."
        ),
        "resume": {
            "jours": len(jours),
            "premier_jour": jours[0]["date"],
            "dernier_jour": jours[-1]["date"],
            "lieux": len(toutes_visites),
            "lieux_nommes": sum(1 for l in toutes_visites if l["nom"]),
            "distance_km_total": distance_totale,
            "photos": nb_photos,
            "photos_placees": sum(len(l["photos"]) for l in toutes_visites),
            "photos_sans_date": photos_sans_date,
        },
        "jours": jours,
    }

    out_dir = Path(args.out) if args.out else BASE_DIR.parent / "imports" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "voyage.json").write_text(json.dumps(voyage, ensure_ascii=False, indent=2), encoding="utf-8")
    ecrire_markdown(voyage, out_dir / "voyage.md")

    r = voyage["resume"]
    print(f"\n[OK] {r['jours']} jour(s) du {r['premier_jour']} au {r['dernier_jour']}, "
          f"{r['lieux']} lieu(x) dont {r['lieux_nommes']} nomme(s), {r['distance_km_total']} km, "
          f"{r['photos_placees']}/{r['photos']} photo(s) placee(s)")
    print(f"     {out_dir / 'voyage.json'}")
    print(f"     {out_dir / 'voyage.md'}  <- a relire, balises [A TOI]")
    if r["lieux"] and not r["lieux_nommes"] and not args.geocode:
        print("     Aucun lieu nomme dans l'export : relancer avec --geocode pour interroger OpenStreetMap.")


if __name__ == "__main__":
    main()
