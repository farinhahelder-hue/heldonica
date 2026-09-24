#!/usr/bin/env python3
"""
Auto-tag SEO local — 3 photos / moment via Gemini Vision
Usage: python scripts/auto_tag_voyage.py --moment "13:46"
Lit 3 photos du moment (via cms_media ou public/images) et appelle Gemini Vision.
"""
import argparse, pathlib, json, os, base64, mimetypes
import urllib.request
# charge .env.local si présent
for env_file in [".env.local", ".env"]:
    try:
        for line in pathlib.Path(env_file).read_text(encoding="utf-8", errors="ignore").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
    except: pass

PROMPT = """Tu es Heldonica (Sage+Explorateur). Décris ces 3 photos du moment {heure} sans inventer de lieu.
Donne JSON strict: {{"tags":["pépite","..."], "alt":"... 120c", "seo":"... 155c"}}.
Lexique: pépites dénichées, joyaux cachés. Si incertain, mets [À TOI]."""

def find_photos(moment):
    # Cherche 3 photos du moment via Supabase ou dossier local
    candidates = []
    for ext in ["*.jpg", "*.JPG", "*.png", "*.webp"]:
        candidates.extend(pathlib.Path("public/images/destinations/roumanie").glob(ext))
        candidates.extend(pathlib.Path("imports/roumanie-2026").glob(ext))
    # Prend les 3 premières (ou filtrer par heure si EXIF dispo)
    return [str(p) for p in candidates[:3]]

def call_gemini_vision(photos, heure):
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not key:
        print("[warn] GEMINI_API_KEY manquante — stub")
        return {"tags":["pépite","slow-travel"],"alt":"[À TOI : décris en 120c]","seo":"[À TOI 155c]"}
    # Construit le payload REST
    parts = [{"text": PROMPT.format(heure=heure)}]
    for p in photos:
        try:
            data = pathlib.Path(p).read_bytes()
            b64 = base64.b64encode(data).decode()
            mime = mimetypes.guess_type(p)[0] or "image/jpeg"
            parts.append({"inline_data": {"mime_type": mime, "data": b64}})
        except Exception as e:
            print(f"[warn] {p}: {e}")
    payload = json.dumps({"contents": [{"parts": parts}]}).encode()
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            j = json.loads(r.read().decode())
            text = j["candidates"][0]["content"]["parts"][0]["text"]
            import re
            cleaned = re.sub(r"```json|```", "", text).strip()
            try:
                # Décode le premier JSON, ignore le reste
                decoder = json.JSONDecoder()
                obj, _ = decoder.raw_decode(cleaned[cleaned.find("{"):])
                return obj
            except Exception as e2:
                print(f"[warn] JSON parse: {e2} — raw: {cleaned[:300]}")
                return {"raw": text[:500]}
    except Exception as e:
        print(f"[error] Gemini Vision: {e}")
        return {"tags":["pépite"],"alt":"[À TOI]","seo":"[À TOI]"}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--moment", required=True, help="Heure du moment, ex: 13:46")
    args = p.parse_args()
    photos = find_photos(args.moment)
    print(f"[tag] Moment {args.moment} — {len(photos)} photos : {photos}")
    result = call_gemini_vision(photos, args.moment)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
