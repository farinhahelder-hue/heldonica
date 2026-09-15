import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ENV_FILE = Path(".env.local") if Path(".env.local").exists() else Path(".env")

def get_env():
    env = {}
    if ENV_FILE.exists():
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

ENV = get_env()
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY") or ENV.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GROQ_API_KEY = ENV.get("GROQ_API_KEY")
GEMINI_API_KEY = ENV.get("GEMINI_API_KEY")
OPENAI_API_KEY = ENV.get("OPENAI_API_KEY")


def call_ai(prompt: str) -> str:
    # 1. Groq (Ultra rapide)
    if GROQ_API_KEY:
        try:
            r = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                },
                timeout=30
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except Exception:
            pass

    # 2. Gemini
    if GEMINI_API_KEY:
        try:
            r = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=30
            )
            if r.status_code == 200:
                return r.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass

    # 3. OpenAI
    if OPENAI_API_KEY:
        try:
            r = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                },
                timeout=30
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except Exception:
            pass

    return ""


def generate_article_from_trip(destination: str, stages: list, total_photos: int):
    prompt = f"""Tu es le redacteur en chef d'Heldonica, media et concepteur de voyages slow travel en duo.
Redige un carnet de route complet (1200 a 1500 mots) base sur les donnees reelles de notre voyage a {destination}.

DONNEES DU VOYAGE :
- Destination : {destination}
- Etapes et reperes GPS identifies : {', '.join(stages)}
- Nombre de cliches et videos captures : {total_photos}
- Periode : Voyages vecus en 2025 et 2026.

REGLES ABSOLUES (7 GARDE-FOUS HELDONICA) :
1. PRONOMS : Strictement "on" pour le duo ("on a teste", "on a roule") et le tutoiement "tu" pour le lecteur. INTERDICTION ABSOLUE de "je", "nous", "les voyageurs", "les touristes".
2. LEXIQUE : 0 mot banni (PAS de : bon plan, incontournable, tips, magnifique, splendide, incroyable, spot, optimiser, paradis, aventure inoubliable).
3. E-E-A-T : Visites reelles sur le terrain, saison, ressenti veridique.
4. SENSORIEL : Au moins 1 detail sensoriel fort par section (odeur, texture, gout, son, lumiere).
5. HONNETETE : Section obligatoire "Ce qu'on a moins aime".
6. INFOS GEO : Prix reels en euros, durees de marche, routes, acces precis.
7. CTA DOUX : Terminer par une invitation sobre ("On en discute par message", "Decouvre nos carnets sur le site").

STRUCTURE DE SORTIE (JSON strict) :
{{
  "title": "Titre du carnet",
  "slug": "slug-url-sans-accents",
  "excerpt": "Resume captivant de 2-3 phrases",
  "content": "Contenu complet en HTML propre avec <h2>, <p>, <ul><li>, <em>",
  "meta_title": "Titre SEO < 60 car | Heldonica",
  "meta_description": "Meta description SEO < 160 car"
}}
Retourne UNIQUEMENT le JSON valide, sans texte d'introduction ni balises markdown.
"""
    print(f"\n[IA] Generation du carnet de route pour {destination}...")
    raw_response = call_ai(prompt)
    
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    try:
        data = json.loads(cleaned)
        return data
    except Exception as e:
        print(f"[ERREUR] Parsing JSON : {e}")
        return None


def save_to_supabase(article_data, destination):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[WARN] Identifiants Supabase manquants.")
        return

    payload = {
        "title": article_data["title"],
        "slug": article_data["slug"],
        "excerpt": article_data["excerpt"],
        "content": article_data["content"],
        "category": "Carnets Voyage",
        "tags": [destination.lower(), "slow-travel", "roadtrip"],
        "published": False,
        "status": "draft",
        "meta_title": article_data.get("meta_title"),
        "meta_description": article_data.get("meta_description"),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    url = f"{SUPABASE_URL}/rest/v1/cms_blog_posts"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    r = requests.post(url, headers=headers, json=payload)
    if r.status_code in [200, 201]:
        print(f"[SUCCES] Article '{article_data['title']}' enregistre dans le CMS Heldonica !")
    else:
        print(f"[ERREUR] Supabase ({r.status_code}) : {r.text}")


def main():
    print("=" * 60)
    print("  Heldonica Content Factory - Google Data + IA")
    print("=" * 60)

    destination = "Roumanie"
    stages = [
      "Bucarest (ruelles du vieux quartier Lipscani)",
      "Brasov (Mont Tampa et Eglise Noire)",
      "Biertan & Viscri (eglises fortifiees saxonnes)",
      "Sighisoara (citadelle medievale et ruelles pavees)",
      "Maramures (eglises en bois de Barsana, vallee de l'Iza)",
      "Monts Apuseni (grotte de Scarisoara, Padis)"
    ]
    
    article = generate_article_from_trip(destination, stages, total_photos=142)
    if article:
        print(f"\n[OK] Titre : {article['title']}")
        print(f"[OK] Slug : /blog/{article['slug']}")
        print(f"[OK] Extrait : {article['excerpt'][:120]}...")
        save_to_supabase(article, destination)


if __name__ == "__main__":
    main()
