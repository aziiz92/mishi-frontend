import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { SECTION_NAMES, trackSectionViewed, trackTierServed } from './analytics';

let debugSpy: MockInstance;

beforeEach(() => {
  debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
});
afterEach(() => {
  debugSpy.mockRestore();
});

describe('landing analytics', () => {
  it('uses the launch funnel section taxonomy', () => {
    expect(SECTION_NAMES).toEqual(['hero', 'how', 'trust', 'care', 'faq', 'download']);
  });

  it('fires a section view once with a session-only identifier', () => {
    trackSectionViewed('how');
    trackSectionViewed('how');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const payload = debugSpy.mock.calls[0][1];
    expect(payload).toMatchObject({
      event_name: 'landing_section_viewed',
      section: 'how',
      platform: 'web',
    });
    expect(typeof payload.session_id).toBe('string');
    expect(payload.session_id.length).toBeGreaterThan(0);
    expect(payload.device_id).toBeUndefined();
  });

  it('fires tier served exactly once per page view', () => {
    trackTierServed('tierB');
    trackTierServed('tierA');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][1]).toMatchObject({
      event_name: 'landing_tier_served',
      tier: 'tierB',
      platform: 'web',
    });
  });
});
