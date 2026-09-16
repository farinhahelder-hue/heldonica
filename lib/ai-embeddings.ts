import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

/**
 * Génère un vecteur d'embedding 768 dimensions pour un texte donné.
 * Utilise le modèle `gemini-embedding-001` avec réduction de dimensionnalité à 768
 * pour un stockage optimisé et ultra-rapide dans PostgreSQL (pgvector).
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('[ai-embeddings] GEMINI_API_KEY non configurée');
    return null;
  }

  const texteNettoye = (text || '').trim().slice(0, 2048);
  if (!texteNettoye) return null;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: texteNettoye }] },
      outputDimensionality: 768,
    } as any);

    if (result.embedding?.values && result.embedding.values.length === 768) {
      return result.embedding.values;
    }

    console.warn('[ai-embeddings] Format d’embedding inattendu :', result.embedding?.values?.length);
    return null;
  } catch (err: unknown) {
    console.error('[ai-embeddings] Erreur génération embedding :', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Calcule la similarité cosinus entre deux vecteurs de même taille.
 * Valeur retournée entre -1 et 1 (1 = similarité sémantique parfaite).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

/**
 * Construit un passage sémantique riche à partir d'une destination.
 * Intègre : titre, pays, région, style de voyage, récit introductif, itinéraire et conseils secrets.
 */
export function buildDestinationSemanticText(dest: {
  title: string;
  country?: string | null;
  region?: string | null;
  travel_style?: string | null;
  excerpt?: string | null;
  intro_narrative?: string | null;
  local_insider_tips?: string | null;
  tags?: string[] | null;
  itinerary?: Array<{ day?: number; title: string; desc: string }> | null;
}): string {
  const parts: string[] = [];

  parts.push(`Destination : ${dest.title}`);
  if (dest.country) parts.push(`Pays : ${dest.country}`);
  if (dest.region) parts.push(`Région : ${dest.region}`);
  if (dest.travel_style) parts.push(`Style : ${dest.travel_style}`);
  if (dest.excerpt) parts.push(`Résumé : ${dest.excerpt}`);
  if (dest.intro_narrative) parts.push(`Ambiance & récit de terrain : ${dest.intro_narrative}`);
  if (dest.local_insider_tips) parts.push(`Conseils secrets : ${dest.local_insider_tips}`);
  if (dest.tags && dest.tags.length > 0) parts.push(`Tags : ${dest.tags.join(', ')}`);

  if (dest.itinerary && Array.isArray(dest.itinerary)) {
    const etapes = dest.itinerary
      .slice(0, 5)
      .map((it) => `${it.title} : ${it.desc}`)
      .join(' | ');
    if (etapes) parts.push(`Étapes : ${etapes}`);
  }

  return parts.join('\n\n');
}

/**
 * Construit un passage sémantique pour un article de blog.
 */
export function buildArticleSemanticText(post: {
  title: string;
  category?: string | null;
  excerpt?: string | null;
  content?: string | null;
  tags?: string[] | null;
}): string {
  const parts: string[] = [];

  parts.push(`Article : ${post.title}`);
  if (post.category) parts.push(`Catégorie : ${post.category}`);
  if (post.excerpt) parts.push(`Extrait : ${post.excerpt}`);
  if (post.tags && post.tags.length > 0) parts.push(`Tags : ${post.tags.join(', ')}`);

  if (post.content) {
    // Retirer balises Markdown simples et ne garder que le début
    const extraitCorps = post.content
      .replace(/[#*`_\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 800);
    parts.push(`Contenu : ${extraitCorps}`);
  }

  return parts.join('\n\n');
}
