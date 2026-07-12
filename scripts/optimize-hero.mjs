// Hero illustration pipeline — reads assets-src/hero-illustration.png
// (source stays out of the deploy artifact, DL13 pattern) and emits
// responsive AVIF + WebP into public/hero/. The hero image is the LCP
// candidate: index.html preloads it with imagesrcset.
//
//   node scripts/optimize-hero.mjs

import { mkdirSync, statSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'assets-src/hero-illustration.png';
const WIDTHS = [1672, 1200, 800];

mkdirSync('public/hero', { recursive: true });
for (const w of WIDTHS) {
  for (const [fmt, opts] of [
    ['avif', { quality: 52 }],
    ['webp', { quality: 78 }],
  ]) {
    const out = `public/hero/hero-${w}.${fmt}`;
    await sharp(SRC).resize(w)[fmt](opts).toFile(out);
    console.log(out, Math.round(statSync(out).size / 1024), 'KB');
  }
}
