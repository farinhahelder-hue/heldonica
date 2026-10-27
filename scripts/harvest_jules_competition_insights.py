import os
import sys
import json
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

# 1. Recuperation de la cle API Jules
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
    print("❌ Erreur : JULES_API_KEY introuvable.")
    sys.exit(1)

sessions_file = r"C:\Users\Work\heldonica-clean\scripts\jules_competition_sessions.json"
if not os.path.exists(sessions_file):
    print("Fichier jules_competition_sessions.json non trouve.")
    sys.exit(1)

with open(sessions_file, "r", encoding="utf-8") as f:
    sessions = json.load(f)

print(f"🔍 Récupération des informations et activités pour {len(sessions)} sessions Jules...")

insights = []

for s in sessions:
    sid = s["sid"]
    print(f"\n--- Récupération Session {sid} ({s['id']}: {s['title'][:40]}...) ---")
    
    # 1. État de la session
    req_sess = urllib.request.Request(
        f"https://jules.googleapis.com/v1alpha/sessions/{sid}",
        headers={"X-Goog-Api-Key": token}
    )
    sess_data = {}
    try:
        with urllib.request.urlopen(req_sess, timeout=15) as resp:
            sess_data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  Erreur get session {sid}: {e}")
    
    state = sess_data.get("state", "UNKNOWN")
    print(f"  Statut : {state}")
    
    # 2. Activités de la session
    req_act = urllib.request.Request(
        f"https://jules.googleapis.com/v1alpha/sessions/{sid}/activities",
        headers={"X-Goog-Api-Key": token}
    )
    activities = []
    try:
        with urllib.request.urlopen(req_act, timeout=15) as resp_act:
            act_json = json.loads(resp_act.read().decode("utf-8"))
            activities = act_json.get("activities", [])
    except Exception as e:
        print(f"  Erreur get activities {sid}: {e}")
    
    print(f"  Nombre d'activités enregistrées : {len(activities)}")
    
    # Extraction des messages de Jules
    agent_replies = []
    for a in activities:
        origin = a.get("originator", "")
        # Analyse des clés pour trouver les messages générés
        for k in a.keys():
            if k in ["agentMessage", "message", "reply", "thought", "executionResult"]:
                agent_replies.append({
                    "originator": origin,
                    "type": k,
                    "content": a[k]
                })
    
    insights.append({
        "id": s["id"],
        "sid": sid,
        "title": s["title"],
        "url": s["url"],
        "prompt": s["prompt"],
        "state": state,
        "activities_count": len(activities),
        "activities": activities[:5],
        "replies": agent_replies
    })

# Sauvegarde des données collectées
output_insights = r"C:\Users\Work\heldonica-clean\scripts\jules_competition_harvested.json"
with open(output_insights, "w", encoding="utf-8") as f:
    json.dump(insights, f, indent=2, ensure_ascii=False)

print(f"\n✅ Récolte terminée ! Résultats enregistrés dans {output_insights}")
