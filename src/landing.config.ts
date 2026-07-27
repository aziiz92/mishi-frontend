import type { Lang } from './content/copy';

type PublicEnv = {
  VITE_APP_STORE_URL?: string;
  VITE_APP_STORE_BADGE_FR_URL?: string;
  VITE_CANONICAL_BASE_URL?: string;
};

const env = (import.meta as ImportMeta & { env?: PublicEnv }).env;
const canonicalBaseUrl = (env?.VITE_CANONICAL_BASE_URL || 'https://mishi.app').replace(/\/$/, '');
const configuredAppStoreUrl = env?.VITE_APP_STORE_URL?.trim() || null;
export const APP_STORE_PLACEHOLDER_URL = 'https://apps.apple.com/app/mishi/id0000000000';
const effectiveAppStoreUrl = configuredAppStoreUrl ?? APP_STORE_PLACEHOLDER_URL;

function campaignUrl(lang: Lang): string {
  const url = new URL(effectiveAppStoreUrl);
  url.searchParams.set('ct', `mishi_website_${lang}`);
  url.searchParams.set('mt', '8');
  return url.toString();
}

export const landingConfig = {
  appStoreReady: true,
  appStoreUrlConfigured: configuredAppStoreUrl !== null,
  appStoreUrl: effectiveAppStoreUrl,
  canonicalBaseUrl,
  contactEmail: 'contact@mishi.app',
  campaignLinks: {
    fr: campaignUrl('fr'),
    en: campaignUrl('en'),
  },
  badgeSources: {
    fr: env?.VITE_APP_STORE_BADGE_FR_URL?.trim() || '/app-store-badge.svg',
    en: '/app-store-badge.svg',
  },
} as const;
