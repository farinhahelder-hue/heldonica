#!/usr/bin/env python3
"""
Auto-brouillon depuis voyage.md — 0€, ancré
Surveille imports/roumanie-2026/voyage.md, génère content/drafts/[date]-roumanie.md
avec faits verrouillés + [A TOI], notifie Discord si DISCORD_WEBHOOK_URL est setté.
"""
import time, pathlib, re, datetime, os, json, hashlib, urllib.request

VOYAGE = pathlib.Path("imports/roumanie-2026/voyage.md")
DRAFTS = pathlib.Path("content/drafts")
WEBHOOK = os.getenv("DISCORD_WEBHOOK_URL") or os.getenv("NEXT_PUBLIC_DISCORD_WEBHOOK_URL")

def parse_moments(text):
    # Trouve "Jour X — 27 août" et les 3 moments "- HH:MM → HH:MM — N photos"
    moments = re.findall(r"-\s*\d{2}:\d{2}\s*→\s*\d{2}:\d{2}\s*—\s*\d+\s*photos?", text)
    return moments

def make_draft(text):
    today = datetime.date.today().isoformat()
    slug = f"{today}-roumanie-auto"
    moments = parse_moments(text)
    draft = f"""---
title: "Roumanie — {today} (auto-brouillon)"
slug: "{slug}"
date: "{today}"
status: draft
source: voyage.md
---

> Auto-généré depuis `voyage.md` — faits verrouillés, [A TOI] à remplir.

## Faits (ne pas inventer)
{chr(10).join(f"- {m} [A TOI : où, quoi, moins aimé]" for m in moments) or "- [A TOI : où, quoi, moins aimé]"}

## Ressenti (à toi)
[A TOI : odeur, lumière, son]

## Infos pratiques (à toi)
[A TOI : prix, horaires, accès]

## Verdict Heldonica (à toi)
[A TOI : pour qui, note, 3 visites...]

<!-- Source: voyage.md hash:{hashlib.sha256(text.encode()).hexdigest()[:8]} -->
"""
    return slug, draft

def notify(msg):
    if not WEBHOOK:
        return
    try:
        data = json.dumps({"content": msg}).encode()
        req = urllib.request.Request(WEBHOOK, data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10).read()
    except Exception as e:
        print(f"[warn] Discord notify failed: {e}")

def main():
    DRAFTS.mkdir(parents=True, exist_ok=True)
    last_hash = ""
    print("[watch] Surveille", VOYAGE, "→", DRAFTS)
    while True:
        if VOYAGE.exists():
            text = VOYAGE.read_text(encoding="utf-8", errors="ignore")
            h = hashlib.sha256(text.encode()).hexdigest()
            if h != last_hash and len(text) > 100:
                slug, draft = make_draft(text)
                out = DRAFTS / f"{slug}.md"
                if not out.exists():
                    out.write_text(draft, encoding="utf-8")
                    print(f"[new] {out}")
                    notify(f"📝 Nouveau brouillon auto : {slug} ({len(parse_moments(text))} moments)")
                last_hash = h
        time.sleep(30)

if __name__ == "__main__":
    main()
