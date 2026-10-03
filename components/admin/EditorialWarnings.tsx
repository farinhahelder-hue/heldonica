'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { checkEditorialRules, EditorialWarning } from '@/lib/editorial-checks';

interface EditorialWarningsProps {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
}

export default function EditorialWarnings({ title = '', excerpt = '', content = '', category = '' }: EditorialWarningsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const warnings = useMemo(() => {
    return checkEditorialRules(title, excerpt, content, category);
  }, [title, excerpt, content, category]);

  if (warnings.length === 0) {
    return null;
  }

  const highPriorityCount = warnings.filter(w => w.priority === 'high').length;

  return (
    <div className="mb-6 rounded-lg border overflow-hidden">
      <div
        className={`flex items-center justify-between p-3 cursor-pointer ${
          highPriorityCount > 0
            ? 'bg-amber-50 border-b border-amber-200'
            : 'bg-stone-50 border-b border-stone-200'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {highPriorityCount > 0 ? (
            <AlertTriangle className="text-amber-500" size={18} />
          ) : (
            <Info className="text-stone-500" size={18} />
          )}
          <span className={`font-semibold text-sm ${highPriorityCount > 0 ? 'text-amber-800' : 'text-stone-700'}`}>
            Contrôle Éditorial ({warnings.length} remarque{warnings.length > 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">
            Aide à la relecture, aucune modification bloquante
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-0 bg-white">
          <ul className="divide-y divide-stone-100">
            {warnings.map((warning, idx) => (
              <li key={`${warning.id}-${idx}`} className="p-3 hover:bg-stone-50/50 transition-colors">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {warning.priority === 'high' && <AlertTriangle className="text-red-500" size={16} />}
                    {warning.priority === 'medium' && <AlertCircle className="text-amber-500" size={16} />}
                    {warning.priority === 'low' && <Info className="text-blue-500" size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      warning.priority === 'high' ? 'text-red-800' :
                      warning.priority === 'medium' ? 'text-amber-800' : 'text-blue-800'
                    }`}>
                      {warning.message}
                    </p>
                    {warning.context && (
                      <p className="mt-1 text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded border border-stone-200 font-mono italic">
                        {warning.context}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
