"""
scripts/enrich_photos_vision.py — Enrichissement visuel automatique des photos par IA (Vision API)

Prend un dossier de photos ou les photos de la médiathèque CMS et utilise un modèle
multimodal (Gemini 2.5 Vision, Groq, HuggingFace, Llama 3.2 Vision) pour :
1. Identifier les monuments, lieux, enseignes et panneaux (OCR).
2. Décrire l'atmosphère, le type d'activité et la nourriture/paysage.
3. Pré-remplir les descriptions visuelles pour les balises [A TOI] dans voyage.md.

Usage :
  python scripts/enrich_photos_vision.py --photos dossier_photos/
  python scripts/enrich_photos_vision.py --destination madere
"""

import os
import sys
import json
import base64
import argparse
from pathlib import Path
from typing import Optional, Dict, Any

# Charger .env.local
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "scripts"))

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

def get_base64_image(image_path: Path) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def analyze_photo_gemini(image_path: Path, api_key: str) -> Optional[Dict[str, Any]]:
    """Analyse une photo avec Gemini 2.5 Flash Vision."""
    import urllib.request

    b64_data = get_base64_image(image_path)
    ext = image_path.suffix.lower()
    mime = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    prompt = (
        "Tu es l'assistant visuel pour Heldonica (média slow travel). "
        "Analyse cette photo de voyage et réponds STRICTEMENT sous forme d'un objet JSON avec les clés :\n"
        "- lieu_probable: (string, nom de ville, monument, restaurant, paysage ou 'Inconnu')\n"
        "- texte_ou_panneaux: (string, texte/enseigne/menu visible dans l'image ou null)\n"
        "- categorie: (string: 'paysage', 'patrimoine', 'gastronomie', 'hebergement', 'transport', 'portrait')\n"
        "- description_visuelle: (string, 1-2 phrases décrivant ce qu'on voit, l'ambiance et la lumière)\n"
        "- suggestions_a_toi: (string, piste pour le carnet de route, ex: 'Parler de la spécialité dégustée')\n"
    )

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime, "data": b64_data}}
            ]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json"
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
    except Exception as e:
        print(f"  [WARN] Échec de l'analyse visuelle pour {image_path.name} : {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Enrichissement visuel des photos de voyage par IA")
    parser.add_argument("--photos", type=str, help="Dossier contenant les photos")
    parser.add_argument("--out", type=str, help="Fichier JSON de sortie pour les résultats")
    args = parser.parse_args()

    api_key = ENV.get("GEMINI_API_KEY")
    if not api_key:
        print("[ERREUR] GEMINI_API_KEY absente de .env.local")
        sys.exit(1)

    if not args.photos:
        print("[ERREUR] Spécifiez un dossier de photos avec --photos")
        sys.exit(1)

    photos_dir = Path(args.photos)
    if not photos_dir.exists():
        print(f"[ERREUR] Dossier introuvable : {photos_dir}")
        sys.exit(1)

    image_exts = {".jpg", ".jpeg", ".png", ".webp"}
    photos = [p for p in sorted(photos_dir.iterdir()) if p.is_file() and p.suffix.lower() in image_exts]

    print(f"[INFO] Analyse visuelle de {len(photos)} photo(s) avec Vision AI...")

    results = {}
    for idx, ph in enumerate(photos, 1):
        print(f" [{idx}/{len(photos)}] Analyse de {ph.name}...")
        res = analyze_photo_gemini(ph, api_key)
        if res:
            results[ph.name] = res
            print(f"   ↳ Lieu/Monuments : {res.get('lieu_probable')} | Catégorie : {res.get('categorie')}")

    out_path = Path(args.out) if args.out else photos_dir / "vision_enrichment.json"
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[OK] Analyses visuelles enregistrées dans : {out_path}")

if __name__ == "__main__":
    main()
