import { hasOptionalTrackingConsent } from '@/lib/consent';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 tracking utilities for Heldonica
// Events: conversions, scroll depth, newsletter, travel planning

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  if (!hasOptionalTrackingConsent()) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
}

// Scroll depth tracking
export function initScrollDepthTracking() {
  if (typeof window === 'undefined') return;
  
  const milestones = [25, 50, 75, 90, 100];
  const tracked = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    for (const milestone of milestones) {
      if (scrollPercent >= milestone && !tracked.has(milestone)) {
        tracked.add(milestone);
        trackEvent('scroll_depth', {
          milestone: milestone,
          page: window.location.pathname,
        });
      }
    }
  };

  // Debounce scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Newsletter events
export function trackNewsletterSignup(email: string, source: 'footer' | 'popup' | 'inline' | 'blog') {
  trackEvent('newsletter_signup', {
    source,
    email_hash: hashString(email),
  });
}

export function trackNewsletterConversion() {
  trackEvent('generate_lead', {
    method: 'newsletter',
  });
}

// Travel planning events
export function trackTravelPlanningFormStart() {
  trackEvent('travel_planning_form_start');
}

export function trackTravelPlanningFormSubmit(destination?: string, duration?: string) {
  trackEvent('generate_lead', {
    method: 'travel_planning',
    destination,
    duration,
  });
}

export function trackTravelPlanningConversion() {
  trackEvent('conversion', {
    event_category: 'travel_planning',
  });
}

// CTA click tracking
export function trackCtaClick(ctaName: string, location: string) {
  trackEvent('cta_click', {
    cta_name,
    location,
  });
}

// Article engagement
export function trackArticleView(slug: string, category: string, readTime: number) {
  trackEvent('article_view', {
    slug,
    category,
    read_time: readTime,
  });
}

export function trackArticleShare(method: 'twitter' | 'facebook' | 'pinterest' | 'copy', slug: string) {
  trackEvent('article_share', {
    method,
    slug,
  });
}

// Affiliate link tracking
export function trackAffiliateClick(partner: string, destination: string) {
  trackEvent('affiliate_click', {
    partner,
    destination,
  });
}

// Lead magnet downloads
export function trackLeadMagnetDownload(guideName: string) {
  trackEvent('lead_magnet_download', {
    guide: guideName,
  });
  trackEvent('generate_lead', {
    method: 'lead_magnet',
    guide: guideName,
  });
}

// Simple hash for email anonymization
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
