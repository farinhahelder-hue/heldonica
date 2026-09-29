"""
scripts/test_keys.py — Vérification et test de connexion de toutes les clés d'API configurées
"""

import os
import sys
import json
import urllib.request
from pathlib import Path

# Fix Windows console encoding
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

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

def test_openai_compatible(name: str, url: str, key: str, model: str):
    if not key:
        print(f"⚪ [{name}] Clé non renseignée")
        return False

    req = urllib.request.Request(
        url,
        data=json.dumps({
            "model": model,
            "messages": [{"role": "user", "content": "Dis 'OK' en 1 mot."}],
            "max_tokens": 10
        }).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            print(f"✅ [{name}] OK! Modèle: {model} → Réponse: '{content}'")
            return True
    except Exception as e:
        print(f"❌ [{name}] ÉCHEC ({e})")
        return False

def main():
    print("=" * 60)
    print(" 🔍 TEST DES CLÉS D'API IA DANS .ENV.LOCAL")
    print("=" * 60)

    # 1. Groq
    test_openai_compatible("Groq", "https://api.groq.com/openai/v1/chat/completions", ENV.get("GROQ_API_KEY", ""), "openai/gpt-oss-120b")

    # 2. OpenAI
    test_openai_compatible("OpenAI", "https://api.openai.com/v1/chat/completions", ENV.get("OPENAI_API_KEY", ""), "gpt-4o-mini")

    # 3. DeepSeek
    test_openai_compatible("DeepSeek", "https://api.deepseek.com/chat/completions", ENV.get("DEEPSEEK_API_KEY", ""), "deepseek-chat")

    # 4. AIML API
    test_openai_compatible("AIML API", "https://api.aimlapi.com/v1/chat/completions", ENV.get("AIML_API_KEY", ""), "meta-llama/Llama-3.3-70B-Instruct-Turbo")

    # 5. NVIDIA Build API
    test_openai_compatible("NVIDIA NIM", "https://integrate.api.nvidia.com/v1/chat/completions", ENV.get("NVIDIA_API_KEY", ""), "meta/llama-3.3-70b-instruct")

    # 6. Hugging Face
    test_openai_compatible("Hugging Face", "https://router.huggingface.co/v1/chat/completions", ENV.get("HUGGINGFACE_API_KEY", ""), "Qwen/Qwen2.5-VL-72B-Instruct")

    print("\n[FIN DU TEST]")

if __name__ == "__main__":
    main()
