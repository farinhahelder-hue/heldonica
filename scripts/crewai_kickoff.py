"""
scripts/crewai_kickoff.py — Déclenchement d'une équipe multi-agents CrewAI Studio depuis le terminal

Se connecte au projet CrewAI Studio :
https://app.crewai.com/studio/v2/projects/69bb8b74-8ff6-4b55-9f3b-53d235824614/editor

Usage :
  python scripts/crewai_kickoff.py --destination madere --topic "Roadtrip slow travel"
"""

import os
import sys
import json
import urllib.request
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def load_env():
    env = {}
    for filename in [".env.local", ".env"]:
        p = BASE_DIR / filename
        if p.exists():
            for line in p.read_text(encoding="utf-8").splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

ENV = load_env()

def kickoff_crewai(destination: str, topic: str, notes: str):
    api_key = ENV.get("CREWAI_API_KEY") or ENV.get("CREW_AI_TOKEN")
    project_id = ENV.get("CREWAI_PROJECT_ID") or "69bb8b74-8ff6-4b55-9f3b-53d235824614"

    if not api_key:
        print("\n[ATTENTION] CREWAI_API_KEY absente dans .env.local")
        print("Pour connecter ton projet CrewAI Studio à Heldonica :")
        print(" 1. Copie ta clé d'API / Bearer Token depuis https://app.crewai.com")
        print(" 2. Colle-la dans .env.local sous CREWAI_API_KEY='ta_cle'")
        return

    url = f"https://api.crewai.com/v1/projects/{project_id}/kickoff"
    payload = {
        "inputs": {
            "destination": destination,
            "topic": topic,
            "notes": notes,
            "brand_voice": "Heldonica Slow Travel — voix duo, pas de mots bannis"
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )

    try:
        print(f"[INFO] Lancement de l'équipe multi-agents CrewAI pour {destination}...")
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"✅ [SUCCÈS] Crew Run ID: {data.get('id') or data.get('kickoff_id')}")
            print(f"   Statut: {data.get('status')}")
            if data.get("result"):
                print("\n[RÉSULTAT DES AGENTS] :")
                print(data.get("result"))
    except Exception as e:
        print(f"❌ [ERREUR] Échec de l'appel CrewAI ({e})")

def main():
    parser = argparse.ArgumentParser(description="Déclenchement CrewAI Studio pour Heldonica")
    parser.add_argument("--destination", required=True, help="Nom de la destination (ex: madere)")
    parser.add_argument("--topic", default="Carnet Slow Travel", help="Sujet du carnet")
    parser.add_argument("--notes", default="", help="Notes du terrain")
    args = parser.parse_args()

    kickoff_crewai(args.destination, args.topic, args.notes)

if __name__ == "__main__":
    main()
