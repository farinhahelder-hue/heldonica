'use client';

import Link from 'next/link';

export default function HeroVideo() {
  return (
    <section className="pt-32 pb-24 relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
          style={{ opacity: 0.6 }}
        >
          <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          Découvrez le slow travel
        </h1>
        <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light max-w-2xl mx-auto">
          Des voyages authentiques, conçus pour vous
        </p>
        <Link
          href="/travel-planning-form"
          className="inline-block px-8 py-4 bg-white text-amber-900 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
        >
          Planifier mon voyage
        </Link>
      </div>
    </section>
  );
}
