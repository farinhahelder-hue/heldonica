import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';

/**
 * Route API pour générer du contenu IA via Ollama ou Brain local.
 *
 * Protégée par l'authentification CMS (requireCmsAuth).
 *
 * POST body:
 * {
 *   topic: string,      // Ex: "Madère", "Slow travel"
 *   platform: string   // "instagram", "linkedin", "twitter"
 * }
 */
export async function POST(request: NextRequest) {
  const authError = await requireCmsAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const { topic = 'voyages', platform = 'instagram' } = body;

    // Configuration Ollama / Brain local
    const ollamaUrl = process.env.OLLAMA_URL || process.env.BRAIN_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'dolphin3';

    // Construction du prompt selon la plateforme
    let prompt = '';
    switch (platform) {
      case 'instagram':
        prompt = `Génère un post Instagram engageant pour Heldonica (${topic}) en français, environ 80-100 mots, avec des emojis et des hashtags pertinents (#heldonica #slowtravel). Le post doit être authentique et inviter au voyage lent.`;
        break;
      case 'linkedin':
        prompt = `Génère un post LinkedIn professionnel pour Heldonica (${topic}) en français, environ 150-200 mots, avec un ton inspirant et réfléchi sur le slow travel. Inclus des conseils concrets.`;
        break;
      case 'twitter':
        prompt = `Génère un tweet pour Heldonica (${topic}) en français, max 280 caractères, percutant avec le hashtag #heldonica.`;
        break;
      default:
        prompt = `Génère un texte engageant pour Heldonica sur le thème : ${topic}. En français, environ 100 mots.`;
    }

    // Appel API Ollama avec timeout de 30 secondes
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return NextResponse.json(
        { error: 'Erreur API Ollama', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedContent = data.message?.content || '';

    return NextResponse.json({
      success: true,
      content: generatedContent,
      platform,
      topic,
    });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    return NextResponse.json(
      {
        error: 'Échec de la génération IA',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Vérifie la connectivité avec l'instance Ollama/Brain configurée
 */
export async function GET(request: NextRequest) {
  const authError = await requireCmsAuth(request);
  if (authError) return authError;

  const ollamaUrl = process.env.OLLAMA_URL || process.env.BRAIN_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'dolphin3';

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({
        configured: false,
        message: `Impossible de contacter Ollama sur ${ollamaUrl}`,
      });
    }

    const models = await response.json();
    const modelExists = models.models?.some((m: { name?: string }) =>
      m.name?.includes(ollamaModel.split(':')[0])
    );

    return NextResponse.json({
      configured: Boolean(modelExists),
      message: modelExists
        ? `Ollama est prêt avec le modèle ${ollamaModel}`
        : `Modèle ${ollamaModel} non trouvé. Disponibles : ${models.models?.map((m: { name?: string }) => m.name).join(', ') || 'aucun'}`,
      availableModels: models.models,
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      message: `Connexion Ollama impossible : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    });
  }
}
