'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bot,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Search,
  BookOpen,
  Globe,
  Languages,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Check,
} from 'lucide-react';
import {
  CmsAgentTask,
  MISSION_PRESETS,
  computeTaskStats,
  filterTasksForArticle,
  AgentType,
  AgentTaskScope,
} from '@/lib/cms-agent-tasks';

interface AgentsControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  articleId?: number;
  articleTitle?: string;
  articleSlug?: string;
}

export default function AgentsControlDrawer({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  articleSlug,
}: AgentsControlDrawerProps) {
  const [tasks, setTasks] = useState<CmsAgentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulaire d'envoi
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('jules');
  const [customTask, setCustomTask] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customScope, setCustomScope] = useState<AgentTaskScope>('content');
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Récupérer les tâches
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cms/agent-tasks?limit=50');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      } else {
        setErrorMsg('Impossible de charger les tâches du registre.');
      }
    } catch {
      setErrorMsg('Erreur réseau lors de la communication avec le registre.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, fetchTasks]);

  // Raccourci Échap
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Appliquer un preset
  const handleApplyPreset = (presetId: string) => {
    const preset = MISSION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedAgent(preset.agent);
    setCustomScope(preset.scope);
    setCustomTask(preset.generateTask(articleTitle || 'Article'));
    setCustomDescription(preset.generateDescription(articleTitle || 'Article', articleSlug));
    setIsCustomExpanded(true);
  };

  // Soumettre une mission
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTask.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/cms/agent-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          task: customTask.trim(),
          description: customDescription.trim(),
          scope: customScope,
          article_id: articleId,
          article_slug: articleSlug,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Mission déposée avec succès pour l'agent ${selectedAgent} !`);
        setCustomTask('');
        setCustomDescription('');
        setIsCustomExpanded(false);
        fetchTasks();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Erreur lors de la création de la tâche.');
      }
    } catch {
      setErrorMsg('Erreur de connexion serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  // Valider une tâche (Approbation Fondateur)
  const handleFounderValidate = async (taskId: string) => {
    try {
      const res = await fetch('/api/cms/agent-tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: 'done',
          validated_by: 'heldonica',
          notes: 'Validé et approuvé depuis la station de contrôle CMS',
        }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch {
      // Ignorer ou notifier
    }
  };

  const toggleTaskExpanded = (id: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const relevantTasks = filterTasksForArticle(tasks, articleSlug, articleTitle);
  const stats = computeTaskStats(relevantTasks);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Station de contrôle multi-agents">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-700 text-white rounded-lg shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Station de Contrôle Multi-Agents
                </h2>
                <p className="text-xs text-stone-500">
                  {articleTitle ? `Article : ${articleTitle}` : 'Flotte d’agents autonomes'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchTasks}
                disabled={loading}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
                title="Actualiser la file"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-stone-100/60 border-b border-stone-200 text-xs">
            <div className="bg-white p-2 rounded border border-stone-200 text-center">
              <span className="text-stone-500 block">Déposées</span>
              <span className="font-bold text-stone-700">{stats.sent}</span>
            </div>
            <div className="bg-white p-2 rounded border border-stone-200 text-center">
              <span className="text-sky-600 block">En cours</span>
              <span className="font-bold text-sky-800">{stats.in_progress}</span>
            </div>
            <div className="bg-white p-2 rounded border border-stone-200 text-center">
              <span className="text-amber-600 block">À valider</span>
              <span className="font-bold text-amber-800">{stats.waiting_validation}</span>
            </div>
            <div className="bg-white p-2 rounded border border-stone-200 text-center">
              <span className="text-emerald-600 block">Vérifiées</span>
              <span className="font-bold text-emerald-800">{stats.done}</span>
            </div>
          </div>

          {/* Corps défilable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Section 1 : Presets 1-clic */}
            <div>
              <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
                Déléguer une Mission en 1-Clic
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {MISSION_PRESETS.map((preset) => {
                  const IconComp =
                    preset.icon === 'search'
                      ? Search
                      : preset.icon === 'book-open'
                      ? BookOpen
                      : preset.icon === 'globe'
                      ? Globe
                      : Languages;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      className="p-2.5 text-left border border-stone-200 bg-stone-50 hover:bg-teal-50 hover:border-teal-300 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComp className="w-3.5 h-3.5 text-teal-700 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-stone-800 group-hover:text-teal-900">
                          {preset.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 capitalize">Agent : {preset.agent}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulaire de dispatch */}
            <div className="border border-stone-200 rounded-lg p-3.5 bg-stone-50/50">
              <button
                type="button"
                onClick={() => setIsCustomExpanded(!isCustomExpanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-stone-800 text-left"
              >
                <span>Formulaire de Mission {isCustomExpanded ? '(Actif)' : '(Personnalisé)'}</span>
                {isCustomExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isCustomExpanded && (
                <form onSubmit={handleSubmitTask} className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Destinataire</label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value as AgentType)}
                        className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-teal-600"
                      >
                        <option value="jules">Jules (Tests & Qualité)</option>
                        <option value="archiveur">Archiveur (RAG & Mémoire)</option>
                        <option value="opencode">OpenCode (Code & SEO)</option>
                        <option value="gemini">Gemini (Stratégie & Voix)</option>
                        <option value="freebuff">Freebuff (Exploration)</option>
                        <option value="tous">Tous les agents</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Périmètre</label>
                      <select
                        value={customScope}
                        onChange={(e) => setCustomScope(e.target.value as AgentTaskScope)}
                        className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-teal-600"
                      >
                        <option value="content">Contenu & Voix</option>
                        <option value="seo">SEO & SERP</option>
                        <option value="cms">CMS & Blocs</option>
                        <option value="schema">Schémas & Structure</option>
                        <option value="infra">Infrastructure</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Titre de la mission *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Relecture des pépites et contrôle du pronom 'on'"
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Consigne détaillée</label>
                    <textarea
                      rows={3}
                      placeholder="Contexte, directives spécifiques, interdictions..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full text-xs p-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !customTask.trim()}
                    className="w-full py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Dépôt en cours...' : 'Déposer la Mission dans le Registre'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Section 2 : Missions associées à cet article */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Missions de l’Article ({relevantTasks.length})
                </h3>
              </div>

              {relevantTasks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-stone-200 rounded-lg text-stone-400 text-xs">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <span>Aucune mission déposée pour cet article.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {relevantTasks.map((t) => {
                    const isExpanded = expandedTaskIds.has(t.id);
                    const isDone = t.status === 'done';
                    const isWaiting = t.status === 'waiting_validation';
                    const isProgress = t.status === 'in_progress';

                    return (
                      <div
                        key={t.id}
                        className={`border rounded-lg p-3 transition-colors ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isWaiting
                            ? 'bg-amber-50/50 border-amber-300'
                            : isProgress
                            ? 'bg-sky-50/40 border-sky-200'
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  isDone
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : isWaiting
                                    ? 'bg-amber-200 text-amber-900'
                                    : isProgress
                                    ? 'bg-sky-200 text-sky-900'
                                    : 'bg-stone-200 text-stone-800'
                                }`}
                              >
                                {t.status}
                              </span>
                              <span className="text-[11px] font-semibold text-stone-700 capitalize">
                                Agent : {t.agent}
                              </span>
                              {t.claimed_by && (
                                <span className="text-[10px] text-stone-500">
                                  (Pris par {t.claimed_by})
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-medium text-stone-900 mt-1">{t.task}</h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleTaskExpanded(t.id)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Détails"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Rapport actions_done si disponible */}
                        {t.actions_done && (
                          <div className="mt-2.5 pt-2.5 border-t border-stone-200/80 text-[11px] space-y-1.5">
                            {t.actions_done.verifie && t.actions_done.verifie.length > 0 && (
                              <div className="text-emerald-800">
                                <span className="font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Vérifié :
                                </span>
                                <ul className="list-disc list-inside pl-1 text-[10.5px]">
                                  {t.actions_done.verifie.map((v, i) => (
                                    <li key={i}>{v}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {t.actions_done.corrige && t.actions_done.corrige.length > 0 && (
                              <div className="text-stone-700">
                                <span className="font-semibold flex items-center gap-1">
                                  <FileCheck className="w-3 h-3 text-stone-500" /> Corrigé :
                                </span>
                                <ul className="list-disc list-inside pl-1 text-[10.5px]">
                                  {t.actions_done.corrige.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {t.actions_done.reste_a_faire && t.actions_done.reste_a_faire.length > 0 && (
                              <div className="text-amber-800">
                                <span className="font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" /> Reste à faire :
                                </span>
                                <ul className="list-disc list-inside pl-1 text-[10.5px]">
                                  {t.actions_done.reste_a_faire.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Validation Fondateur 1-Clic */}
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-100">
                          {t.validated_by ? (
                            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Validé par {t.validated_by}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFounderValidate(t.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium rounded transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Approuver (Fondateur)</span>
                            </button>
                          )}

                          <span className="text-[10px] text-stone-400">
                            {new Date(t.created_at).toLocaleDateString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
