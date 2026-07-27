import { existsSync, readFileSync } from 'node:fs';

const strict = process.env.VITE_RELEASE_STRICT === '1';
const appStoreUrl = process.env.VITE_APP_STORE_URL?.trim();
const frenchBadgeUrl = process.env.VITE_APP_STORE_BADGE_FR_URL?.trim();
const failures = [];

if (strict && !appStoreUrl) failures.push('VITE_APP_STORE_URL is required when VITE_RELEASE_STRICT=1');
if (strict && appStoreUrl && !/^https:\/\/apps\.apple\.com\//.test(appStoreUrl)) {
  failures.push('VITE_APP_STORE_URL must be an https://apps.apple.com/ URL');
}
if (strict && appStoreUrl?.includes('id0000000000')) {
  failures.push('VITE_APP_STORE_URL still contains the temporary App Store placeholder ID');
}
if (strict && !frenchBadgeUrl) {
  failures.push('VITE_APP_STORE_BADGE_FR_URL is required for the official localized French badge');
}
if (existsSync('dist/3D/iphone_17_pro_max.glb')) failures.push('Legacy blank Apple-specific 3D phone is present in the production build');

const requiredFiles = [
  'dist/en/index.html',
  'dist/fr/index.html',
  'dist/screens/scan.webp',
  'dist/screens/understand.webp',
  'dist/screens/recommend.webp',
  'dist/social-card.jpg',
  'dist/apple-touch-icon.png',
  'dist/sitemap.xml',
  'dist/robots.txt',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`Missing launch asset: ${file}`);
}

const sourceFiles = [
  'index.html',
  'src/App.tsx',
  'src/Nav.tsx',
  'src/LaunchSections.tsx',
  'src/components/Footer.tsx',
  'src/landing.config.ts',
];
const source = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const forbidden = [
  ['placeholder destination', /href=["']#["']/],
  ['personal email', /aziizndiaye65@gmail\.com/i],
  ['Android CTA identifier', /download_android/],
  ['Google Play CTA', /Google Play/i],
  ['blank phone screen', /iphone_17_pro_max\.glb/],
];

for (const [label, pattern] of forbidden) {
  if (pattern.test(source)) failures.push(`Found ${label}`);
}

for (const locale of ['en', 'fr']) {
  const html = readFileSync(`dist/${locale}/index.html`, 'utf8');
  if (!html.includes('<link rel="canonical"')) failures.push(`Missing canonical in ${locale}`);
  if (!html.includes(`hreflang="fr" href="${process.env.VITE_CANONICAL_BASE_URL || 'https://mishi.app'}/fr/"`)) {
    failures.push(`Missing French hreflang target in ${locale}`);
  }
  if (!html.includes(`hreflang="en" href="${process.env.VITE_CANONICAL_BASE_URL || 'https://mishi.app'}/en/"`)) {
    failures.push(`Missing English hreflang target in ${locale}`);
  }
  if (!html.includes('summary_large_image')) failures.push(`Missing large Twitter card in ${locale}`);
  if (!html.includes('SoftwareApplication')) failures.push(`Missing SoftwareApplication JSON-LD in ${locale}`);
  if (!/<h1\b/.test(html)) failures.push(`Missing pre-rendered hero heading in ${locale}`);
}

if (failures.length) {
  console.error(`Launch checks failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Launch checks passed${strict ? ' in strict release mode' : ''}.`);
