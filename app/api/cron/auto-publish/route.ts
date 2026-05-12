export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { postToInstagram } from '@/lib/instagram'

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
Génère un article de blog et un post Instagram.
${imageContext ? `IMPORTANT : Le sujet DOIT correspondre à l'image fournie, décrite par les mots clés suivants : "${imageContext}".` : `Choisis un sujet au hasard parmi des pépites cachées en Europe (ex: Madère, Roumanie, Zurich, Paris secret).`}

Tu dois retourner UNIQUEMENT un objet JSON valide avec cette structure stricte :
{
  "title": "Titre accrocheur",
  "slug": "slug-url-optimise",
  "excerpt": "Un résumé accrocheur d'environ 2 phrases",
  "content": "<p>Contenu de l'article en HTML</p>...",
  "category": "Carnets Voyage",
  "unsplashKeyword": "Mots clés en anglais pour chercher une photo (si pas de photo fournie)",
  "instagramCaption": "Légende Instagram complète avec hashtags"
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
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

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

        // Advance generation of new URL for DB insertion
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
    const payload: any = {
      title: generatedData.title,
      slug: generatedData.slug,
      excerpt: generatedData.excerpt,
      content: generatedData.content,
      category: generatedData.category || 'Carnets Voyage',
      featured_image: imageUrl,
      published: true,
      author: 'Heldonica',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await sb
      .from('cms_blog_posts')
      .insert([payload])
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

  // Defer physical file move until after the article was saved successfully.
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

  let instagramPost = null;
  try {
    // If the file was not moved successfully because there was an error in saving the article,
    // the image URL we use for Instagram might not exist yet if it was a Supabase image predicting the future path.
    // However, Instagram needs a valid public URL. If the move failed, the image is still at `fileToMove`.
    // For safety, let's just use whatever `imageUrl` is. If the move failed, Instagram might fail too,
    // but the next cron run will retry the same image.
    if (imageUrl && generatedData.instagramCaption) {
      instagramPost = await postToInstagram(imageUrl, generatedData.instagramCaption);
      if (!instagramPost) {
         console.warn("Instagram posting returned null. Check INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID env variables.");
      }
    }
  } catch (err) {
     console.error("Error posting to Instagram", err);
  }

  return NextResponse.json({
    success: true,
    savedArticle,
    instagramPost,
    imageUrl,
    fileToMove,
    newFilePath
  })
}
