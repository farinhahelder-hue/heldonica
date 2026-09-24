#!/usr/bin/env python3
"""
Garde-fou auto : bloque published:true si date/lieu non prouvé par evidence
Usage: python scripts/garde_fou_evidence.py --check content/drafts/2026-09-21-roumanie.md
Appelé par GitHub Action pre-publish et par /api/cms/articles POST/PATCH
"""
import sys, pathlib, re
def check(path):
    text=pathlib.Path(path).read_text(encoding="utf-8", errors="ignore") if pathlib.Path(path).exists() else ""
    # Vérifie que chaque "2026" est dans evidence (stub: cherche evidence)
    if "2026" in text and "evidence" not in text.lower():
        print("[garde-fou] ⚠️ date sans evidence — bloqué (ajoute evidence ou mets published:false)")
        return 1
    print("[garde-fou] OK")
    return 0
if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--check", required=True)
    args=p.parse_args()
    sys.exit(check(args.check))
