// The scroll spine — concept doc §5. ONE master GSAP timeline scrubbed by
// scroll, with six labeled act boundaries. Every motion on the page
// attaches to this timeline at these labels; per-section one-off tweens
// are how continuity dies, and are banned.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { compileChaosTimeline } from '../chaos/timeline';
import { compileDotPath } from '../dot/path';
import { startDotRenderer } from '../dot/render';
import type { Tier } from '../lib/tier';
import { compileSceneTimeline } from '../scene/scene';
import { colors } from '../theme/tokens';

export const ACT_LABELS = ['act0', 'act1', 'act2', 'act3', 'act4', 'act5'] as const;

export interface ScrollSpine {
  lenis: Lenis;
  timeline: gsap.core.Timeline;
  currentDotOwner: () => 'dom' | 'gl';
  destroy: () => void;
}

export function createScrollSpine(container: HTMLElement, tier: Tier, dotEl: HTMLElement): ScrollSpine {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0); // Lenis drives; GSAP must not "catch up"

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  // Duration anchor: total duration exactly 1 so labels and dot keyframes
  // live at absolute progress values.
  timeline.to({}, { duration: 1 }, 0);

  // Acts are equal-height sections, so boundaries are even sixths.
  ACT_LABELS.forEach((label, i) => {
    timeline.addLabel(label, i / ACT_LABELS.length);
  });

  // The dot's journey — the single motion path, compiled onto this
  // timeline (src/dot/path.ts), rendered by the single writer.
  compileDotPath(timeline);
  const dotRenderer = startDotRenderer(timeline, tier, dotEl);

  // Acts 2–3 scene choreography (field, phone, plate, bloom, result card)
  // — same timeline, both tiers (Tier B reads sceneState via the frames'
  // capture source and the DOM tweens run everywhere).
  compileSceneTimeline(timeline, {
    page: container,
    act2Copy: document.getElementById('act2-copy'),
    resultCard: document.getElementById('result-card'),
    espresso: colors.surface.inverse,
    cream: colors.surface.canvas,
  });
  compileChaosTimeline(timeline, {
    stage: container.querySelector<HTMLElement>('[data-chaos-stage]'),
    panels: [...container.querySelectorAll<HTMLElement>('[data-chaos-panel]')],
    reveals: [...container.querySelectorAll<HTMLElement>('[data-chaos-reveal]')],
    copyLines: [...container.querySelectorAll<HTMLElement>('[data-chaos-copy-line]')],
    scrim: container.querySelector<HTMLElement>('[data-chaos-scrim]'),
    frame: container.querySelector<HTMLElement>('[data-chaos-frame]'),
  });

  return {
    lenis,
    timeline,
    currentDotOwner: dotRenderer.currentOwner,
    destroy: () => {
      dotRenderer.destroy();
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
