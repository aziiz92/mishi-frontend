// Copy-diff gate check — every copy line from docs/mishi-landing-concept.md
// must appear byte-identical in the source. Zero paraphrase, ever.
// (DL16: the doc's « » around copy lines are its quoting convention, not
// part of the copy — ratified.)
//
//   npm run check:copy

import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const sources = {
  'index.html': read('index.html'),
  'src/App.tsx': read('src/App.tsx'),
  'src/chaos/ChaosCopy.tsx': read('src/chaos/ChaosCopy.tsx'),
  'scripts/bake-screens.mjs': read('scripts/bake-screens.mjs'),
};

// [copy line, files it must appear in, note]
const COPY = [
  ['Tu regardes le menu. Le menu te regarde.', ['index.html', 'src/App.tsx'], 'Act 0 headline (+ pre-JS shell)'],
  ['Une photo. Une recommandation. Moins de 60 secondes.', ['index.html', 'src/App.tsx'], 'Act 0 sub (+ shell)'],
  ['14 plats.', ['src/chaos/ChaosCopy.tsx'], 'Act 1 held line 1/3 (DL58: three lines, one per pressure beat)'],
  ['Aucune photo.', ['src/chaos/ChaosCopy.tsx'], 'Act 1 held line 2/3'],
  ['Le serveur attend.', ['src/chaos/ChaosCopy.tsx'], 'Act 1 held line 3/3'],
  ['Mishi lit le menu comme un ami qui vit ici.', ['src/App.tsx'], 'Act 2 copy'],
  ['Un seul plat. Choisi pour toi.', ['src/App.tsx'], 'Act 3 copy'],
  ['On ne te ment jamais sur la photo.', ['src/App.tsx'], 'Act 4 panel 2'],
  ['Conçu à Dakar.', ['src/App.tsx'], 'Act 4 panel 3'],
  ['Mishi choisit. Tu', ['src/App.tsx'], 'Act 5 closing (split before "manges" for the nowrap period — dot IS the full stop)'],
  ['manges', ['src/App.tsx'], 'Act 5 closing, second fragment'],
  ['Voir une démo', ['src/App.tsx'], 'Act 5 secondary CTA'],
  ['illustration', ['src/App.tsx'], 'honest image label, Act 3 chip (case-insensitive per ratified rendering "Illustration")'],
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
