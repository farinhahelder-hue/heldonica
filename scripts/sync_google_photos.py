"""
Script de synchronisation Google Photos / Vidéos pour Heldonica
Télécharge automatiquement les photos et vidéos d'un album Google Photos vers public/images/destinations/roumanie
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Fix Windows console encoding
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    import requests
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print("[INFO] Installation des dépendances requises...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-auth-oauthlib", "google-auth-httplib2", "requests"])
    import requests
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/photoslibrary']

BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"
DEFAULT_DEST_DIR = BASE_DIR.parent / "public" / "images" / "destinations" / "roumanie"


def get_credentials():
    creds = None
    if TOKEN_FILE.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
        except Exception as e:
            print(f"[WARN] Token invalide : {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                print("[INFO] Rafraîchissement du token...")
                creds.refresh(Request())
            except Exception as e:
                print(f"[WARN] Session expirée : {e}")
                creds = None

        if not creds:
            if not CREDENTIALS_FILE.exists():
                print("\n[ERREUR] Fichier credentials.json manquant dans : " + str(CREDENTIALS_FILE))
                sys.exit(1)

            print("\n[INFO] Lancement de la connexion Google...")
            print("[INFO] Votre navigateur va s'ouvrir pour vous connecter à Google Photos.")
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=8088, prompt='consent')

        with open(TOKEN_FILE, 'w', encoding='utf-8') as token:
            token.write(creds.to_json())
        print(f"[OK] Connexion réussie ! Token enregistré.")

    return creds


def list_albums(creds):
    url = "https://photoslibrary.googleapis.com/v1/albums"
    headers = {"Authorization": f"Bearer {creds.token}"}
    albums = []
    page_token = None
    
    while True:
        params = {"pageSize": 50}
        if page_token:
            params["pageToken"] = page_token
            
        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            print(f"[ERREUR] Impossible de lister les albums : {resp.status_code} - {resp.text}")
            return []
            
        data = resp.json()
        albums.extend(data.get("albums", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
            
    return albums


def ensure_valid_token(creds):
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            with open(TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())
        except Exception as e:
            print(f"[WARN] Refresh token error: {e}")
    return creds


def get_album_media(creds, album_id):
    creds = ensure_valid_token(creds)
    url = "https://photoslibrary.googleapis.com/v1/mediaItems:search"
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json"
    }
    media_items = []
    page_token = None
    
    while True:
        body = {"albumId": album_id, "pageSize": 100}
        if page_token:
            body["pageToken"] = page_token
            
        resp = requests.post(url, headers=headers, json=body)
        if resp.status_code != 200:
            print(f"[ERREUR] {resp.status_code} - {resp.text}")
            break
            
        data = resp.json()
        media_items.extend(data.get("mediaItems", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
            
    return media_items


def download_media_items(items, dest_dir: Path):
    dest_dir.mkdir(parents=True, exist_ok=True)
    total = len(items)
    print(f"\n[INFO] Téléchargement de {total} média(s) (photos & vidéos) vers : {dest_dir}")
    
    downloaded = 0
    skipped = 0
    
    for idx, item in enumerate(items, 1):
        filename = item.get("filename", f"media_{item.get('id', idx)}")
        file_path = dest_dir / filename
        mime_type = item.get("mimeType", "")
        is_video = mime_type.startswith("video/") or filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv"))
        
        if file_path.exists():
            print(f"  [{idx}/{total}] Déjà présent : {filename}")
            skipped += 1
            continue
            
        base_url = item.get("baseUrl")
        if not base_url:
            continue
            
        download_url = f"{base_url}=dv" if is_video else f"{base_url}=d"
        media_label = "Vidéo" if is_video else "Photo"
        
        try:
            print(f"  [{idx}/{total}] Téléchargement {media_label} : {filename} ...")
            r = requests.get(download_url, stream=True, timeout=120)
            if r.status_code == 200:
                with open(file_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=65536):
                        f.write(chunk)
                print(f"  [{idx}/{total}] OK : {filename}")
                downloaded += 1
            else:
                print(f"  [{idx}/{total}] Erreur HTTP ({r.status_code}) : {filename}")
        except Exception as e:
            print(f"  [{idx}/{total}] Erreur : {filename} ({e})")
            
    print(f"\n[TERMINÉ] {downloaded} fichier(s) téléchargé(s), {skipped} déjà présents.")


def main():
    parser = argparse.ArgumentParser(description="Synchronisation Google Photos Roumanie pour Heldonica")
    parser.add_argument("--list", action="store_true", help="Lister tous les albums Google Photos")
    parser.add_argument("--album", type=str, help="Nom ou ID de l'album")
    parser.add_argument("--dest", type=str, default=str(DEFAULT_DEST_DIR), help="Dossier de destination")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("  Heldonica - Import Médias Roumanie (Google Photos)")
    print("=" * 60)
    
    creds = get_credentials()
    albums = list_albums(creds)
    
    if not albums:
        print("Aucun album trouvé sur votre compte Google Photos.")
        return

    print(f"\nAlbums trouvés ({len(albums)}) :")
    for a in albums:
        title = a.get("title", "(Sans titre)")
        count = a.get("mediaItemsCount", "0")
        print(f" - \"{title}\" ({count} éléments) | ID: {a.get('id')}")
        
    if not args.album:
        # Recherche auto d'un album Roumanie
        keywords = ["roumanie", "romania", "transylvanie", "maramures", "brasov", "cluj", "bucarest", "bucharest"]
        matching = [a for a in albums if any(k in a.get("title", "").lower() for k in keywords)]
        if matching:
            chosen = matching[0]
            print(f"\n[DÉTECTION AUTOMATIQUE] Album Roumanie sélectionné : \"{chosen.get('title')}\"")
            items = get_album_media(creds, chosen.get("id"))
            download_media_items(items, Path(args.dest))
            return
        else:
            print(f"\nPrécisez l'album à télécharger avec : python scripts/sync_google_photos.py --album \"NomDeLAlbum\"")
            return

    target = None
    for a in albums:
        if a.get("id") == args.album or a.get("title", "").strip().lower() == args.album.strip().lower():
            target = a
            break
            
    if not target:
        print(f"\n[ERREUR] Album \"{args.album}\" introuvable.")
        return
        
    print(f"\n[OK] Album : \"{target.get('title')}\"")
    items = get_album_media(creds, target.get("id"))
    download_media_items(items, Path(args.dest))


if __name__ == "__main__":
    main()
