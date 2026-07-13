// Acts 2–3 scene choreography — same discipline as the dot: ONE state
// object, tweens ONLY on the master timeline, renderers are dumb readers.
// Timings reference act boundaries (sixths, same as dot/path.ts).

import { EASE, registerDotEases } from '../dot/path';

export interface SceneState {
  /** 0 = cream, 1 = espresso — Act 2's dark field (D1, ratified). */
  field: number;
  /** phone entrance: 0 below/rotated → 1 in place */
  phoneRise: number;
  /** discrete screen state: 0 camera → 1 scan → 2 results */
  screen: number;
  /** plate entrance: 0 below/tilted → 1 in place */
  plateRise: number;
  /** cream bloom on landing: 0 → 1 (the Results-Screen reveal gesture) */
  bloom: number;
  /** pinned result card reveal: 0 → 1 */
  resultUI: number;
}

export const sceneState: SceneState = {
  field: 0,
  phoneRise: 0,
  screen: 0,
  plateRise: 0,
  bloom: 0,
  resultUI: 0,
};

// DOM pieces the scene drives directly (field color, copy reveals) — passed
// in so the module stays testable.
export interface SceneDomTargets {
  page: HTMLElement; // background cream→espresso
  act2Copy: HTMLElement | null;
  resultCard: HTMLElement | null;
  espresso: string; // token values injected by the caller (no imports of
  cream: string; //    tokens here keeps this module pure data+timing)
}

export function compileSceneTimeline(tl: gsap.core.Timeline, dom: SceneDomTargets): void {
  registerDotEases();

  // — the field: cream → espresso entering Act 2, back to cream as Act 3
  //   returns to daylight (concept: "Return to cream")
  tl.fromTo(dom.page, { backgroundColor: dom.cream }, { backgroundColor: dom.espresso, duration: 0.06, ease: EASE.standard }, 0.3);
  tl.to(dom.page, { backgroundColor: dom.cream, duration: 0.06, ease: EASE.standard }, 0.5);
  tl.fromTo(sceneState, { field: 0 }, { field: 1, duration: 0.06, ease: EASE.standard }, 0.3);
  tl.to(sceneState, { field: 0, duration: 0.06, ease: EASE.standard }, 0.5);

  // — Act 2 copy: visible only while the field is dark
  if (dom.act2Copy) {
    tl.fromTo(dom.act2Copy, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: EASE.enter }, 0.34);
    tl.to(dom.act2Copy, { opacity: 0, duration: 0.03, ease: EASE.standard }, 0.5);
  }

  // — phone: rotates in as the field darkens, recedes as Act 3 begins
  tl.fromTo(sceneState, { phoneRise: 0 }, { phoneRise: 1, duration: 0.08, ease: EASE.enter }, 0.33);
  tl.to(sceneState, { phoneRise: 0, duration: 0.06, ease: EASE.standard }, 0.52);

  // — screen states, scrubbed: camera → scan (dot starts working) →
  //   results forming (as the dot finishes its sweep)
  tl.set(sceneState, { screen: 0 }, 0.33);
  tl.set(sceneState, { screen: 1 }, 0.415);
  tl.set(sceneState, { screen: 2 }, 0.48);

  // — plate: rotates up into view for the landing (dot lands at 0.585)
  tl.fromTo(sceneState, { plateRise: 0 }, { plateRise: 1, duration: 0.07, ease: EASE.dot }, 0.51);

  // — cream bloom radiates from the landing; result card follows
  tl.fromTo(sceneState, { bloom: 0 }, { bloom: 1, duration: 0.06, ease: EASE.enter }, 0.585);
  tl.fromTo(sceneState, { resultUI: 0 }, { resultUI: 1, duration: 0.05, ease: EASE.enter }, 0.6);
  if (dom.resultCard) {
    tl.fromTo(dom.resultCard, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.05, ease: EASE.enter }, 0.6);
  }
}
