// Act 1 — Le Chaos choreography: the menu labyrinth (DL57). Same
// discipline as the dot and the scene: ONE pose table, tweens ONLY on the
// master timeline, the components are dumb DOM. Times are absolute
// master-timeline progress (sixths, like dot/path.ts).
//
// Beat map:
//   0.115–0.185  lift      the hero menu rises off the table
//   0.165–0.225  unfold    side panels swing open into walls — the room
//   0.195/0.265/0.315      the dot's attempted choices (path.ts 0.2/0.27/
//                          0.33) each reveal MORE information, not clarity
//   0.240–0.300  press     walls steepen and close in; the scrim rises
//   0.300–0.345  collapse  everything converges into the scan frame
//   0.350–0.375  handoff   the frame recedes into the espresso dark where
//                          Act 2's phone screen (same 204×440) lights up

import gsap from 'gsap';

import { EASE, registerDotEases } from '../dot/path';

export interface ChaosDomTargets {
  stage: HTMLElement | null;
  panels: HTMLElement[]; // [data-chaos-panel] — pose keyed by its value
  reveals: HTMLElement[]; // [data-chaos-reveal] — beat keyed by its value
  copyLines: HTMLElement[]; // [data-chaos-copy-line], document order
  scrim: HTMLElement | null;
  frame: HTMLElement | null;
}

const B = { lift: 0.115, unfold: 0.165, press: 0.24, collapse: 0.3, done: 0.345 } as const;

// Viewport units resolved at compile time — the spine (timeline + dot
// path) is destroyed and rebuilt as a whole on tier change, same staleness
// contract as compileDotPath's anchor rects.
const vw = (n: number) => (n / 100) * window.innerWidth;
const vh = (n: number) => (n / 100) * window.innerHeight;

interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  scale?: number;
  opacity?: number;
}

interface PanelScript {
  origin: string; // hinge — side panels fold from the center panel's edge
  at: number; // when this panel's entrance starts
  duration: number;
  folded: Pose; // packed into/behind the menu on the table
  open: Pose; // unfolded — its place in the room
  pressed: Pose; // the room closing in
}

// The labyrinth's pose table. rotationY signs: positive turns a panel's
// left half toward the viewer — +52° at screen-left reads as the corridor's
// left wall, -52° mirrored on the right.
function panelScripts(): Record<string, PanelScript> {
  return {
    center: {
      origin: '50% 100%',
      at: B.lift,
      duration: 0.07,
      folded: { y: vh(46), z: 0, rotationX: 74, rotationY: 0, scale: 0.6, opacity: 0 },
      open: { y: 0, z: 0, rotationX: 6, rotationY: 0, scale: 1, opacity: 1 },
      pressed: { z: 110, rotationX: 2, scale: 1.06 },
    },
    left: {
      origin: '100% 50%',
      at: B.unfold,
      duration: 0.06,
      folded: { x: vw(-7), y: vh(6), z: -30, rotationY: -150, scale: 0.9, opacity: 0 },
      open: { x: vw(-27), y: 0, z: 40, rotationY: 52, scale: 1, opacity: 1 },
      pressed: { x: vw(-17), z: 170, rotationY: 68 },
    },
    right: {
      origin: '0% 50%',
      at: B.unfold,
      duration: 0.06,
      folded: { x: vw(7), y: vh(6), z: -30, rotationY: 150, scale: 0.9, opacity: 0 },
      open: { x: vw(27), y: 0, z: 40, rotationY: -52, scale: 1, opacity: 1 },
      pressed: { x: vw(17), z: 170, rotationY: -68 },
    },
    'back-left': {
      origin: '50% 50%',
      at: 0.19,
      duration: 0.06,
      folded: { x: vw(-13), y: vh(-4), z: -350, rotationY: 24, scale: 1, opacity: 0 },
      open: { x: vw(-13), y: vh(-4), z: -350, rotationY: 24, scale: 1, opacity: 0.35 },
      pressed: { x: vw(-10), z: -260, opacity: 0.5 },
    },
    'back-right': {
      origin: '50% 50%',
      at: 0.19,
      duration: 0.06,
      folded: { x: vw(13), y: vh(4), z: -350, rotationY: -24, scale: 1, opacity: 0 },
      open: { x: vw(13), y: vh(4), z: -350, rotationY: -24, scale: 1, opacity: 0.35 },
      pressed: { x: vw(10), z: -260, opacity: 0.5 },
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
  // Linear by construction — any ease would let the room slide.
  if (dom.stage) {
    tl.fromTo(
      dom.stage,
      { y: vh(500 * B.lift - 100) },
      { y: vh(500 * 0.375 - 100), duration: 0.375 - B.lift, ease: 'none' },
      B.lift,
    );
  }

  const scripts = panelScripts();
  for (const panel of dom.panels) {
    const script = scripts[panel.dataset.chaosPanel ?? ''];
    if (!script) continue;
    // static placement, not motion: panels self-center; side panels hinge
    // on the edge they share with the center panel
    gsap.set(panel, { xPercent: -50, yPercent: -50, transformOrigin: script.origin, force3D: true });

    tl.fromTo(panel, script.folded, { ...script.open, duration: script.duration, ease: EASE.enter }, script.at);
    tl.to(panel, { ...script.pressed, duration: B.collapse - B.press, ease: EASE.standard }, B.press);
    tl.to(
      panel,
      { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 0.2, opacity: 0, duration: B.done - B.collapse, ease: EASE.standard },
      B.collapse,
    );
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

  if (dom.frame) {
    tl.fromTo(
      dom.frame,
      { xPercent: -50, yPercent: -50, scale: 1.55, opacity: 0 },
      { xPercent: -50, yPercent: -50, scale: 1, opacity: 1, duration: 0.04, ease: EASE.enter },
      B.collapse,
    );
    // handoff: recede into the dark where the phone screen takes over
    tl.to(dom.frame, { scale: 0.92, opacity: 0, duration: 0.025, ease: EASE.standard }, 0.35);
  }
}
