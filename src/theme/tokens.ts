/**
 * Mishi landing — design tokens. THE single color/motion source for both
 * worlds: Tailwind (tailwind.config.ts imports this) and Three.js
 * (materials/uniforms import this). Zero raw hex anywhere else.
 *
 * Mirrors the app's canonical /tailwind.config.js — verified hex-for-hex
 * by scripts/check-tokens.ts (runs as prebuild). If design-system.md and
 * this file disagree, the doc wins.
 */

// Primitive layer — internal. Exported ONLY for the mirror check; components
// and materials use the semantic `colors` below (you cannot write bg-saffron).
export const palette = {
  espresso: '#1C1714',
  warmCream: '#F7EFE2',
  saffron: '#E9A23B',
  sage: '#7E8B68',
  porcelain: '#FFF9EF',
  butterCream: '#F3E8D0',
  softAlmond: '#E6D9C7',
  umber: '#5A4638',
  taupe: '#9B8B7A',
  burntSaffron: '#C87B2F',
  paprika: '#C85F3C',
} as const;

// Semantic layer — identical structure and values to the app config.
export const colors = {
  transparent: 'transparent',

  surface: {
    canvas: palette.warmCream,
    raised: palette.porcelain,
    sunken: palette.butterCream,
    inverse: palette.espresso,
  },
  content: {
    primary: palette.espresso,
    secondary: palette.umber,
    tertiary: palette.taupe, // never below 18px; never must-read info
    inverse: palette.warmCream,
    warning: palette.burntSaffron,
    error: palette.paprika,
  },
  accent: {
    DEFAULT: palette.saffron, // landing ration: dot exempt; else CTAs + ≤1 accent/act
    pressed: palette.burntSaffron,
    on: palette.espresso, // text/icons on saffron fills — never cream
  },
  signal: {
    dietary: palette.sage, // sage exists ONLY here (Act 4, panel 1)
    'dietary-on': palette.warmCream,
    warning: palette.burntSaffron,
    error: palette.paprika,
  },
  border: {
    DEFAULT: palette.softAlmond,
    strong: palette.taupe,
  },
} as const;

// Motion — same values as the app config (Results-Screen easing family).
export const motion = {
  duration: {
    fast: '120ms',
    base: '240ms',
    slow: '420ms',
    reveal: '700ms', // reserved for "the dot decides"
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    enter: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    dot: 'cubic-bezier(0.34, 1.3, 0.4, 1)',
  },
} as const;
