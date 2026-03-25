'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArticleManager from '@/components/admin/ArticleManager';
import DestinationManager from '@/components/admin/DestinationManager';

type Tab = 'articles' | 'destinations';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2E4F4F] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Heldonica Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('articles')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'articles'
                  ? 'border-[#2E4F4F] text-[#2E4F4F]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'destinations'
                  ? 'border-[#2E4F4F] text-[#2E4F4F]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Destinations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'articles' && <ArticleManager />}
        {activeTab === 'destinations' && <DestinationManager />}
      </main>
    </div>
  );
}
