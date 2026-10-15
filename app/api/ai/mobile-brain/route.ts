import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAiAuth, logAiRequest } from '@/lib/ai-auth';
import { generateAiCompletion, AiMessage, GEMINI_MODEL } from '@/lib/ai-provider';
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de passerelle pour l'APK Mobile Heldonica (Poco X6 Pro & tout client mobile).
 *
 * Principes architecturaux (docs/DECISION_GENERATION_VIDEO.md & docs/SPEC_CERVEAU_APK_POCO_X6_PRO.md) :
 * 1. Zéro clé d'API dans l'APK mobile (authentification par jeton agent ou clé mobile).
 * 2. Autonomie complète : fonctionne en Cloud 0€ quand le PC local est éteint.
 * 3. 4 modes adaptés aux situations mobiles :
 *    - 'chat'    : Discussion générale avec la posture de marque et le regard sensoriel Heldonica.
 *    - 'coach'   : Copilote ADHD/TSA (une seule action concrète, durée 5/15/30 min, version énergie basse).
 *    - 'terrain' : Notes de voyage converties en récits slow travel, légendes ou observations de terrain.
 *    - 'vault'   : Recherche et synthèse depuis les fiches de connaissances du Cerveau.
 */

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `${HELDONICA_B2C_PROMPT}

Tu es le Cerveau Heldonica embarqué sur l'application mobile (Poco X6 Pro).
Tu réponds avec concision, poésie sobre et authenticité vécue.
Formatte tes réponses en Markdown aéré, adapté à un écran de smartphone.`,

  coach: `Tu es le copilote Heldonica, adapté à un fonctionnement ADHD/TSA sur mobile.
Règles strictes :
1. Ne jamais donner une liste longue.
2. Proposer une seule action utile MAINTENANT.
3. Estimer le temps : 5, 15 ou 30 minutes.
4. Décrire le premier geste exact à faire.
5. Proposer une version "énergie basse" si l'utilisateur est fatigué.
Ton ton est calme, sans pression, bienveillant et structurant.`,

  terrain: `${HELDONICA_B2C_PROMPT}

## MODE NOTES DE TERRAIN MOBILE
Tu reçois des observations brutes prises sur le terrain (détails visuels, sons, odeurs, météo, sensations).
Tu les transformes en une note de carnet slow travel ciselée ou en légende percutante.
RÈGLE ABSOLUE : N'invente aucun fait, aucun prix, aucun lieu absent des notes. S'il manque une donnée, écris [À PRÉCISER].`,

  vault: `${HELDONICA_B2C_PROMPT}

## MODE COFFRE DES SAVOIRS & REGISTRE
Tu es la mémoire vivante d'Heldonica. Tu t'appuies sur le registre des savoirs, la philosophie du slow travel, les pépites vérifiées (Madère, Roumanie, Suisse) et la taxonomie éditoriale.
Réponds de manière factuelle, référencée et précise.`
};

import { VAULT_SPOTS, VaultSpotRecord } from '@/lib/cms-vault-spots';

