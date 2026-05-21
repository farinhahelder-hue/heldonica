'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/settings';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    getSiteSettings().then(s => {
      const c: Record<string, string> = {};
      if (s.color_primary) c['--color-primary'] = s.color_primary;
      if (s.color_secondary) c['--color-secondary'] = s.color_secondary;
      if (s.color_accent) c['--color-accent'] = s.color_accent;
      if (s.color_background) c['--color-background'] = s.color_background;
      if (s.color_text) c['--color-text'] = s.color_text;
      setColors(c);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(colors).length > 0) {
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [colors]);

  return <>{children}</>;
}