import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { trackEvent } from '@/lib/analytics';
import * as consentModule from '@/lib/consent';

vi.mock('@/lib/consent', () => ({
  hasOptionalTrackingConsent: vi.fn(),
}));

describe('analytics trackEvent', () => {
  let gtagMock: any;

  beforeEach(() => {
    gtagMock = vi.fn();
    window.gtag = gtagMock;
    vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.gtag;
  });

  it('does not track if window is undefined', () => {
    const origWindow = global.window;
    // @ts-ignore
    delete global.window;

    trackEvent('test_event');

    global.window = origWindow;
  });

  it('does not track if consent is missing', () => {
    vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(false);
    trackEvent('test_event');
    expect(gtagMock).not.toHaveBeenCalled();
  });

  it('does not track if window.gtag is not a function', () => {
    window.gtag = undefined;
    trackEvent('test_event');
    expect(gtagMock).not.toHaveBeenCalled();
  });

  it('calls gtag with correct arguments when conditions are met', () => {
    trackEvent('test_event', { foo: 'bar' });
    expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', { foo: 'bar' });
  });

  it('calls gtag with correct arguments when default empty params are used', () => {
    trackEvent('test_event');
    expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {});
  });
});
