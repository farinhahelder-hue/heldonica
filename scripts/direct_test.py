import json
import requests

with open("scripts/token.json") as f:
    token_data = json.load(f)

token = token_data["token"]
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("Testing https://photoslibrary.googleapis.com/v1/albums...")
r = requests.get("https://photoslibrary.googleapis.com/v1/albums", headers=headers)
print("status:", r.status_code)
print("body:", r.text)

print("\nTesting search...")
r2 = requests.post("https://photoslibrary.googleapis.com/v1/mediaItems:search", headers=headers, json={"pageSize": 10})
print("search status:", r2.status_code)
print("search body:", r2.text)
