import { describe, expect, it } from 'vitest';

import { heroMenuRect, overlayStartRect } from './heroMenu';
import { HERO_MENU_REGION, ISOLATED_MENU_MAP, landingAssets } from '../landing.assets';

const IMG_W = landingAssets.heroRestaurant.width;
const IMG_H = landingAssets.heroRestaurant.height;

describe('heroMenuRect (object-cover / object-bottom)', () => {
  it('wide viewport: image scales to width, crops the top, bottom edges align', () => {
    const vw = 1920;
    const vh = 900;
    const s = Math.max(vw / IMG_W, vh / IMG_H);
    const r = heroMenuRect(vw, vh);
    expect(r.w).toBeCloseTo(HERO_MENU_REGION.w * IMG_W * s, 6);
    // region runs to the image bottom, which sits at the viewport bottom
    expect(r.y + r.h).toBeCloseTo(vh, 4);
    // horizontally centered image: region is inside the viewport
    expect(r.x).toBeGreaterThan(0);
    expect(r.x + r.w).toBeLessThan(vw);
  });

  it('tall viewport: image scales to height, crops the sides symmetrically', () => {
    const vw = 390;
    const vh = 844;
    const s = vh / IMG_H; // height-limited
    const r = heroMenuRect(vw, vh);
    expect(r.h).toBeCloseTo(HERO_MENU_REGION.h * IMG_H * s, 6);
    const offsetX = (vw - IMG_W * s) / 2;
    expect(offsetX).toBeLessThan(0); // sides cropped
    expect(r.x).toBeCloseTo(offsetX + HERO_MENU_REGION.x * IMG_W * s, 6);
  });
});

describe('overlayStartRect', () => {
  it('maps the asset centerFoldX onto the hero menu left edge', () => {
    const vw = 1440;
    const vh = 900;
    const region = heroMenuRect(vw, vh);
    const o = overlayStartRect(vw, vh);
    // asset x-fraction centerFoldX lands exactly on the region's left edge
    expect(o.x + ISOLATED_MENU_MAP.centerFoldX * o.w).toBeCloseTo(region.x, 6);
    // the remaining width covers the whole spread
    expect(o.x + o.w).toBeCloseTo(region.x + region.w, 6);
    // aspect preserved (577×433)
    expect(o.h / o.w).toBeCloseTo(433 / 577, 6);
  });
});
