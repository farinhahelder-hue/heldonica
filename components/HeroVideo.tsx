'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HeroVideo() {
  const [videoUrl, setVideoUrl] = useState<string>('')

  useEffect(() => {
    // Pour l'instant, on utilise un placeholder
    setVideoUrl('/heldonica-hero.mp4')
  }, [])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Vidéo Hero */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src="/heldonica-hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>

      {/* Contenu */}
      <div className="relative z-10 container text-center text-white max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-lg leading-tight">
          Explorateurs émerveillés, dénicheurs de pépites.
        </h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow-md max-w-3xl mx-auto leading-relaxed">
          Nous sommes convaincus que l'aventure ne se trouve pas seulement au bout du monde. Elle se cache dans un marché de quartier, une ruelle oubliée, ou un café perdu en Provence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#community" className="px-8 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition font-semibold">
            Rejoindre la communauté
          </Link>
          <Link href="/travel-planning" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold">
            Planifier mon voyage
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
