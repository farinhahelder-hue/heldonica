import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { generateAiCompletion, JULES_MODEL, BRAIN_MODEL } from '@/lib/ai-provider';
import { createClient } from '@supabase/supabase-js';

const JULES_API_KEY = process.env.JULES_API_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const getSupabaseAdmin = () => {
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
};

export async function POST(request: NextRequest) {
  const authError = await requireCmsAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      target = 'gemini',
      prompt = '',
      title = '',
      branch = 'main',
    } = body;

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Le champ prompt est obligatoire' }, { status: 400 });
    }

    // 1. Cible : Google Jules (Agent GitHub autonome)
    if (target === 'jules') {
      if (!JULES_API_KEY) {
        return NextResponse.json(
          { error: 'Clé JULES_API_KEY non configurée dans l’environnement' },
          { status: 500 }
        );
      }

      const resJules = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': JULES_API_KEY,
        },
        body: JSON.stringify({
          prompt,
          title: title || prompt.slice(0, 50),
          sourceContext: {
            source: 'sources/github/farinhahelder-hue/heldonica',
            githubRepoContext: { startingBranch: branch || 'main' },
          },
          automationMode: 'MANUAL',
        }),
      });

      const dataJules = await resJules.json();
      if (!resJules.ok) {
        return NextResponse.json(
          { error: dataJules.error?.message || 'Erreur lors de la création de la session Jules' },
          { status: 500 }
        );
      }

      const sessionId = dataJules.id || String(dataJules.name)?.split('/').pop();
      const sessionUrl = dataJules.url || `https://jules.google.com/session/${sessionId}`;

      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error: errSession } = await supabase.from('jules_sessions').insert({
          id: sessionId,
          title: title || prompt.slice(0, 50),
          prompt,
          state: 'pending',
          source: 'sources/github/farinhahelder-hue/heldonica',
          url: sessionUrl,
        });
        if (errSession) {
          console.error('[jules] erreur insert session :', errSession.message);
        }

        const { error: errTask } = await supabase.from('agent_tasks').insert({
          agent: 'jules',
          title: title || prompt.slice(0, 50),
          description: prompt,
          status: 'in_progress',
          branch: branch || 'main',
          claimed_by: 'jules',
          claimed_at: new Date().toISOString(),
        });
        if (errTask) {
          console.error('[agent_tasks] erreur insert tache :', errTask.message);
        }
      }

      return NextResponse.json({
        success: true,
        target: 'jules',
        provider: 'Google Jules API',
        model: JULES_MODEL,
        sessionId,
        sessionUrl,
        result: `Session Jules lancée avec succès sur la branche ${branch}.\nSession active : ${sessionUrl}`,
      });
    }

    // 2. Cible : Heldonica Brain II Local (GTX 1660 Ti, localhost:8451 / 8440)
    if (target === 'brain') {
      try {
        const brainRes = await fetch('http://127.0.0.1:8451/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            stream: false,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (brainRes.ok) {
          const brainData = await brainRes.json();
          return NextResponse.json({
            success: true,
            target: 'brain',
            provider: 'Heldonica Brain II (Local)',
            model: BRAIN_MODEL,
            result: brainData.content || brainData.message || JSON.stringify(brainData),
          });
        }
      } catch {
        // En cas d'indisponibilité du service local, bascule transparente sur Gemini
      }
    }

    // 3. Cible : Tier Gratuit Gemini 2.5 Flash / Groq via lib/ai-provider.ts
    const systemInstruction = `Tu es l'assistant éditorial et technique officiel d'Heldonica (slow travel d'auteur).
Règles absolues de marque :
- Voix : « on » pour le duo fondateur, « tu » pour le voyageur, « vous » pour les hôteliers.
- AUCUN mot sensationnaliste ou bannis : interdit d'utiliser "parfait", "incroyable", "magique", "incontournable", "bons plans", "secret jalousement gardé", "époustouflant".
- Réalité vécue et vérifiable : jamais de faux avis ou de données inventées.
- Style : carnet de route noble, précis, chaleureux et sobre.`;

    const preferredProvider = target === 'groq' ? 'groq' : 'gemini';

    const aiRes = await generateAiCompletion({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
      freeOnly: true,
      preferredProvider,
    });

    return NextResponse.json({
      success: true,
      target,
      provider: aiRes.provider,
      model: aiRes.model,
      result: aiRes.content,
    });
  } catch (error: any) {
    console.error('[agent-task-giver] Erreur :', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne lors de la distribution de tâche' },
      { status: 500 }
    );
  }
}
