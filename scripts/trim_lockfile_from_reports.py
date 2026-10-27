import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

reports_dir = r"C:\Users\Work\heldonica-clean\docs\jules-reports"

for f in os.listdir(reports_dir):
    if f.endswith(".md"):
        path = os.path.join(reports_dir, f)
        with open(path, "r", encoding="utf-8") as file:
            lines = file.readlines()
        
        clean_lines = []
        for line in lines:
            if "lockfileVersion:" in line or "diff --git" in line:
                break
            clean_lines.append(line)
        
        with open(path, "w", encoding="utf-8") as file:
            file.writelines(clean_lines)
        print(f"✓ Nettoyé {f} : {len(clean_lines)} lignes")

print("Nettoyage terminé.")
