// Final CTA QR. It points to the configured App Store listing in release
// builds and to the public support route in local builds. It is never "#".
//
//   node scripts/generate-qr.ts   (node 25 native type stripping, DL12)

import { writeFileSync } from 'node:fs';

import QRCode from 'qrcode';

import { APP_STORE_PLACEHOLDER_URL } from '../src/landing.config.ts';
import { colors } from '../src/theme/tokens.ts';

const content = process.env.VITE_APP_STORE_URL?.trim() || APP_STORE_PLACEHOLDER_URL;

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
console.log(`qr-ios.svg written. Encodes: ${content}`);
