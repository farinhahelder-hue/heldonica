// ============================================================
// /api/agents/status - Heldonica CMS
// Lit l’etat des issues/PRs des agents IA depuis GitHub
// Utilise par l’onglet Agents du CMS admin pour afficher l’historique
// GET ?agent=jules|allhands|gemini|all&limit=10
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'farinhahelder-hue';
const GITHUB_REPO = 'heldonica';

const AGENT_LABELS: Record<string, string[]> = {
  jules: ['jules'],
  allhands: ['allhands'],
  gemini: ['gemini-content'],
  all: ['jules', 'allhands', 'gemini-content', 'ai-task', 'cms-dispatch'],
};

async function fetchGitHubIssues(labels: string[], limit: number) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN non configure');

  const labelQuery = labels.join(',');
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=${labelQuery}&state=all&per_page=${limit}&sort=created&direction=desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 30 }, // Cache 30s
  });

  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

async function fetchGitHubPRs(limit: number) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN non configure');

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=all&per_page=${limit}&sort=created&direction=desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error(`GitHub API error PRs ${res.status}`);
  const allPRs = await res.json();

  // Filtrer uniquement les PRs des bots IA
  return allPRs.filter(
    (pr: { user: { login: string } }) =>
      pr.user.login.includes('jules') ||
      pr.user.login.includes('openhands') ||
      pr.user.login.includes('bot')
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agent = (searchParams.get('agent') || 'all') as string;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const includePRs = searchParams.get('prs') !== 'false';

    const validAgents = ['jules', 'allhands', 'gemini', 'all'];
    if (!validAgents.includes(agent)) {
      return NextResponse.json(
        { error: `Agent invalide. Valeurs: ${validAgents.join(', ')}` },
        { status: 400 }
      );
    }

    const labels = AGENT_LABELS[agent] || AGENT_LABELS.all;

    // Fetch issues et PRs en parallele
    const [rawIssues, aiPRs] = await Promise.all([
      fetchGitHubIssues(labels, limit),
      includePRs ? fetchGitHubPRs(limit) : Promise.resolve([]),
    ]);

    // Formater les issues pour le CMS
    const issues = rawIssues
      .filter((issue: { pull_request?: object }) => !issue.pull_request) // Exclure les PRs deja dans issues
      .map((issue: {
        number: number;
        title: string;
        state: string;
        html_url: string;
        created_at: string;
        updated_at: string;
        labels: Array<{ name: string; color: string }>;
        user: { login: string; avatar_url: string };
        comments: number;
      }) => ({
        type: 'issue',
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels.map((l) => ({ name: l.name, color: l.color })),
        author: issue.user.login,
        avatar: issue.user.avatar_url,
        comments: issue.comments,
        agent: issue.labels.some((l) => l.name === 'jules')
          ? 'jules'
          : issue.labels.some((l) => l.name === 'allhands')
          ? 'allhands'
          : issue.labels.some((l) => l.name === 'gemini-content')
          ? 'gemini'
          : 'unknown',
      }));

    // Formater les PRs IA
    const prs = aiPRs.map((pr: {
      number: number;
      title: string;
      state: string;
      merged_at: string | null;
      html_url: string;
      created_at: string;
      updated_at: string;
      head: { ref: string };
      user: { login: string; avatar_url: string };
    }) => ({
      type: 'pr',
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? 'merged' : pr.state,
      url: pr.html_url,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      branch: pr.head.ref,
      author: pr.user.login,
      avatar: pr.user.avatar_url,
      agent: pr.user.login.includes('jules') ? 'jules' : 'allhands',
    }));

    // Stats
    const stats = {
      total_issues: issues.length,
      open_issues: issues.filter((i: { state: string }) => i.state === 'open').length,
      total_prs: prs.length,
      open_prs: prs.filter((p: { state: string }) => p.state === 'open').length,
      merged_prs: prs.filter((p: { state: string }) => p.state === 'merged').length,
      by_agent: {
        jules: [...issues, ...prs].filter((i) => i.agent === 'jules').length,
        allhands: [...issues, ...prs].filter((i) => i.agent === 'allhands').length,
        gemini: issues.filter((i: { agent: string }) => i.agent === 'gemini').length,
      },
    };

    return NextResponse.json({
      agent,
      fetched_at: new Date().toISOString(),
      stats,
      issues,
      prs,
    });
  } catch (err) {
    console.error('[agents/status] Error:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la recuperation du statut',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
