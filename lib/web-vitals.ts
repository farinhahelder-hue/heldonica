import { trackEvent } from '@/lib/analytics';
import type { Metric } from 'web-vitals';

export function reportWebVitals(metric: Metric) {
  trackEvent('web_vitals', {
    eventCategory: 'Web Vitals',
    eventAction: metric.name,
    eventLabel: metric.id,
    eventValue: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  });
}
