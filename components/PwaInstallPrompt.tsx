'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      const dismissed = localStorage.getItem('heldonica_pwa_dismissed');
      if (dismissed || isStandaloneMode) return;

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('heldonica_pwa_dismissed', '1');
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-[#DED5C6] bg-[#FAF7F2] p-4 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white">
            <Smartphone size={20} />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-[#241D1A]">Heldonica Carnet Mobile</h4>
            <p className="text-[11px] text-[#241D1A]/70 leading-tight">
              Installez le carnet de route sur votre écran pour une consultation fluide hors-ligne.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-700 p-1"
          aria-label="Fermer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
        >
          Plus tard
        </button>
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
        >
          <Download size={13} />
          <span>Installer l&apos;application</span>
        </button>
      </div>
    </div>
  );
}
