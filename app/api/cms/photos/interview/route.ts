import { NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import {
  generatePhotoInterviewQuestions,
  synthesizePhotoInterview,
} from '@/lib/cms-photo-interview';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cms/photos/interview
 * Endpoint sécurisé pour l'interview de terrain interactive des photos.
 */
export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  const action = body.action;

  // 1. Action : Génération de questions ciblées
  if (action === 'questions') {
    const imageUrl = body.imageUrl;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl obligatoire' }, { status: 400 });
    }

    const questions = generatePhotoInterviewQuestions({
      imageUrl,
      location: body.location,
      date: body.date,
    });

    return NextResponse.json({ success: true, ...questions });
  }

  // 2. Action : Synthèse des réponses vécues
  if (action === 'synthesize') {
    const answers = body.answers;
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers obligatoire' }, { status: 400 });
    }

    const synthesis = synthesizePhotoInterview(
      {
        sensory: answers.sensory || '',
        concrete: answers.concrete || '',
        counterpoint: answers.counterpoint || '',
      },
      body.meta
    );

    return NextResponse.json({ success: true, synthesis });
  }

  return NextResponse.json(
    { error: "Action non reconnue (attendu: 'questions' ou 'synthesize')" },
    { status: 400 }
  );
}
