// ============================================================
// /api/agents/dispatch - Heldonica CMS
// Déclenche les agents IA depuis le panneau admin
// POST { agent, task, context?, label? }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'farinhahelder-hue';
const GITHUB_REPO = 'heldonica';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

type AgentType = 'jules' | 'allhands' | 'gemini' | 'claude' | 'perplexity';

interface DispatchPayload {
  agent: AgentType;
  task: string;
  context?: string;
  label?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: string;
}

// Error codes for better client-side handling
export const AgentErrorCodes = {
  MISSING_GITHUB_TOKEN: 'MISSING_GITHUB_TOKEN',
  MISSING_GEMINI_API_KEY: 'MISSING_GEMINI_API_KEY',
  MISSING_ANTHROPIC_API_KEY: 'MISSING_ANTHROPIC_API_KEY',
  MISSING_PERPLEXITY_API_KEY: 'MISSING_PERPLEXITY_API_KEY',
  GITHUB_API_ERROR: 'GITHUB_API_ERROR',
  GEMINI_API_ERROR: 'GEMINI_API_ERROR',
  ANTHROPIC_API_ERROR: 'ANTHROPIC_API_ERROR',
  PERPLEXITY_API_ERROR: 'PERPLEXITY_API_ERROR',
} as const;

// Call Gemini API directly
async function callGeminiAPI(task: string, context?: string): Promise<{ response: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = context
    ? `Contexte: ${context}\n\nTâche: ${task}\n\nRéponds de manière détaillée et utile.`
    : `Tâche: ${task}\n\nRéponds de manière détaillée et utile.`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse vide';

  return { response: responseText };
}

