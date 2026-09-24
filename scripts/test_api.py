import json
import requests
from pathlib import Path

with open("scripts/token.json") as f:
    token_data = json.load(f)

token = token_data["token"]
headers = {"Authorization": f"Bearer {token}"}

print("Testing /v1/mediaItems...")
r = requests.get("https://photoslibrary.googleapis.com/v1/mediaItems", headers=headers, params={"pageSize": 10})
print("mediaItems status:", r.status_code)
print(r.text[:500])

print("\nTesting /v1/sharedAlbums...")
r2 = requests.get("https://photoslibrary.googleapis.com/v1/sharedAlbums", headers=headers)
print("sharedAlbums status:", r2.status_code)
print(r2.text[:500])
