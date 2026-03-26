'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch('/api/cms/content');
        const data = await res.json();
        setContent(data);
      } catch (error) {
        console.error('Erreur:', error);
        setContent({
          site: {
            title: 'Heldonica',
            tagline: 'Expert en slow travel et consulting hôtelier',
            primaryColor: '#8B4513',
            secondaryColor: '#2D5016',
            accentColor: '#D4A574',
          },
          hero: {
            title: 'Découvrez le slow travel',
            subtitle: 'Des voyages authentiques, conçus pour vous',
            ctaText: 'Planifier mon voyage',
            ctaLink: '/travel-planning-form',
            videoUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-serif font-bold" style={{ color: content?.site?.primaryColor }}>
            {content?.site?.title}
          </div>
          <div className="flex gap-8 items-center">
            <Link href="/blog" className="text-gray-700 hover:text-amber-900 transition font-medium">
              Blog
            </Link>
            <Link href="/destinations" className="text-gray-700 hover:text-amber-900 transition font-medium">
              Destinations
            </Link>
            <Link href="/travel-planning-form" className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition">
              Planifier
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {content?.hero?.videoUrl && (
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              style={{ opacity: 0.6 }}
            >
              <source src={content.hero.videoUrl} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            {content?.hero?.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light max-w-2xl mx-auto">
            {content?.hero?.subtitle}
          </p>
          <Link
            href={content?.hero?.ctaLink || '/travel-planning-form'}
            className="inline-block px-8 py-4 bg-white text-amber-900 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
          >
            {content?.hero?.ctaText || 'Planifier mon voyage'}
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">
                À propos de Heldonica
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {content?.site?.description || 'Heldonica est votre expert en slow travel et consulting hôtelier. Nous créons des expériences de voyage authentiques et personnalisées.'}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Avec notre expertise en revenue management et notre passion pour les voyages responsables, nous transformons chaque séjour en aventure mémorable.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-900 to-green-900 h-96 rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-bold text-center mb-16 text-gray-900">
            Nos Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Slow Travel',
                description: 'Voyages authentiques et responsables, loin des sentiers touristiques.',
                icon: '🌍',
              },
              {
                title: 'Travel Planning',
                description: 'Itinéraires personnalisés adaptés à vos envies et votre budget.',
                icon: '✈️',
              },
              {
                title: 'Consulting Hôtelier',
                description: 'Expertise en revenue management et optimisation hôtelière.',
                icon: '🏨',
              },
            ].map((service, idx) => (
              <div key={idx} className="group">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-serif font-bold mb-3 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Prêt à planifier votre prochaine aventure ?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Répondez à quelques questions et recevez un itinéraire personnalisé.
          </p>
          <Link
            href="/travel-planning-form"
            className="inline-block px-8 py-4 bg-white text-amber-900 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white font-serif text-xl mb-4">{content?.site?.title}</h3>
              <p className="text-sm">{content?.site?.tagline}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/destinations" className="hover:text-white transition">Destinations</Link></li>
                <li><Link href="/travel-planning-form" className="hover:text-white transition">Travel Planning</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/travel-planning" className="hover:text-white transition">Slow Travel</Link></li>
                <li><Link href="/hotel-consulting" className="hover:text-white transition">Consulting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm mb-2">{content?.site?.contactEmail}</p>
              <p className="text-sm">{content?.site?.contactPhone}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 {content?.site?.title}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