// Call Claude API directly
async function callClaudeAPI(task: string, context?: string): Promise<{ response: string }> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const prompt = context
    ? `Contexte: ${context}\n\nTâche: ${task}`
    : `Tâche: ${task}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241107',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.content?.[0]?.text || 'Réponse vide';

  return { response: responseText };
}

// Call Perplexity API directly
async function callPerplexityAPI(task: string): Promise<{ response: string }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const url = 'https://api.perplexity.ai/chat/completions';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant de recherche web intelligent. Réponds de manière concise et informative.',
        },
        { role: 'user', content: task },
      ],
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.choices?.[0]?.message?.content || 'Réponse vide';

  return { response: responseText };
}

async function createGitHubIssue(payload: DispatchPayload) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN non configure');
  }

  const agentConfig: Record<AgentType, { label: string; emoji: string; desc: string }> = {
    jules: {
      label: 'jules',
      emoji: '⚡',
      desc: 'Jules va analyser et implementer cette tache automatiquement.',
    },
    allhands: {
      label: 'allhands',
      emoji: '🤖',
      desc: 'OpenHands va traiter cette tache en session dev complete.',
    },
    gemini: {
      label: 'gemini-content',
      emoji: '✨',
      desc: 'Gemini va generer le contenu via l\'API Google.',
    },
    claude: {
      label: 'claude-content',
      emoji: '🧠',
      desc: 'Claude va generer le contenu via l\'API Anthropic.',
    },
    perplexity: {
      label: 'perplexity',
      emoji: '🔍',
      desc: 'Perplexity va effectuer une recherche web intelligente.',
    },
  };

  const config = agentConfig[payload.agent];
  const date = new Date().toISOString().split('T')[0];
  const priorityLabel = payload.priority === 'high' ? 'priorite-haute' : undefined;

  const labels = [config.label, 'cms-dispatch'];
  if (payload.label) labels.push(payload.label);
  if (priorityLabel) labels.push(priorityLabel);

  const body = [
    `## ${config.emoji} Tache dispatchee depuis Heldonica CMS`,
    '',
    `**Agent**: ${payload.agent}`,
    `**Tache**: ${payload.task}`,
    `**Date**: ${date}`,
    `**Source**: ${payload.source || 'cms-admin'}`,
    payload.priority ? `**Priorite**: ${payload.priority}` : '',
    '',
    config.desc,
    '',
    payload.context ? `### Contexte\n\`\`\`\n${payload.context}\n\`\`\`` : '',
    '',
    '### Stack de reference',
    '- Framework: Next.js 14 App Router (TypeScript)',
    '- BDD: Supabase (PostgreSQL)',
    '- Deploy: Vercel',
    '- CMS: /cms-admin + /panel-manager',
    '',
    '### Fichiers de reference',
    '- `JULES_TASKS.md` - Backlog sprint',
    '- `JULES_MEMORY.md` - Historique sessions',
    '- `.jules/CONTEXT.md` - Stack complete',
    '',
    '---',
    `_Dispatche depuis le CMS Heldonica admin le ${new Date().toISOString()}_`,
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[${payload.agent.toUpperCase()}] ${payload.task}`,
        body,
        labels,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const payload: DispatchPayload = await req.json();

    // Validation
    if (!payload.agent || !payload.task) {
      return NextResponse.json(
        { error: 'Champs requis: agent, task' },
        { status: 400 }
      );
    }

    const validAgents: AgentType[] = ['jules', 'allhands', 'gemini', 'claude', 'perplexity'];
    if (!validAgents.includes(payload.agent)) {
      return NextResponse.json(
        { error: `Agent invalide. Valeurs acceptees: ${validAgents.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for required env vars based on agent
    if (payload.agent === 'jules') {
      if (!GITHUB_TOKEN) {
        return NextResponse.json(
          {
            error: '⚫ Programme Google en beta',
            code: 'JULES_BETA',
            details: 'Jules est actuellement en programme beta de Google. Demandez un accès sur https://aistudio.google.com/',
            suggestion: 'Utilisez Claude, Gemini ou Perplexity pour le moment.',
          },
          { status: 501 }
        );
      }
    }

    if (payload.agent === 'allhands') {
      return NextResponse.json(
        {
          error: '⚫ Necessite AllHands Cloud',
          code: 'ALLHANDS_CLOUD_REQUIRED',
          details: 'OpenHands necessite un compte AllHands Cloud pour fonctionner.',
          suggestion: 'Visitez https://app.all-hands.dev pour configurer OpenHands.',
        },
        { status: 501 }
      );
    }

    if (payload.agent === 'gemini') {
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          {
            error: '❌ Clé API Gemini manquante',
            code: 'MISSING_GEMINI_API_KEY',
            details: 'La variable GEMINI_API_KEY doit être configurée dans Vercel.',
            action: 'Ajouter GEMINI_API_KEY dans les variables d\'environnement Vercel',
          },
          { status: 503 }
        );
      }
    }

    if (payload.agent === 'claude') {
      if (!ANTHROPIC_API_KEY) {
        return NextResponse.json(
          {
            error: '❌ Clé API Anthropic manquante',
            code: 'MISSING_ANTHROPIC_API_KEY',
            details: 'La variable ANTHROPIC_API_KEY doit être configurée dans Vercel.',
            action: 'Ajouter ANTHROPIC_API_KEY dans les variables d\'environnement Vercel',
          },
          { status: 503 }
        );
      }
    }

    if (payload.agent === 'perplexity') {
      if (!PERPLEXITY_API_KEY) {
        return NextResponse.json(
          {
            error: '❌ Clé API Perplexity manquante',
            code: 'MISSING_PERPLEXITY_API_KEY',
            details: 'La variable PERPLEXITY_API_KEY doit être configurée dans Vercel.',
            action: 'Ajouter PERPLEXITY_API_KEY dans les variables d\'environnement Vercel',
          },
          { status: 503 }
        );
      }
    }

    const results: Record<string, unknown> = {};

    // Handle Jules - GitHub issue creation
    if (payload.agent === 'jules') {
      try {
        const issue = await createGitHubIssue(payload);
        results.github = {
          issue_number: issue.number,
          issue_url: issue.html_url,
          title: issue.title,
        };
      } catch (err) {
        console.error('[agents/dispatch] GitHub issue creation failed:', err);
        return NextResponse.json(
          {
            error: '❌ Erreur lors de la création de l\'issue GitHub',
            code: 'GITHUB_API_ERROR',
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }

    // Handle Gemini - Direct API call
    if (payload.agent === 'gemini') {
      try {
        const geminiResult = await callGeminiAPI(payload.task, payload.context);
        results.agent = geminiResult;
      } catch (err) {
        console.error('[agents/dispatch] Gemini API failed:', err);
        return NextResponse.json(
          {
            error: '❌ Erreur lors de l\'appel à Gemini',
            code: 'GEMINI_API_ERROR',
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }

    // Handle Claude - Direct API call
    if (payload.agent === 'claude') {
      try {
        const claudeResult = await callClaudeAPI(payload.task, payload.context);
        results.agent = claudeResult;
      } catch (err) {
        console.error('[agents/dispatch] Claude API failed:', err);
        return NextResponse.json(
          {
            error: '❌ Erreur lors de l\'appel à Claude',
            code: 'ANTHROPIC_API_ERROR',
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }

    // Handle Perplexity - Direct API call
    if (payload.agent === 'perplexity') {
      try {
        const perplexityResult = await callPerplexityAPI(payload.task);
        results.agent = perplexityResult;
      } catch (err) {
        console.error('[agents/dispatch] Perplexity API failed:', err);
        return NextResponse.json(
          {
            error: '❌ Erreur lors de l\'appel à Perplexity',
            code: 'PERPLEXITY_API_ERROR',
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      agent: payload.agent,
      task: payload.task,
      dispatched_at: new Date().toISOString(),
      results,
    });
  } catch (err) {
    console.error('[agents/dispatch] Error:', err);
    return NextResponse.json(
      {
        error: '❌ Erreur lors du dispatch',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// GET - Verifier que la route est active
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoints: {
      dispatch: 'POST /api/agents/dispatch',
      status: 'GET /api/agents/status',
      config: 'GET /api/agents/config',
    },
    agents: ['jules', 'allhands', 'gemini', 'claude', 'perplexity'],
    required_env: {
      GITHUB_TOKEN: 'GitHub Personal Access Token (scope: repo)',
      GEMINI_API_KEY: 'Clé API Gemini (Google AI Studio)',
      ANTHROPIC_API_KEY: 'Clé API Anthropic',
      PERPLEXITY_API_KEY: 'Clé API Perplexity',
    },
  });
}
