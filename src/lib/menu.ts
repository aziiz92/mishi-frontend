// The menu dataset — single source for the hero background and (at next
// re-bake) the phone screen states. Act 1's labyrinth panels draw their
// dish names from here too (content/menu-panels.json is a grouped subset
// — DL57), but with generic currency-free prices (DL59).

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
