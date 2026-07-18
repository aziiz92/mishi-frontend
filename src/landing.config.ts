// Typed destination config — the honest-placeholder pattern the concept
// mandates: no fake store links, ever. Both URLs stay null until D4
// (domain) + the store listings exist; the UI labels unavailable
// destinations honestly and the QR encodes a plain-text "bientôt" message
// instead of a dead link. After editing, regenerate the QR asset:
//
//   node scripts/generate-qr.ts
export const landingConfig = {
  /** App Store listing — null until it exists (D4). */
  iosAppUrl: null as string | null,
  /** Google Play listing — null until it exists (D4). */
  playStoreUrl: null as string | null,
  /** Restaurateur contact (DL67) — swap for a domain address post-D4. */
  contactEmail: 'aziizndiaye65@gmail.com',
  /** What the hero QR encodes while iosAppUrl is null. Scanning it tells
   *  the truth instead of 404ing. */
  qrFallbackText: "Mishi · bientôt sur l'App Store.",
} as const;
