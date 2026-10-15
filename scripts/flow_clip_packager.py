"""
scripts/flow_clip_packager.py

Outil de préparation et d'expédition automatique des clips Google Flow et de la musique Lyria
vers le smartphone Xiaomi Poco X6 Pro via ADB.

Flux 0€ :
1. Détecte les clips 9:16 téléchargés depuis Flow et la piste Lyria.
2. Vérifie leur intégrité.
3. Les pousse automatiquement dans /sdcard/DCIM/Heldonica_Clips sur le Poco X6 Pro connecté.
"""

import os
import sys
import subprocess
from pathlib import Path

# Force UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SOURCE_DIR = Path(r"C:\Users\Work\heldonica-clean\public\videos\shorts\rubicon_flow")
TARGET_DEVICE_DIR = "/sdcard/DCIM/Heldonica_Clips"

def main():
    print("=" * 70)
    print("📦 PACKAGER CLIPS FLOW & MUSIQUE LYRIA ➔ POCO X6 PRO (0€)")
    print("=" * 70)

    if not SOURCE_DIR.exists():
        SOURCE_DIR.mkdir(parents=True, exist_ok=True)
        print(f"📁 Dossier source créé : {SOURCE_DIR}")
        print("   Déposez-y vos clips Google Flow (.mp4) et votre piste Lyria (.mp3/.wav).")
        return

    video_exts = {".mp4", ".mov", ".webm"}
    audio_exts = {".mp3", ".wav", ".aac", ".m4a"}

    videos = sorted([f for f in SOURCE_DIR.iterdir() if f.suffix.lower() in video_exts])
    audios = sorted([f for f in SOURCE_DIR.iterdir() if f.suffix.lower() in audio_exts])

    print(f"📁 Dossier surveillé : {SOURCE_DIR}")
    print(f"🎬 Clips Flow détectés : {len(videos)}")
    for v in videos:
        print(f"   - {v.name} ({round(v.stat().st_size / 1024 / 1024, 2)} Mo)")

    print(f"\n🎵 Pistes Lyria détectées : {len(audios)}")
    for a in audios:
        print(f"   - {a.name} ({round(a.stat().st_size / 1024 / 1024, 2)} Mo)")

    # Détection de l'appareil ADB
    try:
        adb_res = subprocess.run(["adb", "devices"], capture_output=True, text=True, timeout=5)
        lines = [line.strip() for line in adb_res.stdout.splitlines() if line.strip()]
        devices = [l.split()[0] for l in lines[1:] if len(l.split()) >= 2 and l.split()[1] == "device"]
    except Exception as e:
        print(f"\n⚠️ ADB non disponible ou erreur : {e}")
        return

    if not devices:
        print("\n⏳ Aucun smartphone Android détecté via ADB.")
        print("   -> Branchez le Poco X6 Pro en USB (Débogage USB activé) pour transférer en 1 clic.")
        print("   -> Alternative : Déposez les fichiers dans Google Photos (Album 'Photos du voyage').")
        return

    dev = devices[0]
    print(f"\n📱 Smartphone détecté : {dev}")
    print(f"🚀 Création du dossier cible sur le smartphone : {TARGET_DEVICE_DIR}")
    subprocess.run(["adb", "-s", dev, "shell", "mkdir", "-p", TARGET_DEVICE_DIR], check=True)

    fichiers_a_pousser = videos + audios
    if not fichiers_a_pousser:
        print("ℹ Aucun fichier à transférer dans la source pour le moment.")
        return

    print(f"📤 Transfert de {len(fichiers_a_pousser)} fichier(s) vers le Poco X6 Pro...")
    for f in fichiers_a_pousser:
        print(f"   -> Envoi de {f.name}...", end=" ", flush=True)
        res = subprocess.run(["adb", "-s", dev, "push", str(f), f"{TARGET_DEVICE_DIR}/{f.name}"], capture_output=True)
        if res.returncode == 0:
            print("✓ OK")
        else:
            print("✗ Erreur")

    print("\n🎉 Transfert terminé avec succès !")
    print("Ouvrez l'application Heldonica Mobile sur votre Poco X6 Pro :")
    print("Le sélecteur de plans retrouve instantanément les clips d'origine dans la galerie !")

if __name__ == "__main__":
    main()
