'use client';

import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';
import type { CmsAgentTask } from '@/lib/cms-agent-tasks';

interface AgentPresenceBadgeProps {
  onOpenAgentsDrawer?: () => void;
  articleSlug?: string;
}

export function AgentPresenceBadge({
  onOpenAgentsDrawer,
  articleSlug,
}: AgentPresenceBadgeProps) {
  const [activeTask, setActiveTask] = useState<CmsAgentTask | null>(null);
  const [totalOpenTasks, setTotalOpenTasks] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPresence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/agent-tasks?limit=15');
      if (res.ok) {
        const data = await res.json();
        const tasks: CmsAgentTask[] = data.tasks || [];
        const inProgressOrSent = tasks.filter(
          (t) => t.status === 'in_progress' || t.status === 'sent'
        );
        setTotalOpenTasks(inProgressOrSent.length);

        // Si une tâche mentionne le slug actuel ou est in_progress
        const matching = articleSlug
          ? inProgressOrSent.find(
              (t) =>
                t.description?.includes(articleSlug) ||
                t.task?.includes(articleSlug)
            )
          : null;

        setActiveTask(matching || inProgressOrSent[0] || null);
      }
    } catch {
      // Échec discret
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPresence();
  }, [articleSlug]);

  const hasActiveWorker = activeTask && activeTask.status === 'in_progress';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Statut de présence des agents"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-2xs transition-all ${
          hasActiveWorker
            ? 'bg-amber-50 border-amber-300 text-amber-950 animate-pulse'
            : totalOpenTasks > 0
            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
        }`}
        title="Contrôle de présence et coordination multi-agents"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            hasActiveWorker
              ? 'bg-amber-500 animate-ping'
              : totalOpenTasks > 0
              ? 'bg-indigo-500'
              : 'bg-emerald-500'
          }`}
        />
        <Bot size={13} className={hasActiveWorker ? 'text-amber-700' : 'text-stone-600'} />
        <span>
          {hasActiveWorker
            ? `Agent ${activeTask.claimed_by || activeTask.agent} actif`
            : totalOpenTasks > 0
            ? `${totalOpenTasks} tâche(s) registre`
            : 'Flotte disponible'}
        </span>
        {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-stone-200 shadow-xl p-3 z-50 text-xs animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Coordination Multi-Agents
            </span>
            <button
              type="button"
              onClick={checkPresence}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
              title="Actualiser"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="py-2.5">
            {activeTask ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-stone-900 uppercase">
                    {activeTask.agent}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      activeTask.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {activeTask.status}
                  </span>
                </div>
                <p className="text-stone-600 font-medium line-clamp-2">
                  {activeTask.task}
                </p>
                {activeTask.claimed_by && (
                  <p className="text-[10px] text-stone-400">
                    Réservé par : {activeTask.claimed_by}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-stone-500 text-[11px]">
                Aucun agent ne modifie cet article en ce moment. Vous pouvez éditer sereinement.
              </p>
            )}
          </div>

          {onOpenAgentsDrawer && (
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAgentsDrawer();
                }}
                className="w-full text-center py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Zap size={12} className="text-amber-400" />
                <span>Ouvrir la Tour de Contrôle</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
