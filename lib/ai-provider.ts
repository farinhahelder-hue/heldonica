/**
 * lib/ai-provider.ts
 * Moteur universel de génération IA pour Heldonica avec cascade de fallback :
 * 1. Groq   2. Google Gemini   3. Mistral   4. Cerebras   5. OpenRouter
 * 6. OpenAI   7. Anthropic — seuls Groq et Gemini ont une clé en production.
 *
 * Les identifiants de modèles vivent ICI et nulle part ailleurs. Mesuré le
 * 21/09/2026 : « llama-3.3-70b-versatile » n'était plus servi par Groq et
 * « gemini-2.0-flash » était retiré par Google — le Copilote, « Partir d'une
 * idée », le carrousel et sa légende échouaient à chaque appel, sans qu'aucun
 * écran ne le dise. `npm run check:ai-models` interroge les fournisseurs avec
 * les clés locales et refuse un identifiant qui ne répond plus.
 */
export const GROQ_MODEL = 'openai/gpt-oss-120b';
export const GEMINI_MODEL = 'gemini-2.5-flash';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
  preferredProvider?: "groq" | "gemini" | "openrouter";
}

export interface AiCompletionResult {
  content: string;
  provider: 'groq' | 'gemini' | 'mistral' | 'cerebras' | 'openrouter' | 'openai' | 'anthropic' | 'none';
  model: string;
}

/**
 * Appel à Groq (OpenAI-compatible) — Tier gratuit
 */
async function callGroq(options: AiCompletionOptions, apiKey: string, sansJson = false): Promise<AiCompletionResult> {
  const model = GROQ_MODEL;
  const gptOss = model.startsWith('openai/gpt-oss');
  // Le raisonnement de gpt-oss se décompte des jetons de sortie : sous ~1500,
  // la réponse est vide et Groq rend « json_validate_failed ».
  const maxTokens = gptOss ? Math.max(options.max_tokens ?? 2000, 1500) : (options.max_tokens ?? 2000);
  const jsonMode = options.jsonMode && !sansJson;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: maxTokens,
      // Nos appels sont de la mise en forme, pas de la résolution de problème :
      // l'effort de raisonnement par défaut de gpt-oss consommait les jetons
      // (mesuré le 21/09/2026 : échecs intermittents ; avec « low », 1,7 s).
      ...(gptOss ? { reasoning_effort: 'low' } : {}),
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    // Le mode JSON strict de Groq refuse une génération qu'il juge invalide,
    // souvent vide. Nos appelants savent extraire un objet d'un texte : on
    // redemande une fois sans le mode strict avant de passer au fournisseur
    // suivant.
    if (jsonMode && errorText.includes('json_validate_failed')) {
      return callGroq(options, apiKey, true);
    }
    throw new Error(`Groq API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'groq', model };
}

/**
 * Appel à Google Gemini (REST API) — Tier gratuit
 */
async function callGemini(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemMsg = options.messages.find(m => m.role === 'system');
  const userAndAssistantMsgs = options.messages.filter(m => m.role !== 'system');

  const contents = userAndAssistantMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      // Gemini 2.5 « réfléchit » avant d'écrire et ces jetons se décomptent
      // de maxOutputTokens : avec 500, la légende revenait tronquée au milieu
      // d'un JSON (mesuré le 21/09/2026). Mise en forme : pas de réflexion.
      ...(model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };

  if (systemMsg) {
    payload.systemInstruction = {
      parts: [{ text: systemMsg.content }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { content, provider: 'gemini', model };
}

/**
 * Appel à Mistral AI (OpenAI-compatible) — Tier gratuit & excellent en français
 */
async function callMistral(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'mistral-small-latest';
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Mistral API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'mistral', model };
}

/**
 * Appel à Cerebras (OpenAI-compatible) — Inférence ultra-rapide & tier gratuit
 */
async function callCerebras(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'llama-3.3-70b';
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cerebras API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'cerebras', model };
}

/**
 * Appel à OpenRouter (OpenAI-compatible) — Agrégateur avec modèles gratuits
 */
async function callOpenRouter(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'meta-llama/llama-3.3-70b-instruct:free';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://www.heldonica.fr',
      'X-Title': 'Heldonica Editorial Copilot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'openrouter', model };
}

/**
 * Appel à OpenAI (Payant)
 */
async function callOpenAI(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'openai', model };
}

/**
 * Appel à Anthropic Claude (Payant)
 */
async function callAnthropic(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'claude-3-5-haiku-20241022';
  const systemMsg = options.messages.find(m => m.role === 'system');
  const userAndAssistantMsgs = options.messages.filter(m => m.role !== 'system');

  const messages = userAndAssistantMsgs.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system: systemMsg?.content,
      messages,
      max_tokens: options.max_tokens ?? 2000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text || '';
  return { content, provider: 'anthropic', model };
}

/**
 * Orchestrateur principal : tente les fournisseurs dans l'ordre de priorité :
 * 1. Groq (Gratuit, Llama 3.3 70B)
 * 2. Google Gemini (Gratuit, Gemini 2.0 Flash)
 * 3. Mistral AI (Gratuit, Mistral Small, excellent en français)
 * 4. Cerebras (Gratuit, Inférence Llama 3.3 70B ultra-rapide)
 * 5. OpenRouter (Gratuit, Modèles Llama / DeepSeek)
 * 6. OpenAI (Payant, GPT-4o-mini)
 * 7. Anthropic (Payant, Claude 3.5 Haiku)
 */
export async function generateAiCompletion(options: AiCompletionOptions): Promise<AiCompletionResult> {
  const errors: string[] = [];

  // 1. Groq (Gratuit)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      return await callGroq(options, groqKey);
    } catch (err: any) {
      console.warn('[AI Provider] Groq fallback:', err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // 2. Gemini (Gratuit)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await callGemini(options, geminiKey);
    } catch (err: any) {
      console.warn('[AI Provider] Gemini fallback:', err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  // 3. Mistral AI (Gratuit)
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey) {
    try {
      return await callMistral(options, mistralKey);
    } catch (err: any) {
      console.warn('[AI Provider] Mistral fallback:', err.message);
      errors.push(`Mistral: ${err.message}`);
    }
  }

  // 4. Cerebras (Gratuit)
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasKey) {
    try {
      return await callCerebras(options, cerebrasKey);
    } catch (err: any) {
      console.warn('[AI Provider] Cerebras fallback:', err.message);
      errors.push(`Cerebras: ${err.message}`);
    }
  }

  // 5. OpenRouter (Gratuit / Fallback)
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      return await callOpenRouter(options, openrouterKey);
    } catch (err: any) {
      console.warn('[AI Provider] OpenRouter fallback:', err.message);
      errors.push(`OpenRouter: ${err.message}`);
    }
  }

  // 6. OpenAI (Payant)
  const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (openaiKey) {
    try {
      return await callOpenAI(options, openaiKey);
    } catch (err: any) {
      console.warn('[AI Provider] OpenAI fallback:', err.message);
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  // 7. Anthropic (Payant)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      return await callAnthropic(options, anthropicKey);
    } catch (err: any) {
      console.warn('[AI Provider] Anthropic fallback:', err.message);
      errors.push(`Anthropic: ${err.message}`);
    }
  }

  throw new Error(`Aucun fournisseur d'IA n'est disponible ou configuré. Erreurs rencontrées : ${errors.join(' | ')}`);
}
