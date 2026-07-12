// Landing analytics — same taxonomy conventions as the app
// (docs/engineering/analytics-plan.md): snake_case, past-tense verbs,
// `platform` on every event, anonymous device_id, POST to /events.
// Landing events carry a `landing_` prefix so they group cleanly next to
// app events in analytics_events.
//
// Transport is env-configured (VITE_ANALYTICS_URL); without it events go
// to console.debug in dev and nowhere in prod — D4 (domain) blocks the
// real endpoint.

import type { Tier } from './tier';

// Concept-doc act names, snake_cased for the taxonomy.
export const ACT_NAMES = [
  'le_point_tombe',
  'le_chaos',
  'le_scan',
  'le_choix',
  'la_confiance',
  'la_decision',
] as const;

export type CtaId = 'download_ios' | 'download_android' | 'view_demo';

export type LandingEvent =
  | { event_name: 'landing_tier_served'; tier: Tier }
  | { event_name: 'landing_act_viewed'; act: number; act_name: (typeof ACT_NAMES)[number] }
  | { event_name: 'landing_cta_tapped'; cta: CtaId };

const DEVICE_ID_KEY = 'mishi_device_id';
// Per-session fallback: a localStorage failure must never wedge tracking
// (same lesson as the app's getDeviceId, D39).
let sessionId: string | null = null;

function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    sessionId ??= crypto.randomUUID();
    return sessionId;
  }
}

export function track(event: LandingEvent): void {
  const payload = { ...event, device_id: deviceId(), platform: 'web' as const };
  const base = import.meta.env.VITE_ANALYTICS_URL as string | undefined;

  if (!base) {
    if (import.meta.env.DEV) console.debug('[analytics]', payload);
    return;
  }

  const url = `${base.replace(/\/$/, '')}/events`;
  const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  // sendBeacon survives page unload (CTA taps navigate away).
  if (!navigator.sendBeacon?.(url, body)) {
    void fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}

// Tier is served exactly once per page view (StrictMode re-mounts effects
// in dev; module-level guards keep events honest).
let tierServedSent = false;
export function trackTierServed(tier: Tier): void {
  if (tierServedSent) return;
  tierServedSent = true;
  track({ event_name: 'landing_tier_served', tier });
}

// Act depth fires once per act per page view.
const seenActs = new Set<number>();
export function trackActViewed(act: number): void {
  if (seenActs.has(act) || act < 0 || act >= ACT_NAMES.length) return;
  seenActs.add(act);
  track({ event_name: 'landing_act_viewed', act, act_name: ACT_NAMES[act] });
}
