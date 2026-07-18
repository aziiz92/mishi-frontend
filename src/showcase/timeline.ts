// The showcase choreography — the Flowty-style scroll. Each feature
// section is a tall sticky screen; the phone travels between settled
// poses while the big copy holds. All motion attaches to the master
// timeline (progress 0..1) at positions computed from the sections'
// real document geometry, so section heights stay a pure layout choice.

import { phonePose } from './state';

const TAU = Math.PI * 2;

// Settled pose per feature section (index-matched to the [data-showcase]
// order). Sides mirror the copy: text left → phone right, and so on.
// rotY winds monotonically negative so every transit is a real turn —
// the phone's back shows mid-flight — never a rewind.
// The phone stays PORTRAIT throughout: rotZ never exceeds a lean.
const SETTLE = [
  { x: 0.24, y: 0.02, rotX: -0.06, rotY: -0.45, rotZ: -0.07, scale: 0.82 },
  { x: -0.24, y: 0, rotX: 0.05, rotY: -TAU + 0.45, rotZ: 0.07, scale: 0.82 },
  // the closing pose: centered-right, leaning back toward camera
  { x: 0.16, y: 0.02, rotX: -0.35, rotY: -TAU, rotZ: -0.06, scale: 0.86 },
];

export interface ShowcaseTargets {
  container: HTMLElement;
  /** the tall feature sections, in document order */
  sections: HTMLElement[];
  /** each section's copy block, index-matched to `sections` */
  copies: (HTMLElement | null)[];
  /** the section AFTER the showcase — the phone dives out before it */
  outro: HTMLElement | null;
}

export function compileShowcase(tl: gsap.core.Timeline, dom: ShowcaseTargets): void {
  const vh = window.innerHeight;
  const total = dom.container.offsetHeight - vh;
  if (total <= 0) return;
  const p = (docY: number) => Math.min(1, Math.max(0, docY / total));
  const span = (from: number, to: number) => Math.max(0.001, to - from);

  dom.sections.forEach((el, i) => {
    const top = el.offsetTop;
    const hold = Math.max(1, el.offsetHeight - vh); // px the sticky screen holds

    // phone transit: leaves the previous pose well before this section,
    // settles once the screen has been sticking a while — a LONG window
    // (~1.4 viewports of scroll), so the turn is watched, not glimpsed
    const arrive = p(top - vh * 0.75);
    const settle = p(top + hold * 0.4);
    const pose = SETTLE[Math.min(i, SETTLE.length - 1)];
    if (i === 0) {
      tl.to(phonePose, { ...pose, float: 1, duration: span(arrive, settle), ease: 'power2.inOut' }, arrive);
    } else {
      // two-beat transit with a center-screen waypoint: the phone crosses
      // the middle showing its back (rotY halfway through the wind), a
      // touch closer to camera, so the turn always plays out on screen
      const prev = SETTLE[Math.min(i - 1, SETTLE.length - 1)];
      const mid = arrive + span(arrive, settle) * 0.5;
      tl.to(
        phonePose,
        {
          x: (prev.x + pose.x) / 2,
          y: (prev.y + pose.y) / 2 + 0.04,
          rotX: (prev.rotX + pose.rotX) / 2,
          rotY: (prev.rotY + pose.rotY) / 2,
          rotZ: (prev.rotZ + pose.rotZ) / 2,
          scale: Math.max(prev.scale, pose.scale) * 1.12,
          float: 1,
          duration: span(arrive, mid),
          ease: 'power2.in',
        },
        arrive,
      );
      tl.to(phonePose, { ...pose, float: 1, duration: span(mid, settle), ease: 'power2.out' }, mid);
    }

    // copy: rises as the screen sticks, holds, gives way before the next act
    const copy = dom.copies[i];
    if (copy) {
      const inAt = p(top - vh * 0.15);
      const outAt = p(top + hold * 0.78);
      tl.fromTo(
        copy,
        { opacity: 0, y: 90 },
        { opacity: 1, y: 0, duration: span(inAt, p(top + hold * 0.18)), ease: 'power3.out' },
        inAt,
      );
      tl.to(copy, { opacity: 0, y: -70, duration: span(outAt, p(top + hold)), ease: 'power2.in' }, outAt);
    }
  });

  // the exit dive: the phone drops off the bottom as the outro arrives
  if (dom.outro) {
    const start = p(dom.outro.offsetTop - vh * 0.9);
    const end = p(dom.outro.offsetTop - vh * 0.12);
    tl.to(
      phonePose,
      { y: -1.5, x: 0.02, rotX: -1.1, rotZ: -0.18, scale: 0.72, float: 0, duration: span(start, end), ease: 'power2.in' },
      start,
    );
  }
}
