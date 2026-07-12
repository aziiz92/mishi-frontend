// The menu dataset — single source for the hero background, the Act 1
// chaos field, and (at next re-bake) the phone screen states.

import data from '../../content/menu-lines.json';

export interface MenuLine {
  name: string;
  price: number;
}

export const MENU_LINES: MenuLine[] = data.dishes;

// FCFA, French formatting: narrow no-break space thousands separator,
// "F" suffix (the app's own price rendering). Digits rely on tabular-nums
// (Instrument Sans only — Fraunces has no tnum, DL9).
export function formatPrice(fcfa: number): string {
  // fr-FR grouping uses U+202F narrow no-break space (in the font subset)
  return `${fcfa.toLocaleString('fr-FR')} F`;
}

// Deterministic pseudo-random helpers so the chaos field is stable across
// renders, tiers, and capture runs (no Math.random in the layout).
export const chaosTilt = (i: number): number => ((i * 47) % 9) - 4; // -4..4 deg
export const chaosLeft = (i: number): number => ((i * 31) % 70) + 2; // 2..71 %
export const chaosTop = (i: number): number => ((i * 53) % 88) + 4; // 4..91 %
