// The dot's journey — ONE ordered keyframe list spanning all six acts,
// compiled into consecutive segments on the master timeline. Segments are
// generated from consecutive keyframe pairs, so each starts exactly where
// the previous ended: continuity by construction, never per-section tweens.
//
// Easing family: the Results-Screen curves. The build prompt references
// MishiResults.jsx; that prototype's curves live (named identically) in
// mishi-mobile/src/lib/motion.ts and are mirrored in src/theme/tokens.ts:
//   standard  cubic-bezier(0.2, 0, 0, 1)
//   enter     cubic-bezier(0.05, 0.7, 0.1, 1)
//   dot       cubic-bezier(0.34, 1.3, 0.4, 1)  — slight overshoot; alive, not bouncy

import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

import { dotState, HERO_VALLEY_AY, type DotOwner } from './state';

// The named Results-Screen eases, registered as gsap CustomEases from the
// same bezier values as tokens.ts / mishi-mobile motion.ts.
export const EASE = {
  standard: 'mishi-standard', // cubic-bezier(0.2, 0, 0, 1)
  enter: 'mishi-enter', // cubic-bezier(0.05, 0.7, 0.1, 1)
  dot: 'mishi-dot', // cubic-bezier(0.34, 1.3, 0.4, 1)
} as const;

type EaseName = keyof typeof EASE;

let easesRegistered = false;
export function registerDotEases(): void {
  if (easesRegistered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASE.standard, '0.2, 0, 0, 1');
  CustomEase.create(EASE.enter, '0.05, 0.7, 0.1, 1');
  CustomEase.create(EASE.dot, '0.34, 1.3, 0.4, 1');
  easesRegistered = true;
}

export interface DotKeyframe {
  at: number; // absolute master-timeline progress, 0..1
  anchor: string; // data-dot-anchor name to target
  ax?: number; // fraction of anchor box, default 0.5 (center)
  ay?: number;
  dx?: number; // px offset from that point
  dy?: number;
  scaleX?: number;
  scaleY?: number;
  ease?: EaseName; // ease INTO this keyframe (default standard)
  owner?: DotOwner; // desired renderer FROM this keyframe on (Tier A)
}

// Act boundaries are sixths (equal-height sections, Phase 1 spine).
// act0 0.000 · act1 0.167 · act2 0.333 · act3 0.500 · act4 0.667 · act5 0.833
export const DOT_KEYFRAMES: DotKeyframe[] = [
  // — Act 0 · Le Point Tombe: settled in the valley of the m (the CSS drop
  //   already happened on load). The hold is SHORT: the wordmark exits the
  //   viewport around p≈0.06, and the dot must let go while both are still
  //   in sight — never ride off-screen and reappear (found live, 2026-07-12).
  { at: 0.0, anchor: 'hero-mark', ay: HERO_VALLEY_AY, owner: 'dom' },
  { at: 0.045, anchor: 'hero-mark', ay: HERO_VALLEY_AY },

  // leaves the wordmark and wanders down while Act 0 scrolls away —
  // visibly in the viewport the whole way
  { at: 0.11, anchor: 'chaos-1', ax: 0.3, dy: -170, ease: 'standard' },

  // — Act 1 · Le Chaos: hesitation — approach a line, retreat, approach
  //   another, retreat. Motion communicates indecision.
  { at: 0.2, anchor: 'chaos-1', ax: 0.15, dy: -20, ease: 'enter' },
  { at: 0.235, anchor: 'chaos-1', ax: 0.4, dy: -44, ease: 'standard' }, // retreat
  { at: 0.27, anchor: 'chaos-2', ax: 0.75, dy: -20, ease: 'enter' },
  { at: 0.3, anchor: 'chaos-2', ax: 0.5, dy: -48, ease: 'standard' }, // retreat again
  { at: 0.33, anchor: 'chaos-3', ax: 0.3, dy: -22, ease: 'enter' },

  // — Act 2 · Le Scan: the dot flies into the phone screen and BECOMES the
  //   in-app loading dot — settling at the loading screen's dot position
  //   and pulsing (the Results-Screen loading echo; the baked scan texture
  //   deliberately has no dot of its own). WebGL takes ownership as it
  //   crosses the screen edge (Tier A).
  { at: 0.36, anchor: 'phone-screen', ax: 0.5, ay: 0.12, ease: 'enter', owner: 'gl' },
  { at: 0.4, anchor: 'phone-screen', ax: 0.5, ay: 0.455, ease: 'dot' },
  { at: 0.43, anchor: 'phone-screen', ax: 0.5, ay: 0.455, scaleX: 1.16, scaleY: 1.16, ease: 'standard' },
  { at: 0.46, anchor: 'phone-screen', ax: 0.5, ay: 0.455, scaleX: 1, scaleY: 1, ease: 'standard' },
  { at: 0.5, anchor: 'phone-screen', ax: 0.5, ay: 0.455, scaleX: 1.16, scaleY: 1.16, ease: 'standard' },

  // — Act 3 · Le Choix: exit the screen, streak across, land on the plate,
  //   bloom (placeholder ripple — the real cream bloom shader is Phase 3).
  { at: 0.515, anchor: 'phone-screen', ax: 0.5, ay: 0.06, ease: 'standard' },
  { at: 0.55, anchor: 'plate', ax: -0.35, ay: -0.2, scaleX: 1.5, scaleY: 0.7, ease: 'enter' }, // the streak
  { at: 0.585, anchor: 'plate', scaleX: 1, scaleY: 1, ease: 'dot' }, // land — overshoot family
  { at: 0.61, anchor: 'plate', scaleX: 1.9, scaleY: 1.9, ease: 'enter' }, // bloom placeholder
  { at: 0.64, anchor: 'plate', scaleX: 1, scaleY: 1, ease: 'standard' },

  // — Act 4 · La Confiance: the dot is the bullet, traveling the triptych.
  //   DOM takes back ownership at the boundary (Tier A).
  { at: 0.7, anchor: 'panel-1', ay: 0, dy: -24, ease: 'dot', owner: 'dom' },
  { at: 0.76, anchor: 'panel-2', ay: 0, dy: -24, ease: 'dot' },
  { at: 0.82, anchor: 'panel-3', ay: 0, dy: -24, ease: 'dot' },

  // — Act 5 · La Décision: the final period. Journey complete.
  { at: 0.9, anchor: 'period', dy: -40, ease: 'standard' },
  { at: 0.96, anchor: 'period', scaleX: 0.75, scaleY: 0.75, ease: 'dot' },
];

