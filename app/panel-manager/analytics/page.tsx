'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Bot } from 'lucide-react';
import AiAnalyticsDashboard from '@/components/admin/AiAnalyticsDashboard';

export default function PanelManagerAnalyticsPage() {
  return (
    <div className="min-h-screen bg-stone-50/50 py-6">
      {/* Barre de navigation supérieure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <Link
            href="/panel-manager"
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium transition-colors"
          >
            <Home size={14} />
            <span>CMS Heldonica</span>
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-semibold">Analytics & Conso IA</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/panel-manager/copilote"
            className="text-xs px-2.5 py-1 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Bot size={13} className="text-[#2D8B7A]" />
            <span>Copilote</span>
          </Link>
          <Link
            href="/panel-manager"
            className="text-xs px-2.5 py-1 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Retour Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Tableau de bord principal */}
      <AiAnalyticsDashboard />
    </div>
  );
}
