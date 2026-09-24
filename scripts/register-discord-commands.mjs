import { readFileSync } from 'fs';
import { resolve } from 'path';

// Charge le token depuis discord-bot/.env ou .env.local
let token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  try {
    const envContent = readFileSync(resolve('discord-bot/.env'), 'utf-8');
    const match = envContent.match(/DISCORD_BOT_TOKEN=(.+)/);
    if (match) token = match[1].trim();
  } catch {}
}

if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN non trouvé dans process.env ou discord-bot/.env');
  process.exit(1);
}

// Extrait l'application ID du token (partie 1 en base64)
const appId = Buffer.from(token.split('.')[0], 'base64').toString('utf-8');
console.log(`🤖 Enregistrement des commandes slash pour l'application Discord ID: ${appId}...`);

const commands = [
  {
    name: 'muse',
    description: 'Pose une question à Muse (Llama 3.3 via Groq gratuit)',
    options: [
      {
        name: 'question',
        description: 'Ta question ou invite',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'gemini',
    description: 'Pose une question à Gemini 2.0 Flash (gratuit)',
    options: [
      {
        name: 'question',
        description: 'Ta question ou invite',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'perplexity',
    description: 'Pose une question avec recherche web / Perplexity',
    options: [
      {
        name: 'question',
        description: 'Ta question ou invite',
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const res = await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`❌ Erreur Discord API (${res.status}):`, err);
  process.exit(1);
}

const data = await res.json();
console.log(`✅ ${data.length} commandes slash enregistrées avec succès :`, data.map(c => `/${c.name}`).join(', '));
