import json
import requests

with open("scripts/token.json") as f:
    token_data = json.load(f)

token = token_data["token"]
headers = {"Authorization": f"Bearer {token}"}

# Test Google Drive API
print("Testing Google Drive API...")
r_drive = requests.get("https://www.googleapis.com/drive/v3/files", headers=headers, params={"pageSize": 5})
print("Drive status:", r_drive.status_code)
print(r_drive.text[:300])

# Test User Info / Profile
print("\nTesting User Info...")
r_user = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers)
print("UserInfo status:", r_user.status_code)
print(r_user.text[:300])
