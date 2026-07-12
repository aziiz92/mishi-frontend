import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { ACT_NAMES, trackActViewed, trackTierServed } from './analytics';

// VITE_ANALYTICS_URL is unset under vitest, so track() takes the dev
// console.debug path — the payload shape and the once-per-view dedupe
// guards are what these tests pin down.
let debugSpy: MockInstance;

beforeEach(() => {
  debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
});
afterEach(() => {
  debugSpy.mockRestore();
});

describe('landing analytics', () => {
  it('act names follow the concept doc, snake_cased', () => {
    expect(ACT_NAMES).toEqual([
      'le_point_tombe',
      'le_chaos',
      'le_scan',
      'le_choix',
      'la_confiance',
      'la_decision',
    ]);
  });

  it('landing_act_viewed fires once per act with taxonomy-conform payload', () => {
    trackActViewed(1);
    trackActViewed(1);
    trackActViewed(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const payload = debugSpy.mock.calls[0][1];
    expect(payload).toMatchObject({
      event_name: 'landing_act_viewed',
      act: 1,
      act_name: 'le_chaos',
      platform: 'web',
    });
    expect(typeof payload.device_id).toBe('string');
    expect(payload.device_id.length).toBeGreaterThan(0);
  });

  it('out-of-range acts are ignored', () => {
    trackActViewed(-1);
    trackActViewed(6);
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('landing_tier_served fires exactly once per page view', () => {
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
