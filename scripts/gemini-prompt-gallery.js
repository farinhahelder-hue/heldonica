// scripts/gemini-prompt-gallery.js
// Usage : node scripts/gemini-prompt-gallery.js "2" "je ne sais pas quoi faire"
// Modes : 1 = contenu, 2 = pilotage, 3 = site

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Tu es le copilote Heldonica, adapté à un fonctionnement ADHD/TSA.

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

async function callGemini(mode, userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Erreur : GEMINI_API_KEY non définie dans .env");
    console.error("Ajoute : echo \"GEMINI_API_KEY=ta_cle\" >> .env");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: `${SYSTEM_PROMPT}\n\nMode ${mode} — ${userMessage}` },
        ],
      },
    ],
  });

  const response = await result.response;
  console.log(response.text());
}

// Main
const mode = process.argv[2];
const userMessage = process.argv[3] || "";

if (!mode || !["1", "2", "3"].includes(mode)) {
  console.log("Usage : node scripts/gemini-prompt-gallery.js \"1|2|3\" \"ton message\"");
  console.log("");
  console.log("Modes :");
  console.log("  1 — Je crée du contenu (blog, carrousel, Reel, CMS, recycle)");
  console.log("  2 — Je pilote mon travail (démarrage, planification, déblocage, bilan)");
  console.log("  3 — Je fais avancer le site (dev, audit, check, nettoyage)");
  console.log("");
  console.log("Exemples :");
  console.log('  node scripts/gemini-prompt-gallery.js "2" "je ne sais pas quoi faire"');
  console.log('  node scripts/gemini-prompt-gallery.js "1" "je veux écrire un article sur Lisbonne"');
  console.log('  node scripts/gemini-prompt-gallery.js "3" "je veux prendre une tâche de dev"');
  process.exit(1);
}

callGemini(mode, userMessage).catch(console.error);
