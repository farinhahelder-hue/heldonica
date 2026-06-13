// ============================================================
// /api/agents/dispatch - Heldonica CMS
// Declenche les agents IA directement via leurs APIs
// POST { agent, task, context?, label? }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'farinhahelder-hue';
const GITHUB_REPO = 'heldonica';

// Direct API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

type AgentType = 'gemini' | 'claude' | 'perplexity' | 'openhands' | 'jules';

interface DispatchPayload {
  agent: AgentType;
  task: string;
  context?: string;
  label?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: string;
}

// =============================================================================
// AGENT CONFIGURATION
// =============================================================================

const AGENT_CONFIG: Record<AgentType, {
  label: string;
  emoji: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyEnvVar: string;
  status: 'direct' | 'cloud' | 'beta';
}> = {
  gemini: {
    label: 'gemini',
    emoji: '✨',
    description: 'Gemini generera le contenu via l\'API Google directe',
    requiresApiKey: true,
    apiKeyEnvVar: 'GEMINI_API_KEY',
    status: 'direct',
  },
  claude: {
    label: 'claude',
    emoji: '🤖',
    description: 'Claude (Anthropic) traitera la tache via API directe',
    requiresApiKey: true,
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    status: 'direct',
  },
  perplexity: {
    label: 'perplexity',
    emoji: '🔍',
    description: 'Perplexity repondra a vos questions en temps reel',
    requiresApiKey: true,
    apiKeyEnvVar: 'PERPLEXITY_API_KEY',
    status: 'direct',
  },
  openhands: {
    label: 'openhands',
    emoji: '🌿',
    description: 'OpenHands necessite un compte AllHands Cloud',
    requiresApiKey: false,
    apiKeyEnvVar: '',
    status: 'cloud',
  },
  jules: {
    label: 'jules',
    emoji: '⚡',
    description: 'Jules est en programme Google beta prive',
    requiresApiKey: false,
    apiKeyEnvVar: '',
    status: 'beta',
  },
};

// =============================================================================
// GITHUB ISSUE CREATION
// =============================================================================

async function createGitHubIssue(payload: DispatchPayload) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN non configure');
  }

  const config = AGENT_CONFIG[payload.agent];
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
    config.description,
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

// =============================================================================
// DIRECT API CALLS
// =============================================================================

async function callGemini(task: string, context?: string): Promise<{ response: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY non configuree');
  }

  const fullPrompt = context 
    ? `Contexte: ${context}\n\nTache: ${task}`
    : task;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Reponse vide';
  
  return {
    response: responseText,
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

async function callClaude(task: string, context?: string): Promise<{ response: string; usage?: { input_tokens: number; output_tokens: number } }> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configuree');
  }

  const fullPrompt = context 
    ? `Contexte additionnel:\n${context}\n\n---\n\nTache:\n${task}`
    : task;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: 'Tu es un assistant utile. Reponds en francais.' },
        { role: 'user', content: fullPrompt }
      ],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.content?.[0]?.text || 'Reponse vide';
  
  return {
    response: responseText,
    usage: {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
    },
  };
}

async function callPerplexity(task: string, context?: string): Promise<{ response: string; usage?: { total_tokens: number; prompt_tokens?: number; completion_tokens?: number } }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY non configuree');
  }

  const fullPrompt = context 
    ? `Contexte: ${context}\n\nQuestion: ${task}`
    : task;

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'Tu es un assistant utile. Reponds en francais.' },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.choices?.[0]?.message?.content
    || data.choices?.[0]?.text
    || data.content
    || data.response
    || data.text
    || 'Reponse vide';
  
  return {
    response: responseText,
    usage: {
      total_tokens: data.usage?.total_tokens || 0,
      prompt_tokens: data.usage?.prompt_tokens || 0,
      completion_tokens: data.usage?.completion_tokens || 0,
    },
  };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

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

    const validAgents: AgentType[] = ['gemini', 'claude', 'perplexity', 'openhands', 'jules'];
    if (!validAgents.includes(payload.agent)) {
      return NextResponse.json(
        { error: `Agent invalide. Valeurs acceptees: ${validAgents.join(', ')}` },
        { status: 400 }
      );
    }

    const config = AGENT_CONFIG[payload.agent];
    const result: {
      success: boolean;
      agent: AgentType;
      status: string;
      response?: string;
      error?: string;
      usage?: Record<string, number>;
      github?: { issue_number: number; issue_url: string };
    } = {
      success: false,
      agent: payload.agent,
      status: config.status,
    };

    // Check if API key is required but not configured
    if (config.requiresApiKey && !process.env[config.apiKeyEnvVar]) {
      return NextResponse.json({
        ...result,
        success: false,
        error: `${config.apiKeyEnvVar} non configuree`,
      }, { status: 400 });
    }

    // Handle based on agent type
    switch (payload.agent) {
      case 'gemini':
        const geminiResult = await callGemini(payload.task, payload.context);
        result.success = true;
        result.response = geminiResult.response;
        result.usage = geminiResult.usage;
        break;

      case 'claude':
        const claudeResult = await callClaude(payload.task, payload.context);
        result.success = true;
        result.response = claudeResult.response;
        result.usage = claudeResult.usage;
        break;

      case 'perplexity':
        const perplexityResult = await callPerplexity(payload.task, payload.context);
        result.success = true;
        result.response = perplexityResult.response;
        result.usage = perplexityResult.usage;
        break;

      case 'openhands':
        // OpenHands requires AllHands Cloud
        if (!GITHUB_TOKEN) {
          result.error = 'GITHUB_TOKEN non configure pour notifier OpenHands';
        } else {
          const issue = await createGitHubIssue({ ...payload, label: 'openhands' });
          result.success = true;
          result.github = {
            issue_number: issue.number,
            issue_url: issue.html_url,
          };
          result.response = `Issue GitHub creee: #${issue.number}`;
        }
        break;

      case 'jules':
        // Jules is in Google beta - notify via GitHub
        if (!GITHUB_TOKEN) {
          result.error = 'GITHUB_TOKEN non configure pour notifier Jules';
        } else {
          const issue = await createGitHubIssue({ ...payload, label: 'jules' });
          result.success = true;
          result.github = {
            issue_number: issue.number,
            issue_url: issue.html_url,
          };
          result.response = `Issue GitHub creee: #${issue.number}`;
        }
        break;
    }

    return NextResponse.json({
      ...result,
      dispatched_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[agents/dispatch] Error:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors du dispatch',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// GET - Status endpoint
export async function GET() {
  const agents = Object.entries(AGENT_CONFIG).map(([key, cfg]) => ({
    id: key,
    ...cfg,
    apiKeyConfigured: cfg.apiKeyEnvVar ? !!process.env[cfg.apiKeyEnvVar] : null,
  }));

  return NextResponse.json({
    status: 'active',
    endpoint: 'POST /api/agents/dispatch',
    agents,
    required_env: ['GITHUB_TOKEN', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY'],
  });
}