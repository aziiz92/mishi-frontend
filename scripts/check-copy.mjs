import { readFileSync } from 'node:fs';

const files = ['index.html', 'src/content/copy.ts', 'src/LaunchSections.tsx', 'src/components/Footer.tsx'];
const sources = Object.fromEntries(files.map((file) => [file, readFileSync(file, 'utf8')]));
const combined = Object.values(sources).join('\n');

const required = [
  ['Tu regardes le menu. Le menu te regarde.', 'French hero'],
  ['You read the menu. The menu reads you.', 'English hero'],
  ['Jusqu’à trois pages. Tout le menu expliqué.', 'French multi-page promise'],
  ['Up to three pages. Every dish explained.', 'English multi-page promise'],
  ['Chaque menu mérite d’être compris.', 'French global positioning'],
  ['Every menu deserves to be understood.', 'English global positioning'],
  ['contact@mishi.app', 'restaurant contact'],
  ['Ne te fie jamais uniquement à Mishi pour une allergie', 'French allergy limitation'],
  ['Never rely on Mishi alone for an allergy', 'English allergy limitation'],
];

const failures = [];
for (const [text, label] of required) {
  if (!combined.includes(text)) failures.push(`Missing ${label}: "${text}"`);
}

for (const [file, source] of Object.entries(sources)) {
  if (/[—–]/.test(source)) failures.push(`${file} contains a visible em dash or en dash`);
}

if (failures.length) {
  console.error(`Copy checks failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Copy checks passed for ${required.length} launch promises in French and English.`);
