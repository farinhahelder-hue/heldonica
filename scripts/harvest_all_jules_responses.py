import os
import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

token = None
for p in [r"C:\Users\Work\heldonica-clean\.env.local", r"C:\Users\Work\heldonica-brain\.env"]:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("JULES_API_KEY="):
                    token = line.strip().split("=", 1)[1].strip("\"'")
                    break
        if token:
            break

if not token:
    print("Token non trouvé")
    sys.exit(1)

sessions_file = r"C:\Users\Work\heldonica-clean\scripts\jules_competition_sessions.json"
with open(sessions_file, "r", encoding="utf-8") as f:
    sessions = json.load(f)

print(f"📊 Collecte des réponses Jules pour {len(sessions)} sessions...")
results = {}

for s in sessions:
    sid = s["sid"]
    req = urllib.request.Request(
        f"https://jules.googleapis.com/v1alpha/sessions/{sid}/activities",
        headers={"X-Goog-Api-Key": token}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            acts = data.get("activities", [])
            messages = []
            for a in acts:
                if "agentMessaged" in a and "agentMessage" in a["agentMessaged"]:
                    messages.append(a["agentMessaged"]["agentMessage"])
            if messages:
                print(f"✓ [{s['id']}] {len(messages)} message(s) récolté(s) ({s['title'][:45]}...)")
                results[s['id']] = {
                    "id": s["id"],
                    "title": s["title"],
                    "url": s["url"],
                    "messages": messages
                }
            else:
                print(f"⏳ [{s['id']}] En cours de réflexion/rédaction...")
    except Exception as e:
        print(f"✗ [{s['id']}] Erreur: {e}")

output_path = r"C:\Users\Work\heldonica-clean\scripts\jules_responses_compiled.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n🎉 Total des sessions avec réponses récoltées : {len(results)}/{len(sessions)}")
print(f"Enregistré dans {output_path}")
