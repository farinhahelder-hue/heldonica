export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

let _cached: ReturnType<typeof createClient> | null = null;
function supabaseAdmin() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = (url && key) ? createClient(url, key) : null;
  }
  return _cached;
}

const BUCKET = 'media';
const AUTO_PUBLISH_FOLDER = 'auto-publish';

async function fetchUnsplashImage(keyword: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) return data.results[0].urls.regular;
  } catch (e) {
    console.error("Unsplash error", e);
  }
  return null;
}

async function generateContentWithGroq(imageContext: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const prompt = `Tu es un expert en voyages "slow travel", hors des sentiers battus. Ton ton est chaleureux, expert, curieux, non-commercial, tu utilises le "on" (couple de voyageurs).
G\u00e9n\u00e8re un article de blog et un post Instagram.
${imageContext ? `IMPORTANT : Le sujet DOIT correspondre \u00e0 l'image fournie, d\u00e9crite par les mots cl\u00e9s suivants : "${imageContext}".` : `Choisis un sujet au hasard parmi des p\u00e9pites cach\u00e9es en Europe (ex: Mad\u00e8re, Roumanie, Zurich, Paris secret).`}

Tu dois retourner UNIQUEMENT un objet JSON valide avec cette structure stricte :
{
  "title": "Titre accrocheur",
  "slug": "slug-url-optimise",
  "excerpt": "Un r\u00e9sum\u00e9 accrocheur d'environ 2 phrases",
  "content": "<p>Contenu de l'article en HTML</p>...",
  "category": "Carnets Voyage",
  "unsplashKeyword": "Mots cl\u00e9s en anglais pour chercher une photo (si pas de photo fournie)",
  "instagramCaption": "L\u00e9gende Instagram compl\u00e8te avec hashtags"
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) throw new Error(`Groq API error: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req as any);
  if (authResponse) return authResponse;

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: 'Supabase non configur\u00e9' }, { status: 503 })

  let imageUrl: string | null = null;
  let fileToMove: string | null = null;
  let newFilePath: string | null = null;
  let imageContextForAi: string = '';

  try {
    const { data: files, error } = await sb.storage.from(BUCKET).list(AUTO_PUBLISH_FOLDER, { limit: 10, sortBy: { column: 'created_at', order: 'asc' }});
    if (!error) {
      const images = files?.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f.name)) || [];
      if (images.length > 0) {
        const file = images[0];
        fileToMove = `${AUTO_PUBLISH_FOLDER}/${file.name}`;
        newFilePath = `articles/${file.name}`;

        const { data: newUrlData } = sb.storage.from(BUCKET).getPublicUrl(newFilePath);
        imageUrl = newUrlData.publicUrl;
        imageContextForAi = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      }
    }
  } catch (err) {
    console.error("Failed to list Supabase files", err);
  }

  let generatedData;
  try {
    generatedData = await generateContentWithGroq(imageContextForAi);
  } catch (err) {
    console.error("Groq generation failed", err);
    return NextResponse.json({ error: 'Content generation failed' }, { status: 500 });
  }

  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(generatedData.unsplashKeyword || 'slow travel nature');
  }

  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80';
  }

  let savedArticle = null;
  try {
    // published = false : l'article arrive en brouillon dans le CMS.
    // Relire, enrichir du v\u00e9cu terrain, puis publier manuellement.
    // instagram_caption est sauvegard\u00e9 pour \u00e9dition avant envoi manuel.
    const payload: any = {
      title: generatedData.title,
      slug: generatedData.slug,
      excerpt: generatedData.excerpt,
      content: generatedData.content,
      category: generatedData.category || 'Carnets Voyage',
      featured_image: imageUrl,
      published: false,
      instagram_caption: generatedData.instagramCaption || null,
      author: 'Heldonica',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await sb
      .from('cms_blog_posts')
      .insert([payload] as any)
      .select()
      .single();

    if (error) {
      console.error("Failed to save article to Supabase", error);
    } else {
      savedArticle = data;
    }
  } catch (err) {
    console.error("Error inserting article into database", err);
  }

  if (savedArticle && fileToMove && newFilePath) {
    try {
      const { error: moveError } = await sb.storage.from(BUCKET).move(fileToMove, newFilePath);
      if (moveError) {
        console.error(`Failed to move file from ${fileToMove} to ${newFilePath}`, moveError);
      }
    } catch (err) {
      console.error("Error during file move", err);
    }
  }

  // Instagram : d\u00e9sactiv\u00e9 ici.
  // La l\u00e9gende est sauvegard\u00e9e dans instagram_caption du brouillon.
  // Poster manuellement depuis le CMS apr\u00e8s relecture et \u00e9dition.

  return NextResponse.json({
    success: true,
    savedArticle,
    instagramPost: null,
    imageUrl,
    fileToMove,
    newFilePath
  })
}
