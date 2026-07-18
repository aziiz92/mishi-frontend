// Hero→menu handoff geometry — pure cover math, unit-tested. The hero
// illustration renders object-cover/object-bottom in a 100vw×100vh box;
// this maps HERO_MENU_REGION (fractions of the 1672×941 master) to the
// on-screen rect of the menu drawn inside it, and derives where the
// isolated three-fold overlay must sit so its center+right panels land on
// the hero menu's two (ISOLATED_MENU_MAP).

import { HERO_MENU_REGION, ISOLATED_MENU_MAP, landingAssets } from '../landing.assets';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const IMG_W = landingAssets.heroRestaurant.width;
const IMG_H = landingAssets.heroRestaurant.height;
const ISOLATED_ASPECT = 433 / 577; // menu.png h/w

// The hero menu's rect in VIEWPORT px at scroll 0 (== document px: the
// hero section starts at document top).
export function heroMenuRect(vw: number, vh: number): Rect {
  const s = Math.max(vw / IMG_W, vh / IMG_H); // object-cover scale
  const offsetX = (vw - IMG_W * s) / 2; // object-position x: center
  const offsetY = vh - IMG_H * s; // object-position y: bottom
  return {
    x: offsetX + HERO_MENU_REGION.x * IMG_W * s,
    y: offsetY + HERO_MENU_REGION.y * IMG_H * s,
    w: HERO_MENU_REGION.w * IMG_W * s,
    h: HERO_MENU_REGION.h * IMG_H * s,
  };
}

// Where the isolated menu overlay starts: its x-fraction `centerFoldX`
// aligns with the hero menu's left edge, its remaining width covers the
// spread. Returned in the same space as heroMenuRect.
export function overlayStartRect(vw: number, vh: number): Rect {
  const region = heroMenuRect(vw, vh);
  const w = region.w / (1 - ISOLATED_MENU_MAP.centerFoldX);
  const h = w * ISOLATED_ASPECT;
  return {
    x: region.x - ISOLATED_MENU_MAP.centerFoldX * w,
    // the drawn menu leans away from the viewer — bias the overlay slightly
    // above the paper region so its visual mass matches
    y: region.y - 0.06 * h,
    w,
    h,
  };
}
