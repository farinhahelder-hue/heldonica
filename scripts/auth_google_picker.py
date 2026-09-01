"""
Consentement OAuth pour l'API Google Photos Picker (scope photospicker.mediaitems.readonly).
A lancer une seule fois : ouvre le navigateur, capture le code, enregistre le token
dans scripts/token_picker.json. Reprend scripts/credentials.json (meme client OAuth
que l'ancien pipeline photoslibrary, il suffit d'ajouter le scope Picker dans le
consentement).
"""
import json
import sys
import os
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
from pathlib import Path

CREDENTIALS_FILE = Path("scripts/credentials.json")
TOKEN_FILE = Path("scripts/token_picker.json")

if not CREDENTIALS_FILE.exists():
    print("[ERREUR] credentials.json introuvable")
    sys.exit(1)

with open(CREDENTIALS_FILE, 'r', encoding='utf-8') as f:
    client_info = json.load(f)

installed = client_info.get("installed") or client_info.get("web")
client_id = installed["client_id"]
client_secret = installed["client_secret"]
redirect_uri = "http://localhost:8089/"
scope = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly"

auth_code = None


class OAuthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f0fdf4;">
                <h1 style="color: #16a34a;">Connexion Google Photos Picker reussie !</h1>
                <p>Tu peux fermer cet onglet et revenir dans la console.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode("utf-8"))
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Code manquant")

    def log_message(self, format, *args):
        pass


auth_url = (
    f"https://accounts.google.com/o/oauth2/auth?"
    f"response_type=code&"
    f"client_id={urllib.parse.quote(client_id)}&"
    f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
    f"scope={urllib.parse.quote(scope)}&"
    f"access_type=offline&"
    f"prompt=consent"
)

print("\n" + "=" * 60)
print("  Consentement Google Photos Picker - Heldonica")
print("=" * 60)
print(f"\nOuverture de l'URL dans le navigateur...\n{auth_url}\n")

os.system(f'start "" "{auth_url}"')

server = HTTPServer(("localhost", 8089), OAuthHandler)
print("[EN ATTENTE] Clique sur \"Autoriser\" dans le navigateur qui vient de s'ouvrir...")

while auth_code is None:
    server.handle_request()

print("\n[INFO] Code recu ! Echange contre le token d'acces...")
token_url = "https://oauth2.googleapis.com/token"
token_payload = {
    "code": auth_code,
    "client_id": client_id,
    "client_secret": client_secret,
    "redirect_uri": redirect_uri,
    "grant_type": "authorization_code",
}

resp = requests.post(token_url, data=token_payload)
if resp.status_code == 200:
    token_data = resp.json()
    token_data["client_id"] = client_id
    token_data["client_secret"] = client_secret
    token_data["scopes"] = [scope]

    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        json.dump(token_data, f, indent=2)
    print(f"[OK] Token Picker enregistre dans {TOKEN_FILE}")
else:
    print(f"[ERREUR] Echec lors de l'echange du token : {resp.status_code} - {resp.text}")
    sys.exit(1)
