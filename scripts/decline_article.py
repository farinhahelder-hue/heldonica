#!/usr/bin/env python3
"""
Déclinaison auto Article → Carrousel/Reel/Newsletter (stub)
Usage: python scripts/decline_article.py --slug roumanie-2026
Lit content/drafts/[slug].md et génère 3 brouillons : prompts/instagram-carousel.md, reel, newsletter
"""
import argparse, pathlib
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--slug", required=True)
    args=p.parse_args()
    print(f"[decline] {args.slug} → carrousel 10 slides + Reel 30s + newsletter 300 mots (stub, voir prompts/*)")
if __name__=="__main__":
    main()
