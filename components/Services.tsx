'use client';

export default function Services() {
  return (
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
  );
}
