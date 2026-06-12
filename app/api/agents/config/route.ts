// ============================================================
// /api/agents/config - Heldonica CMS
// Retourne le statut de configuration de chaque agent IA
// GET - Retourne { agentId: { configured, missing, status, message } }
// ============================================================
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

  const agents = {
    allhands: {
      id: 'allhands',
      name: 'OpenHands (AllHands)',
      emoji: '🤖',
      description: 'Agent IA polyvalent avec accès au code et exécution de tâches',
      configured: false,
      missing: [],
      status: 'requires_cloud',
      message: '⚫ Necessite AllHands Cloud',
      color: '#01696f',
      usage: 'OpenHands necessite un compte AllHands Cloud pour fonctionner. Visitez https://app.all-hands.dev',
      beta: true,
    },
    jules: {
      id: 'jules',
      name: 'Jules (Google)',
      emoji: '🎯',
      description: 'Agent IA de développement de Google',
      configured: false,
      missing: [],
      status: 'beta_program',
      message: '⚫ Programme Google en beta',
      color: '#9333ea',
      usage: 'Jules est en programme beta. Demandez un accès sur https://aistudio.google.com/',
      beta: true,
    },
    gemini: {
      id: 'gemini',
      name: 'Gemini (Google)',
      emoji: '✨',
      description: 'Génère du contenu via l\'API Google Gemini',
      configured: Boolean(GEMINI_API_KEY),
      missing: GEMINI_API_KEY ? [] : ['GEMINI_API_KEY'],
      status: !GEMINI_API_KEY ? 'missing_key' : 'configured',
      message: GEMINI_API_KEY ? 'Prêt à générer du contenu' : '❌ Clé API Gemini manquante',
      color: '#2563eb',
      usage: 'Appel direct à l\'API Google Gemini pour générer du contenu SEO',
    },
    claude: {
      id: 'claude',
      name: 'Claude (Anthropic)',
      emoji: '🧠',
      description: 'Génère du contenu via l\'API Anthropic Claude',
      configured: Boolean(ANTHROPIC_API_KEY),
      missing: ANTHROPIC_API_KEY ? [] : ['ANTHROPIC_API_KEY'],
      status: !ANTHROPIC_API_KEY ? 'missing_key' : 'configured',
      message: ANTHROPIC_API_KEY ? 'Prêt à générer du contenu' : '❌ Clé API Anthropic manquante',
      color: '#dc7616',
      usage: 'Appel direct à l\'API Anthropic Claude pour générer du contenu',
    },
    perplexity: {
      id: 'perplexity',
      name: 'Perplexity',
      emoji: '🔍',
      description: 'Recherche web intelligente pour générer des captions',
      configured: Boolean(PERPLEXITY_API_KEY),
      missing: PERPLEXITY_API_KEY ? [] : ['PERPLEXITY_API_KEY'],
      status: !PERPLEXITY_API_KEY ? 'missing_key' : 'configured',
      message: PERPLEXITY_API_KEY ? 'Prêt à rechercher' : '❌ Clé API Perplexity manquante',
      color: '#10b981',
      usage: 'Appel direct à l\'API Perplexity pour la recherche web intelligente',
    },
  };

  // Summary
  const summary = {
    total: Object.keys(agents).length,
    configured: Object.values(agents).filter(a => a.status === 'configured').length,
    missing_key: Object.values(agents).filter(a => a.status === 'missing_key').length,
    beta_program: Object.values(agents).filter(a => a.status === 'beta_program').length,
    requires_cloud: Object.values(agents).filter(a => a.status === 'requires_cloud').length,
  };

  return NextResponse.json({
    agents,
    summary,
    required_env_vars: {
      GITHUB_TOKEN: 'GitHub Personal Access Token (scope: repo)',
      GEMINI_API_KEY: 'Clé API Gemini (Google AI Studio)',
      ANTHROPIC_API_KEY: 'Clé API Anthropic',
      PERPLEXITY_API_KEY: 'Clé API Perplexity',
    },
    timestamp: new Date().toISOString(),
  });
}