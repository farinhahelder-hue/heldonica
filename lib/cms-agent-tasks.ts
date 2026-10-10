/**
 * lib/cms-agent-tasks.ts
 *
 * Définitions et logique métier pour la Station de Contrôle Multi-Agents du CMS.
 * Permet de déléguer des missions aux 4 agents autonomes (Jules, Gemini, OpenCode, Archiveur/Freebuff)
 * et de visualiser leurs rapports d'exécution vérifiés (actions_done).
 */

export type AgentType = 'jules' | 'gemini' | 'opencode' | 'archiveur' | 'freebuff' | 'tous';

export type AgentTaskStatus =
  | 'sent'
  | 'in_progress'
  | 'waiting_validation'
  | 'blocked'
  | 'done'
  | 'failed';

export type AgentTaskScope = 'content' | 'seo' | 'schema' | 'security' | 'infra' | 'cms';

export interface ActionsDone {
  corrige?: string[];
  verifie?: string[];
  non_verifie?: string[];
  reste_a_faire?: string[];
}

export interface CmsAgentTask {
  id: string;
  agent: AgentType;
  task: string;
  description?: string;
  status: AgentTaskStatus;
  scope: AgentTaskScope;
  actions_done?: ActionsDone | null;
  files_modified?: string[];
  claimed_by?: string | null;
  claimed_at?: string | null;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  validated_by?: string | null;
  validated_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MissionPreset {
  id: string;
  label: string;
  agent: AgentType;
  scope: AgentTaskScope;
  risk_level: 'low' | 'medium';
  icon: string;
  generateTask: (articleTitle: string) => string;
  generateDescription: (articleTitle: string, slug?: string) => string;
}

export const MISSION_PRESETS: MissionPreset[] = [
  {
    id: 'review_voice',
    label: 'Relecture Voix & Style',
    agent: 'jules',
    scope: 'content',
    risk_level: 'low',
    icon: 'search',
    generateTask: (title) => `Relecture voix et mots bannis : ${title}`,
    generateDescription: (title, slug) =>
      `Relire l'article "${title}" (slug: ${slug || 'n/a'}). ` +
      `Contrôler la stricte absence des 48 mots bannis, l'utilisation du pronom "on" ` +
      `et le respect des critères slow travel d'Heldonica. Rendre compte dans actions_done.`,
  },
  {
    id: 'verify_facts',
    label: 'Vérification Faits & RAG',
    agent: 'archiveur',
    scope: 'content',
    risk_level: 'low',
    icon: 'book-open',
    generateTask: (title) => `Vérification d'ancrage factuel et pépites : ${title}`,
    generateDescription: (title, slug) =>
      `Vérifier l'article "${title}" (slug: ${slug || 'n/a'}) contre le Coffre des Savoirs. ` +
      `Contrôler que chaque lieu, date et détail est adossé à une preuve terrain réelle (content/evidence). ` +
      `Signaler toute assertion non soutenue.`,
  },
  {
    id: 'audit_seo',
    label: 'Audit SEO & Métadonnées',
    agent: 'opencode',
    scope: 'seo',
    risk_level: 'low',
    icon: 'globe',
    generateTask: (title) => `Audit SERP et maillage interne : ${title}`,
    generateDescription: (title, slug) =>
      `Auditer la structure SEO de "${title}" (slug: ${slug || 'n/a'}). ` +
      `Vérifier le titre SERP (< 60 car.), la meta-description (< 155 car.), ` +
      `les tags slow travel (saison, mobilité, budget) et les liens internes recommandés.`,
  },
  {
    id: 'international_adapt',
    label: 'Adaptation & Traduction',
    agent: 'gemini',
    scope: 'content',
    risk_level: 'medium',
    icon: 'languages',
    generateTask: (title) => `Adaptation internationale & multilingue : ${title}`,
    generateDescription: (title, slug) =>
      `Préparer la déclinaison internationale de "${title}" (slug: ${slug || 'n/a'}) ` +
      `en conservant les repères authentiques et le ton sans artifice.`,
  },
];

/**
 * Filtre les tâches pertinentes pour un article donné à partir du titre ou slug dans la description.
 */
export function filterTasksForArticle(tasks: CmsAgentTask[], articleSlug?: string, articleTitle?: string): CmsAgentTask[] {
  if (!articleSlug && !articleTitle) return tasks;
  const slugLower = (articleSlug || '').toLowerCase();
  const titleLower = (articleTitle || '').toLowerCase();

  return tasks.filter((t) => {
    const text = `${t.task} ${t.description || ''}`.toLowerCase();
    return (slugLower && text.includes(slugLower)) || (titleLower && text.includes(titleLower));
  });
}

/**
 * Calcule les compteurs d'état pour une liste de tâches.
 */
export function computeTaskStats(tasks: CmsAgentTask[]) {
  return {
    total: tasks.length,
    sent: tasks.filter((t) => t.status === 'sent').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    waiting_validation: tasks.filter((t) => t.status === 'waiting_validation').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked' || t.status === 'failed').length,
  };
}
