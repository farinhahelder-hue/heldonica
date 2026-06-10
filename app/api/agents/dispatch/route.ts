// ============================================================
// /api/agents/dispatch - Heldonica CMS
// Declenche Jules, AllHands ou Gemini depuis le panneau admin
// POST { agent, task, context?, label? }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'farinhahelder-hue';
const GITHUB_REPO = 'heldonica';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_AGENTS_URL;

type AgentType = 'jules' | 'allhands' | 'gemini' | 'all';

interface DispatchPayload {
  agent: AgentType;
  task: string;
  context?: string;       // Contexte optionnel (ex: ID article, slug destination)
  label?: string;         // Label GitHub supplementaire
  priority?: 'high' | 'medium' | 'low';
  source?: string;        // 'cms-admin' | 'n8n' | 'github'
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
      desc: 'Gemini va generer le contenu SEO via n8n.',
    },
    all: {
      label: 'ai-task',
      emoji: '🚀',
      desc: 'Tous les agents sont notifies.',
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

async function triggerN8nWebhook(payload: DispatchPayload) {
  if (!N8N_WEBHOOK_URL) return null;

  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: payload.agent,
      task: payload.task,
      context: payload.context,
      source: payload.source || 'cms-admin',
      timestamp: new Date().toISOString(),
    }),
  });

  return res.ok ? res.json() : null;
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

    const validAgents: AgentType[] = ['jules', 'allhands', 'gemini', 'all'];
    if (!validAgents.includes(payload.agent)) {
      return NextResponse.json(
        { error: `Agent invalide. Valeurs acceptees: ${validAgents.join(', ')}` },
        { status: 400 }
      );
    }

    const results: Record<string, unknown> = {};

    // Pour Jules et AllHands: creer une issue GitHub avec le bon label
    if (payload.agent === 'jules' || payload.agent === 'allhands' || payload.agent === 'all') {
      const issue = await createGitHubIssue(payload);
      results.github = {
        issue_number: issue.number,
        issue_url: issue.html_url,
        title: issue.title,
      };
    }

    // Pour Gemini (et all): trigger n8n webhook
    if (payload.agent === 'gemini' || payload.agent === 'all') {
      const n8nResult = await triggerN8nWebhook(payload);
      results.n8n = n8nResult || { status: 'webhook_not_configured' };
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
        error: 'Erreur lors du dispatch',
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
    },
    agents: ['jules', 'allhands', 'gemini', 'all'],
    required_env: ['GITHUB_TOKEN', 'N8N_WEBHOOK_AGENTS_URL'],
  });
}
