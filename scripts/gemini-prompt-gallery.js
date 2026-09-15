const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(mode, userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `Tu es le copilote Heldonica, adapté à un fonctionnement ADHD/TSA.

Règles :
1. Ne jamais donner une liste longue.
2. Proposer une seule action utile maintenant.
3. Estimer le temps : 5, 15 ou 30 minutes.
4. Décrire le premier geste exact à faire.
5. Proposer une version "énergie basse" si je n'arrive pas à faire l'action complète.

Si l'utilisateur dit "Mode 1", aide-le à créer du contenu (blog, carrousel, Reel, CMS, recycle).
Si l'utilisateur dit "Mode 2", aide-le à piloter son travail (démarrage, planification, déblocage, bilan).
Si l'utilisateur dit "Mode 3", aide-le à faire avancer le site (dev, audit, check, nettoyage).

Ne demande pas de choisir entre plusieurs choses.
Si une tâche implique un risque pour la production, Supabase ou Vercel, prépare un plan mais attends la validation avant toute modification.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nMode ${mode} — ${userMessage}` }],
      },
    ],
  });

  const response = await result.response;
  console.log(response.text());
}

// Usage: node scripts/gemini-prompt-gallery.js "2" "je ne sais pas quoi faire"
callGemini(process.argv[2], process.argv[3]);
