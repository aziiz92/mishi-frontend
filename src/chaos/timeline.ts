// Act 1 — Le Chaos choreography: the illustrated menu labyrinth (DL61,
// superseding DL57's CSS-card build). Same discipline as the dot and the
// scene: ONE pose table, tweens ONLY on the master timeline, the
// components are dumb DOM. Times are absolute master-timeline progress
// (sixths, like dot/path.ts).
//
// Beat map:
//   0.050–0.115  track     the isolated three-fold overlay appears glued
//                          over the menu drawn in the hero and rides the
//                          scroll while the restaurant scene fades away
//   0.115–0.150  lift      the overlay lifts to stage center, straightens
//   0.150–0.175  separate  crossfade overlay → the three papers, fold-
//                          aligned at the same footprint
//   0.175–0.225  open      left/center/right swing open into the room
//   0.205–0.250  unfoldFar the far papers unfold from behind the walls
//                          (Tier A's five-panel accordion)
//   0.195/0.265/0.315      the dot's attempted choices (path.ts 0.2/0.27/
//                          0.33) each reveal MORE information, not clarity
//   0.250–0.300  press     walls steepen and close in; the scrim rises
//   0.300–0.335  straighten the room folds back into the flat strip
//   0.310–0.355  flatten   crossfade to the flat five-panel artwork, which
//                          shrinks into the scan frame
//   0.350–0.375  handoff   the frame recedes into the espresso dark where
//                          Act 2's phone screen (same 204×440) lights up

import gsap from 'gsap';

import { panelDisplayWidth, type PanelId } from './data';
import { overlayStartRect } from './heroMenu';
import { EASE, registerDotEases } from '../dot/path';

export interface ChaosDomTargets {
  stage: HTMLElement | null;
  panels: HTMLElement[]; // [data-chaos-panel] — pose keyed by its value
  overlay: HTMLElement | null; // [data-chaos-overlay] — the isolated menu
  flat: HTMLElement | null; // [data-chaos-flat] — the five-panel strip
  heroPicture: HTMLElement | null; // #act-0 picture img — fades as the menu lifts
  reveals: HTMLElement[]; // [data-chaos-reveal] — beat keyed by its value
  copyLines: HTMLElement[]; // [data-chaos-copy-line], document order
  scrim: HTMLElement | null;
  frame: HTMLElement | null;
}

const B = {
  track: 0.06,
  lift: 0.115,
  separate: 0.15,
  open: 0.175,
  unfoldFar: 0.205,
  press: 0.25,
  straighten: 0.3,
  flatten: 0.31,
  done: 0.345,
} as const;

// Viewport units resolved at compile time — the spine (timeline + dot
// path) is destroyed and rebuilt as a whole on resize/tier change, same
// staleness contract as compileDotPath's anchor rects.
const vw = (n: number) => (n / 100) * window.innerWidth;
const vh = (n: number) => (n / 100) * window.innerHeight;

interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  scale?: number;
}

interface PanelScript {
  origin: string; // hinge — panels fold from the edge they share
  folded: Pose; // fold-aligned in the strip the overlay hands off to
  open: Pose; // unfolded — its place in the room (three depth zones)
  pressed: Pose; // the room closing in
}

