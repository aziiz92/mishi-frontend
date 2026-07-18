// Act 1 data — the illustrated labyrinth's live typography (DL61). Dish
// names are the real ones (content/menu-lines.json, A7 composition);
// prices are deliberately generic and currency-free (DL59). The painted
// panel assets carry the menu's density; the DOM overlays 8 meaningful
// dishes, three of them the dot's hesitation targets (DL60).

import data from '../../content/menu-panels.json';

import { landingAssets } from '../landing.assets';

// HOLD (Aziiz, 2026-07-17): Act 1's illustrated visuals (papers, isolated
// overlay, flat strip, scan frame, hero-picture fade) are parked while the
// hero is stabilized step by step. Flip to true to remount them; the
// timeline compiles around their absence via its null/empty guards.
export const ACT1_VISUALS = false;

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: string;
  /** fraction of the panel's height where this live row sits */
  top: number;
}

export type PanelId = 'far-left' | 'left' | 'center' | 'right' | 'far-right';

export interface MenuPanelData {
  id: PanelId;
  items: MenuItemData[];
}

export const CHAOS_PANELS = data.panels as MenuPanelData[];

// The illustrated paper per panel: src + intrinsic size. Display height is
// proportional to the drawn height (center = the tallest reference), so the
// five papers compose back into one connected menu.
export const PANEL_ART: Record<PanelId, { src: string; w: number; h: number }> = {
  'far-left': { src: landingAssets.menuPanels.farLeft, w: 681, h: 1176 },
  left: { src: landingAssets.menuPanels.left, w: 667, h: 1191 },
  center: { src: landingAssets.menuPanels.center, w: 889, h: 1264 },
  right: { src: landingAssets.menuPanels.right, w: 668, h: 1232 },
  'far-right': { src: landingAssets.menuPanels.farRight, w: 815, h: 1287 },
};

/** display height, given the base panel height (center's height) */
export const panelDisplayHeight = (id: PanelId, baseH: number) => (PANEL_ART[id].h / PANEL_ART.center.h) * baseH;

/** display width, given the base panel height */
export const panelDisplayWidth = (id: PanelId, baseH: number) =>
  (PANEL_ART[id].w / PANEL_ART[id].h) * panelDisplayHeight(id, baseH);