// Ownership segments derived from the SAME keyframe table (single source).
export function ownerSegments(frames: DotKeyframe[] = DOT_KEYFRAMES): { at: number; owner: DotOwner }[] {
  return frames.filter((f): f is DotKeyframe & { owner: DotOwner } => f.owner !== undefined).map((f) => ({ at: f.at, owner: f.owner }));
}

// Desired owner at a progress value. Tier B / static never leave the DOM.
export function ownerAt(progress: number, tier: 'tierA' | 'tierB' | 'static', frames?: DotKeyframe[]): DotOwner {
  if (tier !== 'tierA') return 'dom';
  let owner: DotOwner = 'dom';
  for (const seg of ownerSegments(frames)) {
    if (progress >= seg.at) owner = seg.owner;
    else break;
  }
  return owner;
}

// ---------------------------------------------------------------------------
// Compilation: measure anchors, convert keyframes to viewport-space dot
// positions per progress, lay segments onto the master timeline.

function anchorDocRects(): Map<string, { left: number; top: number; width: number; height: number }> {
  const rects = new Map();
  for (const el of document.querySelectorAll<HTMLElement>('[data-dot-anchor]')) {
    const r = el.getBoundingClientRect();
    rects.set(el.dataset.dotAnchor!, {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    });
  }
  return rects;
}

// The spine (timeline + path) is destroyed and rebuilt as a whole on
// resize, so compilation needs no incremental removal.
export function compileDotPath(timeline: gsap.core.Timeline): void {
  registerDotEases();
  const rects = anchorDocRects();

  // Keyframes resolve in DOCUMENT space; the renderer subtracts live
  // scrollY at render time. This is what keeps a "hold" glued to its
  // anchor: baking scroll into the keyframes would make every eased
  // segment fight the page's linear scroll (the dot visibly races ahead
  // of the content it should ride with).
  const resolve = (f: DotKeyframe) => {
    const r = rects.get(f.anchor);
    if (!r) throw new Error(`dot anchor missing: ${f.anchor}`);
    return {
      cx: r.left + (f.ax ?? 0.5) * r.width + (f.dx ?? 0),
      cy: r.top + (f.ay ?? 0.5) * r.height + (f.dy ?? 0),
      scaleX: f.scaleX ?? 1,
      scaleY: f.scaleY ?? 1,
    };
  };

  // Initialize state at keyframe 0 and add one tween per consecutive pair —
  // all on the master timeline, none anywhere else.
  const first = resolve(DOT_KEYFRAMES[0]);
  Object.assign(dotState, first);

  for (let i = 1; i < DOT_KEYFRAMES.length; i++) {
    const frame = DOT_KEYFRAMES[i];
    const start = DOT_KEYFRAMES[i - 1].at;
    timeline.to(
      dotState,
      {
        ...resolve(frame),
        duration: frame.at - start,
        ease: EASE[frame.ease ?? 'standard'],
      },
      start,
    );
  }
}
