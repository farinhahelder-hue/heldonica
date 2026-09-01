"""
Google Photos Picker API - remplace l'ancienne Library API (mediaItems.list /
albums.list restreints par Google depuis mars 2025 pour la plupart des apps).
L'utilisateur choisit ses photos/videos dans l'interface Google (pickerUri),
ce script recupere ensuite uniquement les items selectionnes.

Prealable : lancer scripts/auth_google_picker.py une fois pour creer
scripts/token_picker.json.
"""
import sys
import time
import json
import argparse
from pathlib import Path

try:
    import requests
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-auth", "requests"])
    import requests
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/photospicker.mediaitems.readonly']
BASE_DIR = Path(__file__).resolve().parent
TOKEN_FILE = BASE_DIR / "token_picker.json"
DEFAULT_DEST_DIR = BASE_DIR.parent / "public" / "images" / "destinations" / "roumanie"

API_ROOT = "https://photospicker.googleapis.com/v1"


def get_credentials():
    if not TOKEN_FILE.exists():
        print(f"[ERREUR] {TOKEN_FILE} introuvable. Lance d'abord : python scripts/auth_google_picker.py")
        sys.exit(1)

    creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
                f.write(creds.to_json())
        else:
            print("[ERREUR] Token invalide et non rafraichissable. Relance auth_google_picker.py")
            sys.exit(1)
    return creds


def create_session(creds):
    r = requests.post(f"{API_ROOT}/sessions", headers={"Authorization": f"Bearer {creds.token}"})
    if r.status_code != 200:
        print(f"[ERREUR] create_session {r.status_code}\n{r.text}")
        sys.exit(1)
    return r.json()


def rafraichir(creds):
    """Renouvelle le jeton d'acces (duree de vie ~1h). L'attente de la selection
    peut durer plusieurs heures : sans ce rafraichissement en cours de route,
    l'API repond 401 et tout le suivi s'arrete."""
    try:
        creds.refresh(Request())
        with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
            f.write(creds.to_json())
        print("  [AUTH] jeton renouvele")
        return True
    except Exception as e:
        print(f"  [AUTH] renouvellement impossible : {e}")
        return False


def get_session(creds, session_id, tolerer_reseau=False):
    """Interroge la session. Avec tolerer_reseau, une coupure ou un jeton expire
    renvoie None au lieu de tuer le processus : ni un incident DNS ni la fin de
    validite du jeton ne doivent interrompre une attente de plusieurs heures."""
    try:
        r = requests.get(f"{API_ROOT}/sessions/{session_id}",
                         headers={"Authorization": f"Bearer {creds.token}"},
                         timeout=30)
    except requests.exceptions.RequestException as e:
        if tolerer_reseau:
            print(f"  [RESEAU] injoignable, nouvelle tentative ({type(e).__name__})")
            return None
        print(f"[ERREUR] reseau : {e}")
        sys.exit(1)

    if r.status_code == 401 and tolerer_reseau:
        return get_session(creds, session_id, False) if rafraichir(creds) else None

    if r.status_code != 200:
        if tolerer_reseau and r.status_code >= 500:
            print(f"  [SERVEUR] {r.status_code}, nouvelle tentative")
            return None
        print(f"[ERREUR] get_session {r.status_code}\n{r.text}")
        sys.exit(1)
    return r.json()


def list_picked_media(creds, session_id):
    items = []
    page_token = None
    while True:
        params = {"sessionId": session_id, "pageSize": 100}
        if page_token:
            params["pageToken"] = page_token
        r = requests.get(f"{API_ROOT}/mediaItems", headers={"Authorization": f"Bearer {creds.token}"}, params=params)
        if r.status_code != 200:
            print(f"[ERREUR] list mediaItems {r.status_code}\n{r.text}")
            break
        data = r.json()
        items.extend(data.get("mediaItems", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return items


def download_items(creds, items, dest_dir: Path):
    dest_dir.mkdir(parents=True, exist_ok=True)
    total = len(items)
    downloaded = 0
    for idx, item in enumerate(items, 1):
        media_file = item.get("mediaFile", {})
        filename = media_file.get("filename") or f"media_{item.get('id', idx)}"
        base_url = media_file.get("baseUrl")
        mime_type = media_file.get("mimeType", "")
        is_video = mime_type.startswith("video/")

        if not base_url:
            print(f"  [{idx}/{total}] Pas de baseUrl pour {filename}")
            continue

        file_path = dest_dir / filename
        if file_path.exists():
            print(f"  [{idx}/{total}] Deja present : {filename}")
            continue

        url = f"{base_url}=dv" if is_video else f"{base_url}=d"
        try:
            resp = requests.get(url, headers={"Authorization": f"Bearer {creds.token}"}, stream=True, timeout=120)
            if resp.status_code == 200:
                with open(file_path, "wb") as f:
                    for chunk in resp.iter_content(chunk_size=65536):
                        f.write(chunk)
                print(f"  [{idx}/{total}] OK : {filename}")
                downloaded += 1
            else:
                print(f"  [{idx}/{total}] Erreur HTTP {resp.status_code} : {filename}")
        except Exception as e:
            print(f"  [{idx}/{total}] Erreur : {filename} ({e})")

    print(f"\n[TERMINE] {downloaded}/{total} fichier(s) telecharge(s) dans {dest_dir}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dest", default=str(DEFAULT_DEST_DIR))
    parser.add_argument("--session-id", help="Reprendre une session existante au lieu d'en creer une nouvelle")
    parser.add_argument("--max-wait", type=int, default=900, help="Attente max en secondes (defaut 15 min)")
    args = parser.parse_args()

    creds = get_credentials()

    if args.session_id:
        session = get_session(creds, args.session_id)
    else:
        session = create_session(creds)
        print(f"\n[SESSION] id={session.get('id')}")
        print("[ACTION REQUISE] Ouvre ce lien et selectionne tes photos/videos Roumanie :\n")
        print(f"  {session.get('pickerUri')}\n")

    session_id = session["id"]

    poll_interval = 3
    poll_cfg = session.get("pollingConfig", {})
    raw_interval = poll_cfg.get("pollInterval")
    if raw_interval:
        try:
            poll_interval = max(1, int(str(raw_interval).rstrip("s")))
        except ValueError:
            pass

    print("[ATTENTE] En attente de la selection dans Google Photos...")
    waited = 0
    while not session.get("mediaItemsSet"):
        time.sleep(poll_interval)
        waited += poll_interval
        # None = incident reseau passager : on garde l'etat precedent et on
        # retentera au tour suivant plutot que d'abandonner l'attente.
        rafraichi = get_session(creds, session_id, tolerer_reseau=True)
        if rafraichi is not None:
            session = rafraichi
        if waited >= args.max_wait:
            print(f"[TIMEOUT] Pas de selection apres {args.max_wait}s.")
            print(f"Relance plus tard avec : python scripts/photos_picker.py --session-id {session_id}")
            sys.exit(1)

    print("[OK] Selection detectee, recuperation des medias...")
    # L'attente a pu durer des heures : on repart d'un jeton frais avant la
    # phase de telechargement, qui peut elle-meme etre longue.
    rafraichir(creds)
    items = list_picked_media(creds, session_id)
    print(f"[INFO] {len(items)} media(s) selectionne(s)")
    download_items(creds, items, Path(args.dest))


if __name__ == "__main__":
    main()
