// The dot — the page's single protagonist. ONE state object, ONE writer
// (the gsap ticker in src/dot/render.ts); the DOM element and the WebGL
// sphere are dumb renderers of this state. Ownership (which renderer
// shows the dot) flips atomically inside the same render tick, which is
// what makes a two-dot frame structurally impossible.

import type { Mesh } from 'three';

export type DotOwner = 'dom' | 'gl';

export interface DotState {
  // dot CENTER in DOCUMENT px (renderer subtracts live scrollY);
  // scale relative to --dot-size (24px)
  cx: number;
  cy: number;
  scaleX: number;
  scaleY: number;
  // false until the JS journey takes over from the CSS hero-drop animation
  jsOwned: boolean;
}

export const dotState: DotState = {
  cx: 0,
  cy: 0,
  scaleX: 1,
  scaleY: 1,
  jsOwned: false,
};

// Bridge to the lazily-loaded WebGL world (Stage.tsx registers here on
// mount). While glReady is false, the DOM keeps ownership whatever the
// path says — a dot must never wait on a chunk.
export interface GlBridge {
  sphere: Mesh | null;
  glReady: boolean;
  /** Registered by the single writer (render.ts): when the GL renderer
   *  unmounts mid-ownership, hand the dot back to the DOM in the SAME
   *  synchronous moment — a zero-dot frame is as much a defect as a
   *  two-dot frame. */
  releaseToDom: (() => void) | null;
}

export const glBridge: GlBridge = { sphere: null, glReady: false, releaseToDom: null };

// Desired owner comes from the path; the effective owner also needs the
// GL renderer to actually exist. Pure — unit tested.
export function effectiveOwner(desired: DotOwner, glReady: boolean): DotOwner {
  return desired === 'gl' && !glReady ? 'dom' : desired;
}

export const DOT_BASE_SIZE = 24; // px — must match --dot-size in index.css

// The valley of the m: dot center sits at this fraction of the hero mark's
// height (logo master: (632-368)/302). Used by the path keyframes AND the
// pre-drop CSS alignment — one constant, one landing spot.
export const HERO_VALLEY_AY = 0.874;

// Overwrite the CSS drop-target variables with the MEASURED mark position.
// index.css only carries estimates (50vw ignores the scrollbar; 22vh+84px
// assumes the mark's box) — the drop must land exactly where the journey's
// keyframe 0 will be, or the takeover shows a visible "adjustment" snap.
// Call before first paint (shell markup is measurable pre-React) and again
// on window load.
export function alignHeroDotTarget(): void {
  const mark = document.querySelector('[data-dot-anchor="hero-mark"]');
  const dot = document.getElementById('dot');
  if (!mark || !dot) return;
  const r = mark.getBoundingClientRect();
  if (r.width === 0) return; // not laid out yet — keep CSS estimates
  dot.style.setProperty('--dot-hero-tx', `${r.left + r.width / 2 - DOT_BASE_SIZE / 2}px`);
  dot.style.setProperty('--dot-hero-ty', `${r.top + r.height * HERO_VALLEY_AY - DOT_BASE_SIZE / 2}px`);
}
