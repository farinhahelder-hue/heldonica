import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("scripts/jules_harvested_artifacts.json", "r", encoding="utf-8") as f:
    artifacts = json.load(f)

reports_dir = r"C:\Users\Work\heldonica-clean\docs\jules-reports"
os.makedirs(reports_dir, exist_ok=True)

clean_reports = {}

for name, item in artifacts.items():
    content = item["content"]
    title = item["title"]
    task_id = item["id"]
    
    clean_text = ""
    if name.endswith("_patch.diff"):
        # Extraire les lignes ajoutées du diff
        lines = content.split("\n")
        extracted_lines = []
        for line in lines:
            if line.startswith("+") and not line.startswith("+++"):
                extracted_lines.append(line[1:])
        clean_text = "\n".join(extracted_lines)
    else:
        clean_text = content
    
    clean_reports[task_id] = {
        "id": task_id,
        "title": title,
        "content": clean_text
    }
    
    # Écriture dans docs/jules-reports/
    file_path = os.path.join(reports_dir, f"{task_id}.md")
    with open(file_path, "w", encoding="utf-8") as f_out:
        f_out.write(f"# {title}\n\n{clean_text}\n")
    print(f"✓ Écrit : docs/jules-reports/{task_id}.md ({len(clean_text)} caractères)")

summary_path = os.path.join(reports_dir, "jules_all_reports_clean.json")
with open(summary_path, "w", encoding="utf-8") as f_sum:
    json.dump(clean_reports, f_sum, indent=2, ensure_ascii=False)

print(f"\n🎉 {len(clean_reports)} rapports nettoyés et enregistrés dans {reports_dir}")
