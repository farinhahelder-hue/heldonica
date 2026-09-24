# Heldonica Discord Bot — 0€

Bot `!muse` / `!gemini` / `!perplexity` — 0€ via tes clés gratuites (Groq, Gemini).

**Prérequis portail :** Bot → Privileged Gateway Intents → **Message Content Intent ON** + code demande `Guilds`, `GuildMessages`, `MessageContent` (déjà fait).

### Local (2 min)
```bash
cd discord-bot
npm install
cp .env.example .env  # colle DISCORD_BOT_TOKEN
npm start
# → 🤖 Logged in as Heldonica#xxxx
```
Test Discord : `!muse test` → doit répondre.

### Vercel / Render (bot gateway = process long, pas serverless)
- **Render free** : New → Background Worker → `npm start` → env `DISCORD_BOT_TOKEN`, `HELDONICA_URL`, `GROQ_API_KEY`
- **Vercel** : ne peut pas héberger un gateway bot (serverless). Soit tu le laisses tourner local/RPi, soit on le passe en **Slash Commands webhook** (`/api/discord`).

Si tu veux le mode webhook Vercel (sans process long), dis `webhook` et je te fais `app/api/discord/route.ts`.
