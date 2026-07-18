// Hero QR asset (DL67) — encodes landing.config's iosAppUrl, or the
// honest "bientôt" fallback text while no store listing exists (D4).
// Colors come from tokens (zero raw hex). Output: public/qr-ios.svg.
//
//   node scripts/generate-qr.ts   (node 25 native type stripping, DL12)

import { writeFileSync } from 'node:fs';

import QRCode from 'qrcode';

import { landingConfig } from '../src/landing.config.ts';
import { colors } from '../src/theme/tokens.ts';

const content = landingConfig.iosAppUrl ?? landingConfig.qrFallbackText;

const svg = await QRCode.toString(content, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 0,
  color: {
    dark: colors.content.primary, // espresso modules
    light: '#0000', // transparent — the tile's porcelain shows through
  },
});

writeFileSync('public/qr-ios.svg', svg);
console.log(`qr-ios.svg written — encodes: ${content}`);
