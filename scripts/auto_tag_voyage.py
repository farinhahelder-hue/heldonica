#!/usr/bin/env python3
"""
Auto-tag SEO local — 3 photos / moment via Gemini Vision (gratuit)
Lit voyage.md + cms_media, propose tags/alt/seo pour 1 moment à la fois.
Usage: python scripts/auto_tag_voyage.py --moment "13:46"
"""
import argparse, pathlib, json, os
from supabase import create_client

# Prompt ancré : ne jamais inventer de lieu, juste matières/lumière
PROMPT = """Tu es Heldonica (Sage+Explorateur). Décris 3 photos du moment {heure} sans inventer de lieu.
Donne JSON: {{"tags":["pépite","..."], "alt":"... 120c", "seo":"... 155c"}}.
Lexique: pépites dénichées, joyaux cachés. Si incertain, mets [À TOI]."""

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--moment", required=True, help="Heure du moment, ex: 13:46")
    args = p.parse_args()
    print(f"[tag] Moment {args.moment} — appel Gemini Vision ici (stub, à brancher avec GEMINI_API_KEY)")
    # TODO: brancher @google/generative-ai vision quand GEMINI_API_KEY est posé
    print(json.dumps({"tags":["pépite","slow-travel"],"alt":"[À TOI : décris en 120c]","seo":"[À TOI 155c]"}, ensure_ascii=False))

if __name__ == "__main__":
    main()
