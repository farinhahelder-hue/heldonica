import urllib.request
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

token = None
with open(".env.local", "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("JULES_API_KEY="):
            token = line.strip().split("=", 1)[1].strip("\"'")
            break

with open("scripts/jules_competition_sessions.json", "r", encoding="utf-8") as f:
    sessions = json.load(f)

extracted_files = {}

for s in sessions:
    sid = s["sid"]
    req_act = urllib.request.Request(f"https://jules.googleapis.com/v1alpha/sessions/{sid}/activities", headers={"X-Goog-Api-Key": token})
    try:
        with urllib.request.urlopen(req_act, timeout=15) as resp:
            act_json = json.loads(resp.read().decode("utf-8"))
            activities = act_json.get("activities", [])
            for a in activities:
                # 1. Vérifier agentMessage
                if "agentMessaged" in a and "agentMessage" in a["agentMessaged"]:
                    msg = a["agentMessaged"]["agentMessage"]
                    extracted_files[f"{s['id']}_message.md"] = {
                        "id": s["id"],
                        "title": s["title"],
                        "content": msg
                    }
                # 2. Vérifier artifacts / gitPatch
                if "artifacts" in a:
                    for art in a["artifacts"]:
                        patch = art.get("changeSet", {}).get("gitPatch", {}).get("unidiffPatch", "")
                        if patch:
                            extracted_files[f"{s['id']}_patch.diff"] = {
                                "id": s["id"],
                                "title": s["title"],
                                "content": patch
                            }
    except Exception as e:
        print(f"Erreur session {sid}: {e}")

print(f"Total fichiers/analyses extraits : {len(extracted_files)}")
for k, v in extracted_files.items():
    print(f" - {k} : {v['title']} (taille: {len(v['content'])} car.)")

with open("scripts/jules_harvested_artifacts.json", "w", encoding="utf-8") as f:
    json.dump(extracted_files, f, indent=2, ensure_ascii=False)

print("Enregistré dans scripts/jules_harvested_artifacts.json")
