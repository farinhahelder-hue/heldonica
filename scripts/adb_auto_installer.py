import subprocess
import time
import sys
import os
CANDIDATE_PATHS = [
    r"C:\Users\Work\Desktop\HeldonicaMobile-app-release.apk",
    os.path.join(os.path.dirname(__file__), "..", "heldonica-mobile", "app", "build", "outputs", "apk", "release", "app-release.apk"),
    r"C:\Users\Work\Desktop\HeldonicaMobile-app-debug.apk",
    os.path.join(os.path.dirname(__file__), "..", "heldonica-mobile", "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
    r"C:\Users\Work\Downloads\app-debug.apk"
]
APK_PATH = next((p for p in CANDIDATE_PATHS if os.path.exists(p)), CANDIDATE_PATHS[0])
print(f"[*] Cible APK : {APK_PATH} (présente: {os.path.exists(APK_PATH)})", flush=True)
print(f"[*] Veille active : en attente du branchement du smartphone Android...", flush=True)

unauthorized_warned = False

while True:
    try:
        res = subprocess.run(["adb", "devices"], capture_output=True, text=True, timeout=5)
        lines = [line.strip() for line in res.stdout.splitlines() if line.strip()]
        
        devices = []
        for line in lines[1:]:
            parts = line.split()
            if len(parts) >= 2:
                if parts[1] == "device":
                    devices.append(parts[0])
                elif parts[1] == "unauthorized" and not unauthorized_warned:
                    print(f"[!] Smartphone détecté ({parts[0]}), mais non autorisé. Veuillez cliquer sur 'Autoriser' sur l'écran de votre téléphone !", flush=True)
                    unauthorized_warned = True

        if devices:
            dev = devices[0]
            print(f"[+] Smartphone connecté et autorisé : {dev}", flush=True)
            print(f"[*] Installation directe de Heldonica Mobile ({APK_PATH})...", flush=True)
            install_res = subprocess.run(["adb", "-s", dev, "install", "-r", APK_PATH], capture_output=True, text=True, timeout=60)
            print(install_res.stdout, flush=True)
            if "Success" in install_res.stdout:
                print(f"[SUCCÈS] Heldonica Mobile est installé sur votre téléphone !", flush=True)
                subprocess.run(["adb", "-s", dev, "shell", "monkey", "-p", "fr.heldonica.mobile", "-c", "android.intent.category.LAUNCHER", "1"], capture_output=True)
                print(f"[OUVERTURE] L'application est lancée sur votre écran !", flush=True)
                sys.exit(0)
            else:
                print(f"[-] Résultat installation : {install_res.stdout} {install_res.stderr}", flush=True)
    except Exception as e:
        pass
    time.sleep(2)
