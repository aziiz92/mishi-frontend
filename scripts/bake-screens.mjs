// Bake the three phone-screen states (Act 2: camera → scan → results) as
// textures. Generates token-styled HTML (colors from tokens.ts, fonts from
// public/fonts, FR strings verbatim from the app's i18n/fr.ts), which
// scripts/bake-screens.sh captures in the iOS simulator and trims via the
// magenta matte. Screen aspect matches the phone GLB display mesh
// (6.53 : 14.08).
//
// Usage: node scripts/bake-screens.mjs  → writes public/screens-src/*.html

import { mkdirSync, writeFileSync } from 'node:fs';

const { colors, motion } = await import('../src/theme/tokens.ts');

// Demo menu content — real dishes, real FCFA, tabular figures. This is the
// seed of the Phase 4 menu dataset.
const MENU = [
  ['Poulet Yassa', '3 500 F'],
  ['Thiéboudienne rouge', '4 000 F'],
  ['Mafé de bœuf', '3 000 F'],
  ['Poisson braisé', '4 500 F'],
  ['Soupe kandia', '3 500 F'],
  ['Alloco', '1 500 F'],
  ['Fataya à la viande', '1 000 F'],
  ['Riz au gras', '2 500 F'],
];

const base = /* css */ `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @font-face { font-family: 'Fraunces-DisplayTitle'; src: url('/fonts/Fraunces-DisplayTitle.woff2') format('woff2'); font-weight: 580; }
  @font-face { font-family: 'InstrumentSans-Regular'; src: url('/fonts/InstrumentSans-Regular.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'InstrumentSans-SemiBold'; src: url('/fonts/InstrumentSans-SemiBold.woff2') format('woff2'); font-weight: 600; }
  html, body { height: 100%; }
  body {
    /* magenta matte — sharp trims to the screen box; never a brand color */
    background: #FF00FF;
    display: flex; align-items: center; justify-content: center;
    font-family: 'InstrumentSans-Regular', sans-serif;
  }
  .screen {
    height: 78svh; aspect-ratio: 653 / 1408;
    background: ${colors.surface.canvas};
    color: ${colors.content.primary};
    overflow: hidden; position: relative;
    display: flex; flex-direction: column;
  }
  .tabular { font-variant-numeric: tabular-nums; }
`;

const states = {
  // — état 1 : cadrage du menu (scan.frameTitle / frameHint / D28: zero
  //   saffron on the camera; porcelain shutter)
  camera: `
  <div class="screen">
    <div style="position:absolute; inset:0; background:${colors.surface.sunken}; padding:12% 10%;">
      <div style="background:${colors.surface.raised}; border-radius:10px; padding:8% 7%; transform: rotate(-1.5deg); box-shadow: 0 6px 20px rgba(0,0,0,0.10);">
        <div style="font-family:'Fraunces-DisplayTitle'; font-size:20px; margin-bottom:14px;">Chez Fatou</div>
        ${MENU.map(([dish, price]) => `<div style="display:flex; justify-content:space-between; font-size:12.5px; line-height:2.1; color:${colors.content.secondary};"><span>${dish}</span><span class="tabular">${price}</span></div>`).join('')}
      </div>
    </div>
    <div style="position:absolute; top:4%; left:6%; background:${colors.surface.raised}; border-radius:999px; padding:8px 16px; font-size:13px;">Fermer</div>
    <div style="position:absolute; inset:16% 8% 24% 8%; border:2.5px solid ${colors.surface.raised}; border-radius:18px; opacity:0.9;"></div>
    <div style="position:absolute; left:0; right:0; bottom:0; padding:5% 8% 7%; background:linear-gradient(transparent, rgba(0,0,0,0.28)); text-align:center; color:${colors.content.inverse};">
      <div style="font-family:'InstrumentSans-SemiBold'; font-size:15px;">Placez tout le menu dans le cadre</div>
      <div style="font-size:12.5px; opacity:0.85; margin-top:4px;">Gardez le téléphone bien droit</div>
      <div style="width:64px; height:64px; border-radius:999px; background:${colors.surface.raised}; border:4px solid ${colors.border.DEFAULT}; margin:16px auto 0;"></div>
    </div>
  </div>`,

  // — état 2 : scan en cours (results.steps.reading_menu — caption ONLY:
  //   the PAGE dot becomes the in-app loading dot; a dot baked into this
  //   texture would break the one-dot rule)
  scan: `
  <div class="screen" style="align-items:center; justify-content:center;">
    <div style="height:28px;"></div>
    <div style="margin-top:22px; font-size:15px; color:${colors.content.secondary};">Lecture du menu…</div>
  </div>`,

  // — état 3 : résultats en formation (results.ourPick / orderThis /
  //   onTheMenu; imageless hero card — a sanctioned app code path)
  results: `
  <div class="screen" style="padding:7% 6%; gap:12px;">
    <div style="background:${colors.surface.raised}; border-radius:24px; padding:7%; box-shadow: 0 6px 20px rgba(28,23,20,0.10);">
      <div style="display:flex; align-items:center; gap:7px;">
        <div style="width:9px; height:9px; border-radius:999px; background:${colors.accent.DEFAULT};"></div>
        <div style="font-family:'InstrumentSans-SemiBold'; font-size:10.5px; letter-spacing:1.2px; color:${colors.content.secondary};">NOTRE CHOIX</div>
      </div>
      <div style="font-family:'Fraunces-DisplayTitle'; font-size:24px; margin-top:8px;">Poulet Yassa</div>
      <div style="font-size:12.5px; line-height:1.5; color:${colors.content.secondary}; margin-top:6px;">Généreux et parfumé — le choix sûr ici.</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
        <div class="tabular" style="font-family:'InstrumentSans-SemiBold'; font-size:15px; white-space:nowrap;">3 500 F</div>
        <div style="background:${colors.accent.DEFAULT}; color:${colors.accent.on}; border-radius:999px; padding:9px 18px; font-family:'InstrumentSans-SemiBold'; font-size:12.5px;">Commandez ceci</div>
      </div>
    </div>
    <div style="font-family:'Fraunces-DisplayTitle'; font-size:17px; margin-top:8px;">Sur le menu</div>
    ${MENU.slice(1, 4).map(([dish, price]) => `<div style="display:flex; justify-content:space-between; background:${colors.surface.raised}; border-radius:14px; padding:12px 14px; font-size:12.5px;"><span>${dish}</span><span class="tabular" style="color:${colors.content.secondary};">${price}</span></div>`).join('')}
  </div>`,
};

mkdirSync('public/screens-src', { recursive: true });
for (const [name, body] of Object.entries(states)) {
  writeFileSync(
    `public/screens-src/${name}.html`,
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${base}</style></head><body>${body}</body></html>`,
  );
  console.log(`wrote public/screens-src/${name}.html`);
}
// motion tokens intentionally unused here — states are stills by design
void motion;
