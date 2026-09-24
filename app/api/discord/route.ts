import { NextResponse, after } from 'next/server';
import { createPublicKey, verify } from 'crypto';
import { generateAiCompletion, type AiMessage } from '@/lib/ai-provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vérification de signature cryptographique Ed25519 requise par Discord
function verifyDiscordSignature({
  rawBody,
  signature,
  timestamp,
  publicKey,
}: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
  publicKey: string | undefined;
}): boolean {
  if (!signature || !timestamp || !publicKey) return false;

  try {
    const key = createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), // DER header standard pour clé publique Ed25519
        Buffer.from(publicKey, 'hex'),
      ]),
      format: 'der',
      type: 'spki',
    });

    return verify(
      null,
      Buffer.concat([Buffer.from(timestamp), Buffer.from(rawBody)]),
      key,
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    console.error('[Discord Webhook] Erreur vérification signature:', err);
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Heldonica Discord Interaction Webhook',
    commands: ['/muse', '/gemini', '/perplexity'],
    hasPublicKey: Boolean(process.env.DISCORD_PUBLIC_KEY),
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const rawBody = await req.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  // Validation cryptographique imposée par l'API Discord
  const isValid = verifyDiscordSignature({
    rawBody,
    signature,
    timestamp,
    publicKey,
  });

  if (!isValid) {
    return new NextResponse('Invalid request signature', { status: 401 });
  }

  let interaction: any;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse('Invalid JSON body', { status: 400 });
  }

  // 1. Handshake PING Discord (obligatoire lors de la configuration de l'URL dans le portail)
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 2. Commande Slash (/muse, /gemini, /perplexity)
  if (interaction.type === 2) {
    const cmdName = (interaction.data?.name || '').toLowerCase();
    const question = interaction.data?.options?.find((o: any) => o.name === 'question')?.value || '';
    const appId = interaction.application_id;
    const interactionToken = interaction.token;

    // Réponse différée immédiate (Type 5 : DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
    // Informe Discord que le bot prépare la réponse pour éviter le timeout de 3 secondes
    after(async () => {
      const webhookUrl = `https://discord.com/api/v10/webhooks/${appId}/${interactionToken}/messages/@original`;

      try {
        let systemPrompt =
          "Tu es l'assistant IA Heldonica. Sois direct, clair, bienveillant et structuré.";
        let preferredProvider: 'groq' | 'gemini' | 'openrouter' = 'groq';

        if (cmdName === 'muse') {
          preferredProvider = 'groq';
          systemPrompt =
            "Tu es Muse, l'intelligence créative et éditoriale d'Heldonica (slow travel, hôtellerie de charme, authenticité, indépendance). " +
            "Réponds avec finesse, clarté et concision, en privilégiant des adresses ou réflexions de qualité.";
        } else if (cmdName === 'gemini') {
          preferredProvider = 'gemini';
          systemPrompt =
            "Tu es Gemini pour Heldonica. Fournis des explications claires, précises et structurées.";
        } else if (cmdName === 'perplexity') {
          preferredProvider = 'openrouter';
          systemPrompt =
            "Tu es l'assistant de recherche et synthèse d'information d'Heldonica. Fournis des faits vérifiables et synthétiques.";
        }

        const messages: AiMessage[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question || 'Bonjour' },
        ];

        const aiResult = await generateAiCompletion({
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          preferredProvider,
        });

        const reply = aiResult.content || 'Aucune réponse générée.';
        const header = `> **/${cmdName}** : *${question}*\n\n`;
        const footer = `\n\n*— Heldonica AI (${aiResult.provider} • ${aiResult.model})*`;

        const maxContentLen = 1950 - header.length - footer.length;
        const truncatedReply =
          reply.length > maxContentLen ? reply.slice(0, maxContentLen) + '...' : reply;

        const finalMessage = `${header}${truncatedReply}${footer}`;

        await fetch(webhookUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: finalMessage }),
        });
      } catch (err: any) {
        console.error('[Discord Webhook] Erreur génération IA:', err);
        await fetch(webhookUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `> **/${cmdName}** : *${question}*\n\n❌ Une erreur est survenue : ${err.message || 'Échec de génération'}`,
          }),
        }).catch(() => {});
      }
    });

    return NextResponse.json({ type: 5 });
  }

  return NextResponse.json({ error: 'Unsupported interaction type' }, { status: 400 });
}
