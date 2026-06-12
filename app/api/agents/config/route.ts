// ============================================================
// /api/agents/config - Heldonica CMS
// Retourne le statut de configuration de chaque agent IA
// GET - Retourne { agentId: { configured, missing, status, message } }
// ============================================================
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const JULES_API_KEY = process.env.JULES_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const N8N_WEBHOOK_AGENTS_URL = process.env.N8N_WEBHOOK_AGENTS_URL;

  const agents = {
    allhands: {
      id: 'allhands',
      name: 'OpenHands (AllHands)',
      emoji: '🤖',
      description: 'Agent IA polyvalent avec accès au code et exécution de tâches',
      configured: Boolean(GITHUB_TOKEN),
      missing: GITHUB_TOKEN ? [] : ['GITHUB_TOKEN'],
      status: GITHUB_TOKEN ? 'configured' : 'missing_key',
      message: GITHUB_TOKEN ? 'Prêt à envoyer des tâches' : '❌ Clé API GitHub manquante',
      color: '#01696f',
      usage: 'Crée une issue GitHub avec le label "allhands" qui déclenche OpenHands',
    },
    jules: {
      id: 'jules',
      name: 'Jules (Google)',
      emoji: '🎯',
      description: 'Agent IA de Google pour le développement',
      configured: Boolean(JULES_API_KEY),
      missing: JULES_API_KEY ? [] : ['JULES_API_KEY'],
      status: JULES_API_KEY ? 'configured' : 'missing_key',
      message: JULES_API_KEY ? 'Prêt à envoyer des tâches' : '❌ Clé API Jules manquante',
      color: '#9333ea',
      usage: 'Crée une issue GitHub avec le label "jules" qui déclenche Jules',
    },
    gemini: {
      id: 'gemini',
      name: 'Gemini (Google)',
      emoji: '✨',
      description: 'Génère du contenu SEO via Gemini AI',
      configured: Boolean(N8N_WEBHOOK_AGENTS_URL && GEMINI_API_KEY),
      missing: [
        ...(N8N_WEBHOOK_AGENTS_URL ? [] : ['N8N_WEBHOOK_AGENTS_URL']),
        ...(GEMINI_API_KEY ? [] : ['GEMINI_API_KEY']),
      ],
      status: !N8N_WEBHOOK_AGENTS_URL ? 'not_configured' : !GEMINI_API_KEY ? 'missing_key' : 'configured',
      message: !N8N_WEBHOOK_AGENTS_URL
        ? '⚠️ Webhook n8n non configuré'
        : !GEMINI_API_KEY
        ? '❌ Clé API Gemini manquante'
        : 'Prêt à envoyer des tâches',
      color: '#2563eb',
      usage: 'Déclenche un workflow n8n qui utilise Gemini pour générer du contenu',
    },
    perplexity: {
      id: 'perplexity',
      name: 'Perplexity',
      emoji: '🔍',
      description: 'Recherche web intelligente pour générer des captions Instagram',
      configured: false,
      missing: ['PERPLEXITY_API_KEY'],
      status: 'not_implemented',
      message: '⚠️ Integration en cours de développement',
      color: '#10b981',
      usage: 'Ouvre Perplexity dans le navigateur pour générer des captions',
    },
  };

  // Summary
  const summary = {
    total: Object.keys(agents).length,
    configured: Object.values(agents).filter(a => a.status === 'configured').length,
    missing_key: Object.values(agents).filter(a => a.status === 'missing_key').length,
    not_configured: Object.values(agents).filter(a => a.status === 'not_configured').length,
    not_implemented: Object.values(agents).filter(a => a.status === 'not_implemented').length,
  };

  return NextResponse.json({
    agents,
    summary,
    required_env_vars: {
      GITHUB_TOKEN: 'GitHub Personal Access Token (scope: repo)',
      JULES_API_KEY: 'Clé API Jules (Google AI Studio)',
      GEMINI_API_KEY: 'Clé API Gemini (Google AI Studio)',
      N8N_WEBHOOK_AGENTS_URL: 'URL webhook n8n pour les agents',
    },
    timestamp: new Date().toISOString(),
  });
}