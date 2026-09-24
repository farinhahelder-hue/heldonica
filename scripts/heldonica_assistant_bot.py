import os
import sys
import time
import json
import zipfile
import shutil
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

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    Image = None

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
TELEGRAM_BOT_TOKEN = ENV.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = ENV.get("TELEGRAM_CHAT_ID")
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY") or ENV.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GROQ_API_KEY = ENV.get("GROQ_API_KEY")

DOWNLOADS_DIR = Path(os.path.expanduser("~")) / "Downloads"
HELDONICA_MEDIA = Path("public/images/destinations")
HELDONICA_CONTENT = Path("content/destinations")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}" if TELEGRAM_BOT_TOKEN else None


def send_telegram_message(chat_id, text):
    if not TELEGRAM_API_URL or not chat_id:
        return
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    try:
        requests.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload, timeout=10)
    except Exception:
        pass


def generate_trip_content(destination: str, stages: list = None, notes: str = ""):
    stages_text = ", ".join(stages) if stages else "Itinéraire lent sur les routes secondaires"
    prompt = f"""Tu es le rédacteur en chef d'Heldonica, média et concepteur de voyages slow travel en duo.
Rédige un carnet de route complet (900 à 1100 mots) basé sur les données de notre voyage à {destination}.
Étapes GPS identifiées : {stages_text}.
Notes de terrain et ressentis : {notes}.
Période : voyages vécus en 2025 et 2026.

RÈGLE D'OR : "On n'invente rien. On raconte ce qu'on a vécu."
PRONOMS OBLIGATOIRES : "on" (duo), "tu" (lecteur). INTERDICTION ABSOLUE de "je", "nous", "les voyageurs", "les touristes".
0 MOT BANNI : Aucun mot parmi (bon plan, incontournable, tips, magnifique, splendide, incroyable, spot, optimiser, paradis, aventure inoubliable).

Retourne UNIQUEMENT un JSON strict :
{{
  "title": "Titre du carnet",
  "slug": "slug-sans-accents",
  "excerpt": "Résumé de 2-3 phrases",
  "content": "Contenu HTML complet (avec <h2>, <p>, <ul>, <li>, <em>)",
  "meta_title": "Titre SEO < 60 car | Heldonica",
  "meta_description": "Meta description < 160 car",
  "instagram_caption": "Légende Instagram complète avec hook, récit, lieu et hashtags"
}}"""

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    body = {
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "response_format": {"type": "json_object"}
    }
    try:
        r = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=45)
        if r.status_code == 200:
            return json.loads(r.json()["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"[ERREUR IA] {e}")
    return None


def save_to_supabase(article, destination):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False
    payload = {
        "title": article["title"],
        "slug": article["slug"],
        "excerpt": article["excerpt"],
        "content": article["content"],
        "category": "Carnets Voyage",
        "tags": [destination.lower(), "slow-travel", "roadtrip"],
        "published": False,
        "status": "draft",
        "meta_title": article.get("meta_title"),
        "meta_description": article.get("meta_description"),
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
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=15)
        return r.status_code in [200, 201]
    except Exception:
        return False


def watch_loop():
    print("=" * 60)
    print("  🚀 Heldonica Assistant Daemon & Telegram Bot Actif")
    print(f"  📂 Surveillance du dossier : {DOWNLOADS_DIR}")
    print("=" * 60)

    processed_zips = set()
    offset = 0

    while True:
        try:
            # 1. Surveillance Téléchargements (Google Takeout / Médias)
            for zip_path in list(DOWNLOADS_DIR.glob("takeout*.zip")) + list(DOWNLOADS_DIR.glob("Takeout*.zip")):
                if zip_path.name not in processed_zips:
                    print(f"\n[DAEMON] Nouvel export détecté : {zip_path.name}")
                    processed_zips.add(zip_path.name)
                    # Traitement automatique
                    article = generate_trip_content("Voyage Récit Récent", notes=f"Export {zip_path.name}")
                    if article:
                        save_to_supabase(article, "Voyage")
                        print(f"[DAEMON] ✅ Article généré : {article['title']}")
                        if TELEGRAM_CHAT_ID:
                            send_telegram_message(
                                TELEGRAM_CHAT_ID,
                                f"🎉 <b>Nouvel export traité automatiquement !</b>\n\n"
                                f"📝 <b>Article :</b> {article['title']}\n"
                                f"🔗 <code>/blog/{article['slug']}</code>\n\n"
                                f"📱 <b>Légende Instagram :</b>\n{article['instagram_caption']}"
                            )

            # 2. Écoute Telegram si configuré
            if TELEGRAM_API_URL:
                r = requests.get(f"{TELEGRAM_API_URL}/getUpdates?offset={offset}&timeout=10", timeout=15)
                if r.status_code == 200:
                    data = r.json()
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        msg = update.get("message", {})
                        chat_id = msg.get("chat", {}).get("id")
                        text = msg.get("text", "")
                        if text:
                            print(f"[TELEGRAM] Reçu : {text}")
                            send_telegram_message(chat_id, f"⏳ <b>Rédaction du carnet en cours pour :</b> <i>{text}</i>...")
                            article = generate_trip_content(text, notes=text)
                            if article:
                                save_to_supabase(article, text)
                                reply = (
                                    f"✅ <b>Article & Carte créés dans le CMS !</b>\n\n"
                                    f"📝 <b>Titre :</b> {article['title']}\n"
                                    f"🔗 <code>/blog/{article['slug']}</code>\n\n"
                                    f"📱 <b>Post Instagram :</b>\n\n{article['instagram_caption']}"
                                )
                                send_telegram_message(chat_id, reply)

            time.sleep(5)
        except Exception as e:
            time.sleep(5)


if __name__ == "__main__":
    watch_loop()
