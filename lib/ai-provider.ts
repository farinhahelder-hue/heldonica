/**
 * lib/ai-provider.ts
 * Moteur universel de génération IA pour Heldonica avec cascade de fallback :
 * 1. Groq (Llama 3.3 / Llama 3)
 * 2. Google Gemini (Gemini 2.0 / 1.5 Flash)
 * 3. OpenAI (GPT-4o-mini)
 * 4. Anthropic (Claude 3.5 Haiku)
 */

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
}

export interface AiCompletionResult {
  content: string;
  provider: 'groq' | 'gemini' | 'openai' | 'anthropic' | 'none';
  model: string;
}

/**
 * Appel à Groq (OpenAI-compatible)
 */
async function callGroq(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'llama-3.3-70b-versatile';
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
      max_tokens: options.max_tokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { content, provider: 'groq', model };
}

/**
 * Appel à Google Gemini (REST API)
 */
async function callGemini(options: AiCompletionOptions, apiKey: string): Promise<AiCompletionResult> {
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Extraire le prompt système si présent
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
 * Appel à OpenAI
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
 * Appel à Anthropic Claude
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
 * Orchestrateur principal : tente les fournisseurs dans l'ordre de priorité
 */
export async function generateAiCompletion(options: AiCompletionOptions): Promise<AiCompletionResult> {
  const errors: string[] = [];

  // 1. Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      return await callGroq(options, groqKey);
    } catch (err: any) {
      console.warn('[AI Provider] Groq fallback:', err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // 2. Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await callGemini(options, geminiKey);
    } catch (err: any) {
      console.warn('[AI Provider] Gemini fallback:', err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  // 3. OpenAI
  const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (openaiKey) {
    try {
      return await callOpenAI(options, openaiKey);
    } catch (err: any) {
      console.warn('[AI Provider] OpenAI fallback:', err.message);
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  // 4. Anthropic
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
