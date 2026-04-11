import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to generate AI content using local Ollama
 * 
 * POST body:
 * {
 *   topic: string,      // Optional: topic for the post
 *   platform: string   // Optional: instagram, linkedin, twitter
 * }
 * 
 * Requires OLLAMA_URL environment variable (default: http://localhost:11434)
 * Requires OLLAMA_MODEL environment variable (default: llama3)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic = 'voyages', platform = 'instagram' } = body;

    // Get Ollama configuration
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

    // Build prompt based on platform
    let prompt = '';
    switch (platform) {
      case 'instagram':
        prompt = `Genere un post Instagram engageant pour Heldica (${topic}) en francais, environ 80-100 mots, avec des emojis et des hashtags pertinents. Le post doit etre professionnel et attractif pour des voyageurs.`;
        break;
      case 'linkedin':
        prompt = `Genere un post LinkedIn professionnel pour Heldica (${topic}) en francais, environ 150-200 mots, avec un ton expert et inspires la confiance. Inclus des tips concrets.`;
        break;
      case 'twitter':
        prompt = `Genere un tweet pour Heldica (${topic}) en francais, max 280 caracteres, accrocheur et avec un hashtag.`;
        break;
      default:
        prompt = `Genere un post engageant pour Heldica sur le theme: ${topic}. En francais, environ 100 mots.`;
    }

    // Call Ollama API
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
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Ollama API error', details: error },
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
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check Ollama configuration status
 */
export async function GET() {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

  try {
    // Test connection to Ollama
    const response = await fetch(`${ollamaUrl}/api/tags`);
    
    if (!response.ok) {
      return NextResponse.json({
        configured: false,
        message: `Cannot connect to Ollama at ${ollamaUrl}`,
      });
    }

    const models = await response.json();
    const modelExists = models.models?.some((m: any) => m.name.includes(ollamaModel.split(':')[0]));

    return NextResponse.json({
      configured: modelExists,
      message: modelExists 
        ? `Ollama is ready with model ${ollamaModel}`
        : `Model ${ollamaModel} not found. Available: ${models.models?.map((m: any) => m.name).join(', ')}`,
      availableModels: models.models,
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      message: `Cannot connect to Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}