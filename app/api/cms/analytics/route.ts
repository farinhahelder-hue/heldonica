import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    // GA4 Integration (placeholder - requires service account)
    // To enable real GA4: set GOOGLE_SERVICE_ACCOUNT_JSON in env
    const ga4Enabled = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    const mockData: Record<string, unknown> = {
      ga4Connected: ga4Enabled,
      period: { startDate: '30daysAgo', endDate: 'today' },
      totals: {
        sessions: { value: 1245 },
        users: { value: 890 },
        newUsers: { value: 850 },
        screenPageViews: { value: 3400 },
        bounceRate: { value: 0.45 },
        engagementRate: { value: 0.55 },
        avgSessionDuration: { value: 120 },
        pagesPerSession: { value: 2.5 }
      },
      topPages: [
        { path: '/', views: 1200 },
        { path: '/blog', views: 800 },
        { path: '/a-propos', views: 300 },
        { path: '/destinations', views: 250 },
        { path: '/blog/decouvrir-maurice', views: 180 },
        { path: '/blog/secrets-japon', views: 150 },
        { path: '/blog road-trip-italie', views: 120 },
      ],
      trafficSources: [
        { channel: 'Organic Search', sessions: 600, pct: 48 },
        { channel: 'Direct', sessions: 400, pct: 32 },
        { channel: 'Social', sessions: 245, pct: 20 },
      ],
      devices: [
        { device: 'mobile', sessions: 800, pct: 64 },
        { device: 'desktop', sessions: 400, pct: 32 },
        { device: 'tablet', sessions: 45, pct: 4 },
      ],
      webVitals: {
        lcp: 1.2, // seconds - Largest Contentful Paint
        inp: 45,  // ms - Interaction to Next Paint
        cls: 0.05, // Cumulative Layout Shift
        fcp: 0.8, // First Contentful Paint
        ttfb: 0.3 // Time To First Byte
      }
    };

    // Get article stats from Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (url && key) {
      try {
        const sb = createClient(url, key);
        
        // Articles published
        const { count: publishedCount } = await sb
          .from('cms_blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);
        
        // Articles drafts
        const { count: draftCount } = await sb
          .from('cms_blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('published', false);
        
        // Recent articles (for performance widget)
        const { data: recentArticles } = await sb
          .from('cms_blog_posts')
          .select('id, title, slug, published, updated_at, published_at, views_count')
          .order('updated_at', { ascending: false })
          .limit(10);
        
        mockData.articles = {
          published: publishedCount || 0,
          drafts: draftCount || 0,
          recent: recentArticles || [],
        };
        
        // Demandes stats
        const { count: newDemandes } = await sb
          .from('demandes_travel')
          .select('*', { count: 'exact', head: true })
          .eq('statut', 'nouvelle_demande');
        
        const { count: totalDemandes } = await sb
          .from('demandes_travel')
          .select('*', { count: 'exact', head: true });
        
        mockData.demandes = {
          total: totalDemandes || 0,
          nouvelles: newDemandes || 0,
        };
      } catch (e) {
        console.error('Supabase stats error:', e);
      }
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
