import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import TemoignagesClient from './TemoignagesClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export const metadata: Metadata = {
  title: 'Témoignages clients | Heldonica',
  description:
    'Retours de couples accompagnés par Heldonica pour leur voyage slow travel sur mesure.',
  alternates: {
    canonical: 'https://www.heldonica.fr/temoignages',
  },
};

async function getTestimonials() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const { data, error } = await supabase
      .from('cms_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export default async function TemoignagesPage() {
  const testimonials = await getTestimonials();
  
  return (
    <InlineEditProvider page="temoignages">
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <EditableZone page="temoignages" zone="hero_image_url" type="image"
            fallback="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70"
            className="absolute inset-0 opacity-20 w-full h-full object-cover"
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <EditableZone page="temoignages" zone="hero_badge" fallback="Ce qu'ils disent"
              className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              <EditableZone page="temoignages" zone="hero_title" fallback="Leurs voyages," className="inline" />
              <br />
              <span className="text-amber-400">
                <EditableZone page="temoignages" zone="hero_title_highlight" fallback="nos preuves." className="inline" />
              </span>
            </h1>
            <EditableZone page="temoignages" zone="hero_text" type="textarea" fallback="Parce qu'on ne peut pas toujours parler de soi, on laisse la parole à ceux qu'on a accompagnés."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto block"
            />
          </div>
        </section>
        <TemoignagesClient testimonials={testimonials} />
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

export const revalidate = 60;
