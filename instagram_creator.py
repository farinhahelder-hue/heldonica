"""
Instagram Carousel Generator - Heldonica
Génère automatiquement du contenu pour carrousels Instagram via Groq (gratuit)
"""

import os
import json
import requests
from groq import Groq

# Configuration - mettre dans .env
# GROQ_API_KEY=gsk_...
# UNSPLASH_ACCESS_KEY=...

# Initialize Groq client
# IMPORTANT: Set GROQ_API_KEY in environment or .env file
# Get from environment or use directly (for testing)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️  GROQ_API_KEY not set! Set it in .env or environment.")
    print("   Get free key at: https://console.groq.com")
    import sys
    sys.exit(1)
client = Groq(api_key=GROQ_API_KEY)
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "VKxcQvLNtFlLcgTxXW5YjnsQng4mu-WyIjyNHvLYsWA")


def generate_carousel_content(topic: str, num_slides: int = 5) -> dict:
    """Génère le contenu du carrousel via GPT"""
    
    prompt = f"""Génère un carrousel Instagram de {num_slides} slides sur le thème: {topic}

Format JSON exactement:
{{
  "title": "Titre principal accrocheur",
  "slides": [
    {{"title": "Tip 1", "content": "Description concise (max 80 mots)", "hashtag": "#hashtag1"}},
    {{"title": "Tip 2", "content": "Description concise (max 80 mots)", "hashtag": "#hashtag2"}},
    {{"title": "Tip 3", "content": "Description concise (max 80 mots)", "hashtag": "#hashtag3"}},
    {{"title": "Tip 4", "content": "Description concise (max 80 mots)", "hashtag": "#hashtag4"}},
    {{"title": "Tip 5", "content": "Description concise (max 80 mots)", "hashtag": "#hashtag5"}}
  ],
  "caption": "Caption finale avec call-to-action (max 2000 caractères)",
  "hashtags": ["#slowtravel", "#travel", "#voyage"],
  "call_to_action": " CTA finale"
}}

Le contenu doit être en français, authentique, et correspondre au style Heldonica - slow travel, hors sentiers battus.
Chaque slide doit être actionable et donner une vraie valeur."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Tu es un expert en contenu travel Instagram. Génère des carrousels authentiques, engageants, et actionnables. Réponds en JSON valide uniquement."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(response.choices[0].message.content)


def search_unsplash_image(query: str, per_page: int = 1) -> list:
    """Recherche des images sur Unsplash"""
    
    url = "https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": per_page,
        "orientation": "portrait"
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        return [
            {
                "url": photo["urls"]["regular"],
                "thumb": photo["urls"]["small"],
                "credit": f"Photo by {photo['user']['name']}",
                "link": photo["links"]["html"]
            }
            for photo in data.get("results", [])
        ]
    return []


def get_carousel_images(topic: str, slides: list) -> list:
    """Cherche une image pour chaque slide"""
    
    images = []
    for slide in slides:
        # Extract keyword from content
        keyword = slide.get("content", topic).split()[:3]
        query = " ".join(keyword) + " " + topic
        results = search_unsplash_image(query)
        if results:
            images.append(results[0])
        else:
            images.append({"url": None, "credit": ""})
    
    return images


def generate_full_carousel(topic: str) -> dict:
    """Génère le carrousel complet avec images"""
    
    print(f"🎯 Génération du carrousel: {topic}")
    
    # Step 1: Generate content
    print("✍️  Rédaction du contenu...")
    content = generate_carousel_content(topic)
    
    # Step 2: Search images
    print("🔍 Recherche d'images...")
    images = get_carousel_images(topic, content.get("slides", []))
    
    return {
        "topic": topic,
        "content": content,
        "images": images,
        "ready_for_buffer": True
    }


def save_for_buffer(carousel: dict, filename: str = "carrousel_ready.json"):
    """Sauvegarde le carrousel pour Buffer"""
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(carousel, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Sauvegardé dans {filename}")


# Interface CLI
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        topic = input("Sujet du carrousel: ")
    else:
        topic = sys.argv[1]
    
    carousel = generate_full_carousel(topic)
    save_for_buffer(carousel)
    
    print("\n" + "="*50)
    print("📱 CARROUSEL PRÊT POUR BUFFER")
    print("="*50)
    print(f"\n📌 Titre: {carousel['content']['title']}")
    print(f"\n📝 Caption:\n{carousel['content']['caption']}")
    print(f"\n#️⃣ Hashtags: {' '.join(carousel['content']['hashtags'])}")