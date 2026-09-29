import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';

export const dynamic = 'force-dynamic';

/**
 * Endpoint d'intégration CrewAI Studio pour Heldonica.
 * Déclenche une équipe multi-agents autonome configurée dans CrewAI Studio (Project 69bb8b74-8ff6-4b55-9f3b-53d235824614).
 */
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const { destination, topic = 'Carnet Slow Travel', notes = '' } = await req.json();

    const apiKey = process.env.CREWAI_API_KEY || process.env.CREW_AI_TOKEN;
    const projectId = process.env.CREWAI_PROJECT_ID || '69bb8b74-8ff6-4b55-9f3b-53d235824614';

    if (!destination) {
      return NextResponse.json({ error: 'Destination requise' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        warning: 'Clé CREWAI_API_KEY non configurée dans .env.local',
        instructions: 'Ajoutez CREWAI_API_KEY="votre_token_crewai" dans .env.local',
        simulated: true,
        projectId,
        destination,
      });
    }

    // Appel à l'API Cloud de CrewAI Studio (V2 / Kickoff)
    const res = await fetch(`https://api.crewai.com/v1/projects/${projectId}/kickoff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          destination,
          topic,
          notes,
          brand_voice: 'Heldonica Slow Travel — voix duo, pas de mots bannis',
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Échec Kickoff CrewAI Studio (${res.status}): ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      projectId,
      destination,
      crewRunId: data.id || data.kickoff_id,
      status: data.status || 'STARTED',
      result: data.result || data.output,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur CrewAI' }, { status: 500 });
  }
}
