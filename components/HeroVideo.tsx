'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const HARDCODED = {
  videoSrc: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
  title: 'Découvrez le slow travel',
  subtitle: 'Des voyages authentiques, conçus pour vous',
  ctaLabel: 'Planifier mon voyage',
  ctaUrl: '/travel-planning',
} as const;

export default function HeroVideo() {
  const [videoSrc, setVideoSrc] = useState(HARDCODED.videoSrc);
  const [title, setTitle] = useState(HARDCODED.title);
  const [subtitle, setSubtitle] = useState(HARDCODED.subtitle);
  const [ctaLabel, setCtaLabel] = useState(HARDCODED.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(HARDCODED.ctaUrl);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/cms/settings', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.settings) return;
        const s = data.settings;
        if (s.hero_video_url) setVideoSrc(s.hero_video_url);
        if (s.hero_video_title) setTitle(s.hero_video_title);
        if (s.hero_video_subtitle) setSubtitle(s.hero_video_subtitle);
        if (s.hero_video_cta_label) setCtaLabel(s.hero_video_cta_label);
        if (s.hero_video_cta_url) setCtaUrl(s.hero_video_cta_url);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

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
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light max-w-2xl mx-auto">
          {subtitle}
        </p>
        <Link
          href={ctaUrl}
          className="inline-block px-8 py-4 bg-white text-mahogany font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
