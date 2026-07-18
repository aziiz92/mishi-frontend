// Copy-diff gate check — every copy line from docs/mishi-landing-concept.md
// must appear byte-identical in the source. Zero paraphrase, ever.
// (DL16: the doc's « » around copy lines are its quoting convention, not
// part of the copy — ratified.)
//
// Since DL64 the FR copy lives in ONE module (src/content/copy.ts); the
// index.html shell still duplicates the hero + nav lines (DL17/DL47) and
// bake-screens.mjs carries the ratified reason line (DL44).
//
//   npm run check:copy

import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const sources = {
  'index.html': read('index.html'),
  'src/content/copy.ts': read('src/content/copy.ts'),
  'scripts/bake-screens.mjs': read('scripts/bake-screens.mjs'),
};

// [copy line, files it must appear in, note]
const COPY = [
  ['Tu regardes le menu. Le menu te regarde.', ['index.html', 'src/content/copy.ts'], 'Act 0 headline (+ pre-JS shell)'],
  ['Une photo. Une recommandation. Moins de 60 secondes.', ['index.html', 'src/content/copy.ts'], 'Act 0 sub (+ shell)'],
  ['Comment ça marche', ['index.html', 'src/content/copy.ts'], 'nav link (DL63, + shell)'],
  ['Pourquoi Mishi', ['index.html', 'src/content/copy.ts'], 'nav link (DL63, + shell)'],
  ['14 plats.', ['src/content/copy.ts'], 'Act 1 held line 1/3 (DL58: three lines, one per pressure beat)'],
  ['Aucune photo.', ['src/content/copy.ts'], 'Act 1 held line 2/3'],
  ['Le serveur attend.', ['src/content/copy.ts'], 'Act 1 held line 3/3'],
  ['Mishi lit le menu comme un ami qui vit ici.', ['src/content/copy.ts'], 'Act 2 copy'],
  ['Un seul plat. Choisi pour toi.', ['src/content/copy.ts'], 'Act 3 copy'],
  ['Généreux et parfumé — le choix sûr ici.', ['src/content/copy.ts', 'scripts/bake-screens.mjs'], 'Act 3 reason line (DL44, ratified, two places)'],
  ['Tes préférences, prises au sérieux.', ['src/content/copy.ts'], 'Act 4 panel 1 headline (DL65)'],
  ['On ne te ment jamais sur la photo.', ['src/content/copy.ts'], 'Act 4 panel 2'],
  ['Conçu à Dakar. Compréhensible partout.', ['src/content/copy.ts'], 'Act 4 panel 3 (DL65: partout added, FCFA chip dropped)'],
  ['Mishi choisit. Tu', ['src/content/copy.ts'], 'Act 5 closing (split before "manges" for the nowrap period — dot IS the full stop)'],
  ['manges', ['src/content/copy.ts'], 'Act 5 closing, second fragment'],
  ['Télécharger Mishi', ['index.html', 'src/content/copy.ts'], 'primary CTA (+ shell nav)'],
  ['Voir une démo', ['src/content/copy.ts'], 'Act 5 secondary CTA'],
  ['illustration', ['src/content/copy.ts'], 'honest image label, Act 3 chip (case-insensitive per ratified rendering "Illustration")'],
];

let failed = 0;
for (const [text, files, note] of COPY) {
  for (const file of files) {
    const hay = text === 'illustration' ? sources[file].toLowerCase() : sources[file];
    if (!hay.includes(text)) {
      console.error(`MISSING in ${file}: "${text}" (${note})`);
      failed++;
    }
  }
}

if (failed) {
  console.error(`\nCOPY DIFF FAILED — ${failed} missing/paraphrased line(s).`);
  process.exit(1);
}
console.log(`COPY DIFF PASS — ${COPY.length} concept-doc copy lines verified byte-identical across ${Object.keys(sources).length} files.`);