// The labyrinth's pose table. rotationY signs: positive turns a panel's
// left half toward the viewer — +50° at screen-left reads as the
// corridor's left wall, mirrored on the right. The strip's x offsets are
// fold-adjacent (papers share edges, 96% to overlap the fold line).
function panelScripts(panelH: number): Record<PanelId, PanelScript> {
  const w = (id: PanelId) => panelDisplayWidth(id, panelH);
  const step = (a: PanelId, b: PanelId) => ((w(a) + w(b)) / 2) * 0.96;
  const xLeft = -step('center', 'left');
  const xRight = step('center', 'right');

  return {
    center: {
      origin: '50% 50%',
      folded: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 1 },
      open: { x: 0, y: 0, z: -80, rotationX: 4, rotationY: 0, scale: 1 },
      pressed: { z: 30, rotationX: 2, scale: 1.05 },
    },
    left: {
      origin: '100% 50%',
      folded: { x: xLeft, y: 0, z: 0, rotationY: 16, scale: 1 },
      open: { x: vw(-26), y: 0, z: 60, rotationY: 50, scale: 1 },
      pressed: { x: vw(-17), z: 190, rotationY: 66 },
    },
    right: {
      origin: '0% 50%',
      folded: { x: xRight, y: 0, z: 0, rotationY: -16, scale: 1 },
      open: { x: vw(26), y: 0, z: 60, rotationY: -50, scale: 1 },
      pressed: { x: vw(17), z: 190, rotationY: -66 },
    },
    'far-left': {
      origin: '100% 50%',
      folded: { x: xLeft - w('left') * 0.4, y: 0, z: -10, rotationY: 32, scale: 1 },
      open: { x: vw(-42), y: 0, z: 140, rotationY: 64, scale: 1 },
      pressed: { x: vw(-31), z: 300, rotationY: 76 },
    },
    'far-right': {
      origin: '0% 50%',
      folded: { x: xRight + w('right') * 0.4, y: 0, z: -10, rotationY: -32, scale: 1 },
      open: { x: vw(42), y: 0, z: 140, rotationY: -64, scale: 1 },
      pressed: { x: vw(31), z: 300, rotationY: -76 },
    },
  };
}

// Every attempted choice answers with detail, never a decision. Keyed by
// dish id (content/menu-panels.json); beats land just before the dot's
// arrival keyframes so the text is there when it hovers.
const REVEAL_BEATS: Record<string, number> = {
  'nems-poulet': 0.195, // left wall — dot keyframe 0.2
  'dibi-mouton': 0.265, // right wall — 0.27
  'poulet-yassa': 0.315, // center, mid-collapse: the last attempt fails too
};

