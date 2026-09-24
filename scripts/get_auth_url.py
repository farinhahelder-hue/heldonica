import sys
import json
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly']
CREDENTIALS_FILE = Path("scripts/credentials.json")

if not CREDENTIALS_FILE.exists():
    print("Fichier scripts/credentials.json introuvable")
    sys.exit(1)

flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES, redirect_uri="http://localhost:8088/")
auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')

print("URL_AUTH_START")
print(auth_url)
print("URL_AUTH_END")
