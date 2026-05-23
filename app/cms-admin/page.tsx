import { createServiceClient } from '@/lib/supabase';
import { Suspense } from 'react';

// Colors from spec
const COLORS = {
  primary: '#2D6A4F',
  background: '#F8F5F0',
  accent: '#8B4513',
  teal: '#1A7A7A',
};

// Types
interface Article {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at: string;
}

interface TravelRequest {
  id: string;
  name: string;
  email: string;
  statut: string;
  created_at: string;
}

interface KPICounts {
  published: number;
  drafts: number;
  pending: number;
}

// Skeleton components
function WidgetSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

// Server-side data fetchers
async function getDraftsWidget(limit = 5): Promise<Article[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, published_at, created_at')
      .eq('published', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch (e) {
    console.error('Error fetching drafts:', e);
    return [];
  }
}

async function getNewTravelRequests(limit = 5): Promise<TravelRequest[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('travel_requests')
      .select('id, name, email, statut, created_at')
      .eq('statut', 'nouveau')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch (e) {
    console.error('Error fetching travel requests:', e);
    return [];
  }
}

async function getScheduledBlockedArticles(limit = 5): Promise<Article[]> {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, published_at, created_at')
      .eq('published', false)
      .lt('published_at', now)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: true })
      .limit(limit);
    return data || [];
  } catch (e) {
    console.error('Error fetching scheduled blocked articles:', e);
    return [];
  }
}

async function getKPICounts(): Promise<KPICounts> {
  try {
    const supabase = createServiceClient();
    const [publishedResult, draftsResult, pendingResult] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', true),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', false),
      supabase.from('travel_requests').select('id', { count: 'exact', head: true }).eq('statut', 'nouveau'),
    ]);
    return {
      published: publishedResult.count || 0,
      drafts: draftsResult.count || 0,
      pending: pendingResult.count || 0,
    };
  } catch (e) {
    console.error('Error fetching KPI counts:', e);
    return { published: 0, drafts: 0, pending: 0 };
  }
}

// Widget Components
async function DraftsWidget() {
  const drafts = await getDraftsWidget();
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ backgroundColor: COLORS.background }}>
      <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.primary }}>
        📝 Brouillons en attente
      </h3>
      {drafts.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun brouillon</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((article) => (
            <li key={article.id} className="border-b border-gray-100 pb-2 last:border-0">
              <a href={`/cms-admin?edit=${article.slug}`} className="text-sm hover:underline" style={{ color: COLORS.accent }}>
                {article.title || 'Sans titre'}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function TravelRequestsWidget() {
  const requests = await getNewTravelRequests();
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ backgroundColor: COLORS.background }}>
      <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.teal }}>
        ✈️ Nouvelles demandes voyage
      </h3>
      {requests.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune nouvelle demande</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.id} className="border-b border-gray-100 pb-2 last:border-0">
              <div className="text-sm">
                <span className="font-medium" style={{ color: COLORS.teal }}>{req.name}</span>
                <span className="text-gray-400 ml-2 text-xs">{req.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ScheduledBlockedWidget() {
  const articles = await getScheduledBlockedArticles();
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ backgroundColor: COLORS.background }}>
      <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.accent }}>
        ⏰ Articles planifiés bloqués
      </h3>
      {articles.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun article bloqué</p>
      ) : (
        <ul className="space-y-2">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-gray-100 pb-2 last:border-0">
              <a href={`/cms-admin?edit=${article.slug}`} className="text-sm hover:underline" style={{ color: COLORS.accent }}>
                {article.title || 'Sans titre'}
              </a>
              {article.published_at && (
                <span className="text-xs text-gray-400 block">
                  Planifié: {new Date(article.published_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function KPIWidget() {
  const counts = await getKPICounts();
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: COLORS.background }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: COLORS.primary }}>Publiés</p>
        <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{counts.published}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: COLORS.background }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: COLORS.accent }}>Brouillons</p>
        <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{counts.drafts}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: COLORS.background }}>
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: COLORS.teal }}>En attente</p>
        <p className="text-2xl font-bold" style={{ color: COLORS.teal }}>{counts.pending}</p>
      </div>
    </div>
  );
}

export default function CMSAdminPage() {
  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: COLORS.background }}>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.primary }}>
          Dashboard CMS
        </h1>
        <p className="text-sm text-gray-600">Vue rapide de votre espace administrateur</p>
      </header>

      {/* KPI Section */}
      <section className="mb-6">
        <Suspense fallback={<KPISkeleton />}>
          <KPIWidget />
        </Suspense>
      </section>

      {/* Widgets Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Suspense fallback={<WidgetSkeleton />}>
          <DraftsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <TravelRequestsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <ScheduledBlockedWidget />
        </Suspense>
      </section>
    </div>
  );
}
