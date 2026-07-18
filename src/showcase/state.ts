// The floating phone — same discipline as the old dot: ONE state object,
// tweens ONLY on the master timeline (src/showcase/timeline.ts), and the
// renderer (src/three/Stage.tsx) is a dumb reader that adds nothing but
// the idle float.

export interface PhonePose {
  /** horizontal center, as a fraction of viewport WIDTH from center (+ = right) */
  x: number;
  /** vertical center, as a fraction of viewport HEIGHT from center (+ = up) */
  y: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  /** phone body height as a fraction of viewport height */
  scale: number;
  /** idle-float amount 0..1 — damped to 0 while off-stage */
  float: number;
}

// Rest pose: parked below the fold during the hero, angled as if mid-turn,
// so the entrance reads as "rises and turns to face you".
export const phonePose: PhonePose = {
  x: 0.3,
  y: -1.4,
  rotX: 0.12,
  rotY: -1.9,
  rotZ: 0.2,
  scale: 0.75,
  float: 0,
};

// The phone is on stage when any part of it can be inside the viewport.
export function phoneOnStage(pose: PhonePose): boolean {
  return Math.abs(pose.y) < 1.2;
}
