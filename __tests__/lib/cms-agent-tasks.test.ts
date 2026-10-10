import { describe, it, expect } from 'vitest';
import {
  MISSION_PRESETS,
  filterTasksForArticle,
  computeTaskStats,
  CmsAgentTask,
} from '@/lib/cms-agent-tasks';

describe('CMS Agent Tasks Library', () => {
  it('contient les 4 presets de mission essentiels', () => {
    expect(MISSION_PRESETS.length).toBe(4);
    const ids = MISSION_PRESETS.map((p) => p.id);
    expect(ids).toContain('review_voice');
    expect(ids).toContain('verify_facts');
    expect(ids).toContain('audit_seo');
    expect(ids).toContain('international_adapt');
  });

  it('génère des consignes claires et non vides pour les presets', () => {
    const title = 'Traversée du Maramureș';
    const slug = 'maramures-slow-travel';

    for (const preset of MISSION_PRESETS) {
      const task = preset.generateTask(title);
      const desc = preset.generateDescription(title, slug);

      expect(task).toContain(title);
      expect(desc).toContain(title);
      expect(desc).toContain(slug);
      expect(preset.risk_level).toMatch(/^(low|medium)$/);
    }
  });

  it('filtre correctement les tâches associées à un article', () => {
    const mockTasks: CmsAgentTask[] = [
      {
        id: '1',
        agent: 'jules',
        task: 'Relecture voix : Églises de Maramureș',
        description: 'Article maramures-slow-travel',
        status: 'sent',
        scope: 'content',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        agent: 'opencode',
        task: 'Audit SEO : Stoos Ridge',
        description: 'Article stoos-ridge-suisse',
        status: 'done',
        scope: 'seo',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        agent: 'archiveur',
        task: 'Vérification faits générique',
        description: 'Vérification des fiches',
        status: 'in_progress',
        scope: 'content',
        created_at: new Date().toISOString(),
      },
    ];

    const filtered = filterTasksForArticle(mockTasks, 'maramures-slow-travel', 'Églises de Maramureș');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('calcule les statistiques de statut avec précision', () => {
    const mockTasks: CmsAgentTask[] = [
      {
        id: '1',
        agent: 'jules',
        task: 'Tâche 1',
        status: 'sent',
        scope: 'content',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        agent: 'opencode',
        task: 'Tâche 2',
        status: 'in_progress',
        scope: 'seo',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        agent: 'gemini',
        task: 'Tâche 3',
        status: 'waiting_validation',
        scope: 'content',
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        agent: 'archiveur',
        task: 'Tâche 4',
        status: 'done',
        scope: 'content',
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        agent: 'freebuff',
        task: 'Tâche 5',
        status: 'blocked',
        scope: 'infra',
        created_at: new Date().toISOString(),
      },
    ];

    const stats = computeTaskStats(mockTasks);
    expect(stats.total).toBe(5);
    expect(stats.sent).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.waiting_validation).toBe(1);
    expect(stats.done).toBe(1);
    expect(stats.blocked).toBe(1);
  });
});