function sanitizePrivacy(text: string): string {
  return text
    // Clés d'API & jetons
    .replace(/(?:sb_secret_|sk-ant-|sk-proj-|AIzaSy)[A-Za-z0-9_-]{10,}/g, '[CLE_PROTEGEE]')
    .replace(/Bearer\s+[A-Za-z0-9._-]{15,}/gi, 'Bearer [TOKEN_PROTEGE]')
    // Mots de passe
    .replace(/(?:password|cms_password|pwd|mdp)["':\s=]+([^\s"',;]+)/gi, 'password="[PROTEGE]"')
    // Emails
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[EMAIL_PROTEGE]')
    // Téléphones
    .replace(/(?:\+33|0033|0)[1-9](?:[\s.-]*\d{2}){4}/g, '[TEL_PROTEGE]');
}

function findRelevantVaultSpots(query: string, limit = 3): VaultSpotRecord[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return VAULT_SPOTS.slice(0, limit);
  return VAULT_SPOTS
    .map(spot => {
      let score = 0;
      const text = `${spot.title} ${spot.location} ${spot.tags.join(' ')} ${spot.livedExperience}`.toLowerCase();
      for (const w of words) {
        if (text.includes(w)) score++;
      }
      return { spot, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.spot);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    return auth.response || NextResponse.json({ error: auth.error || 'Non autorisé' }, { status: auth.status || 401 });
  }

  let body: {
    message?: string;
    mode?: string;
    session_id?: string;
    use_vault?: boolean;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide' }, { status: 400 });
  }

  const messageRaw = body.message?.trim() ?? '';
  if (!messageRaw) {
    return NextResponse.json({ error: 'Message requis' }, { status: 400 });
  }
  if (messageRaw.length > 10000) {
    return NextResponse.json({ error: 'Message trop long (10000 caractères max)' }, { status: 400 });
  }

  // Filtrage de confidentialité strict
  const message = sanitizePrivacy(messageRaw);
  const mode = (body.mode && body.mode in SYSTEM_PROMPTS) ? body.mode : 'chat';
  let systemPrompt = SYSTEM_PROMPTS[mode];

  // RAG : Injection des fiches du Coffre des Savoirs si mode vault ou use_vault actif
  let spotsInjectes: VaultSpotRecord[] = [];
  if (mode === 'vault' || body.use_vault) {
    spotsInjectes = findRelevantVaultSpots(message, 3);
    if (spotsInjectes.length > 0) {
      systemPrompt += `\n\n## FICHES DU COFFRE DES SAVOIRS (VÉCU AUTHENTIQUE VÉRIFIÉ) :\n` +
        spotsInjectes.map(s => `- [${s.title} (${s.location})]: ${s.livedExperience}${s.sensoryNote ? ` (Détail: ${s.sensoryNote})` : ''}`).join('\n');
    }
  }

  // Construction des messages
  const messages: AiMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Historique récent désensibilisé
  if (Array.isArray(body.history)) {
    const validHistory = body.history.slice(-6).filter(
      (h) => (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string'
    );
    for (const h of validHistory) {
      messages.push({ role: h.role, content: sanitizePrivacy(h.content.trim()) });
    }
  }

  messages.push({ role: 'user', content: message });

  try {
    // Garantie stricte 0,00 € : options.freeOnly = true interdit OpenAI/Anthropic
    const aiResult = await generateAiCompletion({
      messages,
      temperature: mode === 'coach' ? 0.6 : 0.7,
      max_tokens: 2500,
      freeOnly: true,
    });

    const durationMs = Date.now() - startTime;
    const validation = validateGardeFous(aiResult.content, 'b2c');

    // Journalisation de la requête (désensibilisée)
    await logAiRequest({
      apiKeyId: auth.keyId,
      agentName: auth.agentName || 'mobile_apk',
      endpoint: '/api/ai/mobile-brain',
      model: aiResult.model || GEMINI_MODEL,
      promptPreview: `[Mode: ${mode}] ${message.slice(0, 100)}`,
      statusCode: 200,
      durationMs,
      error: null,
    });

    // Enregistrement optionnel dans copilot_generations si Supabase est configuré
    const sb = getSupabase();
    if (sb) {
      const { error: insertErr } = await sb.from('copilot_generations').insert({
        mode: `mobile_${mode}`,
        prompt: message,
        result: sanitizePrivacy(aiResult.content),
        provider: aiResult.provider,
        model: aiResult.model,
        score: validation.score,
        forbidden_found: validation.forbiddenFound,
      });
      if (insertErr && insertErr.code !== 'PGRST205' && insertErr.code !== '42P01') {
        console.warn('[mobile-brain] enregistrement historique refusé :', insertErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResult.content,
      mode,
      provider: aiResult.provider,
      model: aiResult.model,
      duration_ms: durationMs,
      garde_fous: {
        passed: validation.passed,
        forbidden_found: validation.forbiddenFound,
      },
    });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[mobile-brain] Erreur génération :', msg);

    await logAiRequest({
      apiKeyId: auth.keyId,
      agentName: auth.agentName || 'mobile_apk',
      endpoint: '/api/ai/mobile-brain',
      model: GEMINI_MODEL,
      promptPreview: `[Mode: ${mode}] ${message.slice(0, 100)}`,
      statusCode: 502,
      durationMs,
      error: msg,
    });

    return NextResponse.json(
      { error: 'Le Cerveau Heldonica n’a pas pu formuler de réponse : ' + msg },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    return auth.response || NextResponse.json({ error: auth.error || 'Non autorisé' }, { status: auth.status || 401 });
  }

  return NextResponse.json({
    status: 'online',
    version: '1.0.0',
    device_target: 'Xiaomi Poco X6 Pro & Clients Mobiles Heldonica',
    modes_supported: Object.keys(SYSTEM_PROMPTS),
    auth_agent: auth.agentName,
    zero_key_enforced: true,
  });
}
