import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

// Intents demandés par Discord : Guilds, GuildMessages, MessageContent (activé dans le portail)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const PREFIX = '!';
const HELP = `**Heldonica Bot 0€** — commandes :
\`!muse <message>\` → Groq llama-3.3-70b (gratuit)
\`!gemini <message>\` → Gemini 2.0 Flash (gratuit)
\`!perplexity <message>\` → Perplexity via Groq (gratuit)
\`!help\` → aide`;

// Appel IA via ton backend Heldonica (réutilise lib/ai-provider cascade) — 0€
// Si tu veux direct sans backend, remplace par fetch Groq/Gemini direct avec tes clés.
async function callHeldonicaAI(prompt, provider = 'auto') {
  const base = process.env.HELDONICA_URL || 'https://www.heldonica.fr';
  try {
    const r = await fetch(`${base}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider }),
    });
    if (r.ok) {
      const j = await r.json();
      return j.reply || j.content || null;
    }
  } catch {}
  // Fallback : appelle Groq direct si HELDONICA_URL down
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (r.ok) {
      const j = await r.json();
      return j.choices?.[0]?.message?.content || null;
    }
  }
  return null;
}

client.on('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag} — intents OK (Guilds, GuildMessages, MessageContent)`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const [cmd, ...rest] = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const prompt = rest.join(' ').trim();
  const lower = cmd.toLowerCase();

  if (lower === 'help') {
    await message.reply(HELP);
    return;
  }

  if (!prompt && ['muse', 'gemini', 'perplexity'].includes(lower)) {
    await message.reply(`Usage: \`!${lower} <ton message>\``);
    return;
  }

  if (['muse', 'gemini', 'perplexity'].includes(lower)) {
    await message.channel.sendTyping();
    const reply = await callHeldonicaAI(prompt, lower);
    if (!reply) {
      await message.reply('❌ Pas de réponse IA (vérifie `HELDONICA_URL` ou `GROQ_API_KEY` dans `.env`)');
      return;
    }
    // Discord limite 2000 chars
    for (const chunk of reply.match(/.{1,1900}/gs) || [reply]) {
      await message.reply(chunk);
    }
    return;
  }
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN manquant — mets-le dans discord-bot/.env ou Vercel Env');
  process.exit(1);
}
client.login(token);
