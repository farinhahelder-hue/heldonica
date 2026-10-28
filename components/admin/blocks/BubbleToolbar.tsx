'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bold, Italic, Link2, Quote, Sparkles, X } from 'lucide-react';

interface BubbleToolbarProps {
  onInsertVaultSpot?: () => void;
}

export function BubbleToolbar({ onInsertVaultSpot }: BubbleToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const activeTargetRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      if (!showLinkPrompt) {
        setPosition(null);
        activeTargetRef.current = null;
      }
      return;
    }

    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'TEXTAREA' ||
        (activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type === 'text'))
    ) {
      const target = activeEl as HTMLTextAreaElement | HTMLInputElement;
      activeTargetRef.current = target;

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Positionne la bulle juste au-dessus du champ actif
      setPosition({
        top: Math.max(10, rect.top - 46 + window.scrollY),
        left: Math.max(10, rect.left + rect.width / 2 - 120 + window.scrollX),
      });
      return;
    }

    // Sélection standard dans le DOM
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      if (!showLinkPrompt) setPosition(null);
      return;
    }

    setPosition({
      top: Math.max(10, rect.top - 48 + window.scrollY),
      left: Math.max(10, rect.left + rect.width / 2 - 120 + window.scrollX),
    });
  }, [showLinkPrompt]);

  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    // ⚡ Bolt Performance Optimization:
    // What: Throttled scroll event listener using requestAnimationFrame.
    // Why: Scroll events fire rapidly. Computing DOM calculations directly
    //      blocks the main thread. rAF synchronizes updates with the render cycle.
    // Impact: Reduces main thread blocking during fast scrolling in the admin panel.
    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener('selectionchange', updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('selectionchange', updatePosition);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [updatePosition]);

  const applyFormatToInput = (prefix: string, suffix: string = prefix) => {
    const target = activeTargetRef.current;
    if (!target) return;

    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    if (start === end) return;

    const val = target.value;
    const selected = val.substring(start, end);
    const formatted = `${prefix}${selected}${suffix}`;

    // Injection directe et simulation d'événement input pour React
    target.setRangeText(formatted, start, end, 'select');
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    target.focus();
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkPrompt(false);
      return;
    }
    const cleanUrl = linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    applyFormatToInput('[', `](${cleanUrl})`);
    setLinkUrl('');
    setShowLinkPrompt(false);
  };

  if (!position) return null;

  return (
    <div
      ref={toolbarRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 flex items-center gap-1 rounded-xl bg-stone-900 text-stone-100 px-2 py-1.5 shadow-2xl border border-stone-700 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => e.preventDefault()} // Empêche de perdre le focus du textarea
    >
      {showLinkPrompt ? (
        <div className="flex items-center gap-1.5 text-xs">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="bg-stone-800 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyLink();
              if (e.key === 'Escape') setShowLinkPrompt(false);
            }}
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-[11px]"
          >
            Lier
          </button>
          <button
            type="button"
            onClick={() => setShowLinkPrompt(false)}
            className="p-1 text-stone-400 hover:text-stone-200"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => applyFormatToInput('**', '**')}
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-stone-200 hover:text-white"
            title="Gras (**texte**)"
          >
            <Bold size={13} />
          </button>

          <button
            type="button"
            onClick={() => applyFormatToInput('*', '*')}
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-stone-200 hover:text-white"
            title="Italique (*texte*)"
          >
            <Italic size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowLinkPrompt(true)}
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-stone-200 hover:text-white"
            title="Insérer un lien ([texte](url))"
          >
            <Link2 size={13} />
          </button>

          <span className="w-px h-4 bg-stone-700 mx-0.5" />

          <button
            type="button"
            onClick={() => applyFormatToInput('> « ', ' »')}
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-amber-300 hover:text-amber-200 flex items-center gap-1 text-[11px] font-serif"
            title="Citation de terrain (> « citation »)"
          >
            <Quote size={13} />
            <span className="hidden sm:inline">Citation</span>
          </button>

          {onInsertVaultSpot && (
            <button
              type="button"
              onClick={onInsertVaultSpot}
              className="p-1.5 hover:bg-stone-800 rounded transition-colors text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
              title="Insérer une pépite du Coffre RAG"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Pépite RAG</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
