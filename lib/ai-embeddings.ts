import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIM = 768;
const MAX_CHARS = 2048;
// L'API batchEmbedContents accepte 100 requêtes ; on garde une marge.
const BATCH_SIZE = 50;

/**
 * Rôle du texte pour le modèle : une requête de recherche et un passage stocké
 * ne sont pas plongés de la même façon. Les vecteurs en base sont produits en
 * RETRIEVAL_DOCUMENT (cron), les recherches en RETRIEVAL_QUERY — changer l'un
 * impose de régénérer l'autre (`/api/cron/embeddings?force=1`).
 */
export type EmbeddingTaskType = 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT';

function nettoyer(text: string): string {
  return (text || '').trim().slice(0, MAX_CHARS);
}

/**
 * Génère un vecteur d'embedding 768 dimensions pour un texte donné.
 * Utilise le modèle `gemini-embedding-001` avec réduction de dimensionnalité à 768
 * pour un stockage optimisé et ultra-rapide dans PostgreSQL (pgvector).
 */
export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTaskType = 'RETRIEVAL_QUERY'
): Promise<number[] | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('[ai-embeddings] GEMINI_API_KEY non configurée');
    return null;
  }

  const texteNettoye = nettoyer(text);
  if (!texteNettoye) return null;

  try {
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
    // `outputDimensionality` n'est pas dans les types du SDK 0.24 mais est
    // transmis tel quel à l'API — d'où le `as any`.
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: texteNettoye }] },
      taskType,
      outputDimensionality: EMBEDDING_DIM,
    } as any);

    if (result.embedding?.values && result.embedding.values.length === EMBEDDING_DIM) {
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
 * Même chose pour une liste de textes, par lots de 50 en un seul appel API
 * chacun. Renvoie un tableau aligné sur l'entrée : `null` là où le texte était
 * vide ou l'appel a échoué, jamais une exception — l'appelant décide quoi faire
 * des trous.
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT'
): Promise<Array<number[] | null>> {
  const resultats: Array<number[] | null> = texts.map(() => null);
  const client = getGeminiClient();
  if (!client) {
    console.warn('[ai-embeddings] GEMINI_API_KEY non configurée');
    return resultats;
  }

  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
  // Indices des textes non vides, pour garder l'alignement entrée/sortie.
  const candidats = texts
    .map((t, i) => ({ i, texte: nettoyer(t) }))
    .filter((c) => c.texte.length > 0);

  for (let debut = 0; debut < candidats.length; debut += BATCH_SIZE) {
    const lot = candidats.slice(debut, debut + BATCH_SIZE);
    try {
      const reponse = await model.batchEmbedContents({
        requests: lot.map((c) => ({
          content: { role: 'user', parts: [{ text: c.texte }] },
          taskType,
          outputDimensionality: EMBEDDING_DIM,
        })),
      } as any);

      const vecteurs = reponse.embeddings || [];
      lot.forEach((c, k) => {
        const valeurs = vecteurs[k]?.values;
        if (valeurs && valeurs.length === EMBEDDING_DIM) resultats[c.i] = valeurs;
      });
    } catch (err: unknown) {
      console.error(
        `[ai-embeddings] Lot ${debut / BATCH_SIZE + 1} en échec :`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return resultats;
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

function normaliserConseils(
  tips: string | Array<string | { title?: string; text?: string; desc?: string }> | null | undefined
): string {
  if (!tips) return '';
  if (typeof tips === 'string') return tips.trim();
  return tips
    .map((t) => (typeof t === 'string' ? t : [t.title, t.text || t.desc].filter(Boolean).join(' : ')))
    .filter(Boolean)
    .join(' | ');
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
  // En base : jsonb, tableau (vide sur les 41 destinations au 16/09) — on
  // accepte aussi un texte brut au cas où.
  local_insider_tips?: string | Array<string | { title?: string; text?: string; desc?: string }> | null;
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
  const conseils = normaliserConseils(dest.local_insider_tips);
  if (conseils) parts.push(`Conseils secrets : ${conseils}`);
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
