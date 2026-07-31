import { access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const captureRoot = resolve(process.argv[2] ?? '/private/tmp/mishi-landing-captures');
const outputRoot = resolve(projectRoot, 'public/screens');
const screenNames = [
  'scan-fr',
  'scan-en',
  'understand-fr',
  'understand-en',
  'recommend-fr',
  'recommend-en',
  'discover-fr',
  'discover-en',
  'profile-fr',
  'profile-en',
];

await mkdir(outputRoot, { recursive: true });

for (const name of screenNames) {
  const source = resolve(captureRoot, `${name}.png`);
  await access(source);
  await sharp(source)
    .resize(804, 1748, { fit: 'fill' })
    .webp({ quality: 88, effort: 6 })
    .toFile(resolve(outputRoot, `${name}.webp`));
}

for (const name of ['scan', 'understand', 'recommend']) {
  await sharp(resolve(captureRoot, `${name}-fr.png`))
    .resize(804, 1748, { fit: 'fill' })
    .webp({ quality: 88, effort: 6 })
    .toFile(resolve(outputRoot, `${name}.webp`));
}

const tileWidth = 180;
const tileHeight = 391;
const labelHeight = 34;
const gap = 16;
const columns = 5;
const rows = 2;
const sheetWidth = columns * tileWidth + (columns + 1) * gap;
const sheetHeight = rows * (tileHeight + labelHeight) + (rows + 1) * gap;
const composites = [];

for (const [index, name] of screenNames.entries()) {
  const left = gap + (index % columns) * (tileWidth + gap);
  const top = gap + Math.floor(index / columns) * (tileHeight + labelHeight + gap);
  const screenshot = await sharp(resolve(captureRoot, `${name}.png`))
    .resize(tileWidth, tileHeight, { fit: 'fill' })
    .jpeg({ quality: 86 })
    .toBuffer();
  const label = Buffer.from(`
    <svg width="${tileWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1C1714"/>
      <text x="${tileWidth / 2}" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#FFF9EF">${name}</text>
    </svg>
  `);

  composites.push({ input: screenshot, left, top });
  composites.push({ input: label, left, top: top + tileHeight });
}

await sharp({
  create: {
    width: sheetWidth,
    height: sheetHeight,
    channels: 3,
    background: '#F3E8D0',
  },
})
  .composite(composites)
  .jpeg({ quality: 90 })
  .toFile(resolve(captureRoot, 'contact-sheet.jpg'));

console.log(`Imported ${screenNames.length} app screenshots from ${captureRoot}`);
