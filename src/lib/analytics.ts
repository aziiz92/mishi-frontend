import type { Lang } from '../content/copy';
import type { Tier } from './tier';

export const SECTION_NAMES = ['hero', 'how', 'trust', 'care', 'faq', 'download'] as const;

export type CtaId =
  | 'app_store_hero'
  | 'app_store_nav'
  | 'app_store_final'
  | 'qr_app_store'
  | 'view_demo'
  | 'restaurant_contact';

export type LandingEvent =
  | { event_name: 'landing_tier_served'; tier: Tier }
  | { event_name: 'landing_section_viewed'; section: (typeof SECTION_NAMES)[number] }
  | { event_name: 'landing_cta_tapped'; cta: CtaId }
  | { event_name: 'landing_locale_changed'; lang: Lang }
  | { event_name: 'landing_faq_opened'; item: number };

const sessionId = crypto.randomUUID();

export function track(event: LandingEvent): void {
  const payload = { ...event, session_id: sessionId, platform: 'web' as const };
  const base = import.meta.env.VITE_ANALYTICS_URL as string | undefined;

  if (!base) {
    if (import.meta.env.DEV) console.debug('[analytics]', payload);
    return;
  }

  const url = `${base.replace(/\/$/, '')}/events`;
  const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  if (!navigator.sendBeacon?.(url, body)) {
    void fetch(url, { method: 'POST', body, keepalive: true, credentials: 'omit' }).catch(() => {});
  }
}

let tierServedSent = false;
export function trackTierServed(tier: Tier): void {
  if (tierServedSent) return;
  tierServedSent = true;
  track({ event_name: 'landing_tier_served', tier });
}

const seenSections = new Set<string>();
export function trackSectionViewed(section: (typeof SECTION_NAMES)[number]): void {
  if (seenSections.has(section)) return;
  seenSections.add(section);
  track({ event_name: 'landing_section_viewed', section });
}