export function compileChaosTimeline(tl: gsap.core.Timeline, dom: ChaosDomTargets): void {
  registerDotEases();

  // Counter-pin: the stage (inset-0 of a 100vh section starting at 100vh of
  // a 5×100vh scroll) stays viewport-centered when y(p) = (500p − 100)vh.
  // Linear by construction — any ease would let the room slide. Starts at
  // B.track so the overlay handoff happens in viewport space.
  if (dom.stage) {
    tl.fromTo(
      dom.stage,
      { y: vh(500 * B.track - 100) },
      { y: vh(500 * 0.375 - 100), duration: 0.375 - B.track, ease: 'none' },
      B.track,
    );
  }

  // One JS source for the papers' display height: CSS reads --panel-h
  // (MenuPanel), the pose math reads panelH below.
  const panelH = Math.min(vh(66), 540, vw(56));
  dom.stage?.style.setProperty('--panel-h', `${panelH}px`);
  const scripts = panelScripts(panelH);
  const stripWidth =
    panelDisplayWidth('left', panelH) + panelDisplayWidth('center', panelH) + panelDisplayWidth('right', panelH);

  // — the isolated menu overlay: glued over the hero's drawn menu, riding
  //   the scroll (stage space == viewport space while the counter-pin is
  //   active), then lifting to center and handing off to the papers.
  if (dom.overlay) {
    const start = overlayStartRect(window.innerWidth, window.innerHeight);
    const scrollPx = (p: number) => p * 5 * vh(100); // 6 acts → 5×100vh of scroll
    const liftScale = (stripWidth * 1.04) / start.w;
    // top-left coordinates; scale is transform-origin center
    const centerX = vw(50) - start.w / 2;
    const centerY = vh(45) - start.h / 2;

    gsap.set(dom.overlay, { width: start.w, transformOrigin: '50% 50%', force3D: true });
    tl.fromTo(dom.overlay, { opacity: 0 }, { opacity: 1, duration: 0.02, ease: EASE.enter }, B.track - 0.01);
    tl.fromTo(
      dom.overlay,
      { x: start.x, y: start.y - scrollPx(B.track), scale: 1 },
      { y: start.y - scrollPx(B.lift), duration: B.lift - B.track, ease: 'none' }, // glued to the scroll
      B.track,
    );
    tl.to(
      dom.overlay,
      { x: centerX, y: centerY, scale: liftScale, duration: B.separate + 0.015 - B.lift, ease: EASE.enter },
      B.lift,
    );
    tl.to(dom.overlay, { opacity: 0, duration: 0.025, ease: EASE.standard }, B.separate);
  }

  // — the restaurant scene dissolves as its menu lifts away (the hero
  //   headline has scrolled off by now; the illustration alone fades)
  if (dom.heroPicture) {
    tl.to(dom.heroPicture, { opacity: 0, scale: 1.05, duration: 0.07, ease: EASE.standard }, 0.07);
  }

  // — the papers: appear fold-aligned under the overlay crossfade, swing
  //   open into the room, close in, straighten back into the strip.
  for (const panel of dom.panels) {
    const id = panel.dataset.chaosPanel as PanelId | undefined;
    const script = id && scripts[id];
    if (!script) continue;
    const isFar = id === 'far-left' || id === 'far-right';

    // static placement, not motion: panels self-center; each hinges on the
    // fold edge it shares with its neighbor
    gsap.set(panel, { xPercent: -50, yPercent: -50, transformOrigin: script.origin, force3D: true, ...script.folded });

    if (isFar) {
      // far papers stay folded behind the walls until the accordion beat
      tl.to(panel, { opacity: 1, duration: 0.01, ease: 'none' }, B.unfoldFar);
      tl.to(panel, { ...script.open, duration: 0.045, ease: EASE.enter }, B.unfoldFar);
    } else {
      tl.to(panel, { opacity: 1, duration: 0.025, ease: EASE.enter }, B.separate);
      tl.to(panel, { ...script.open, duration: 0.05, ease: EASE.enter }, B.open);
    }
    tl.to(panel, { ...script.pressed, duration: 0.05, ease: EASE.standard }, B.press);
    tl.to(
      panel,
      { ...script.folded, scale: 0.92, duration: 0.03, ease: EASE.standard },
      B.straighten,
    );
    tl.to(panel, { opacity: 0, duration: 0.02, ease: EASE.standard }, B.flatten);
  }

  for (const el of dom.reveals) {
    const at = REVEAL_BEATS[el.dataset.chaosReveal ?? ''];
    if (at === undefined) continue;
    tl.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.03, ease: EASE.enter }, at);
  }

  // The held line, one truth at a time, in step with the pressure.
  dom.copyLines.forEach((line, i) => {
    tl.fromTo(line, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.03, ease: EASE.enter }, 0.215 + i * 0.04);
  });
  if (dom.copyLines.length) {
    tl.to(dom.copyLines, { opacity: 0, duration: 0.025, ease: EASE.standard }, 0.335);
  }

  if (dom.scrim) {
    tl.fromTo(dom.scrim, { opacity: 0 }, { opacity: 0.3, duration: 0.06, ease: EASE.standard }, B.press);
    tl.to(dom.scrim, { opacity: 0, duration: 0.03, ease: EASE.standard }, 0.335);
  }

  // — the flat strip: fades in over the straightened papers, then shrinks
  //   into the viewfinder the phone will answer
  if (dom.flat) {
    const flatToFrame = 204 / Math.min(vw(84), 66 * 16); // frame width / strip display width
    tl.fromTo(
      dom.flat,
      { xPercent: -50, yPercent: -50, scale: 1, opacity: 0 },
      { opacity: 1, duration: 0.02, ease: EASE.enter },
      B.flatten,
    );
    tl.to(dom.flat, { scale: flatToFrame, opacity: 0, duration: 0.035, ease: EASE.standard }, 0.32);
  }

  if (dom.frame) {
    tl.fromTo(
      dom.frame,
      { xPercent: -50, yPercent: -50, scale: 1.55, opacity: 0 },
      { xPercent: -50, yPercent: -50, scale: 1, opacity: 1, duration: 0.04, ease: EASE.enter },
      0.315,
    );
    // handoff: recede into the dark where the phone screen takes over
    tl.to(dom.frame, { scale: 0.92, opacity: 0, duration: 0.025, ease: EASE.standard }, 0.35);
  }
}
