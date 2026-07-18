// The scroll spine — ONE master GSAP timeline scrubbed by scroll.
// Every motion on the page attaches to this timeline; per-section one-off
// tweens are how continuity dies, and are banned.
//
// Since the 2026-07-18 redesign the spine drives exactly one performer:
// the floating 3D phone of the feature showcase (src/showcase/), plus the
// showcase copy reveals. The old dot journey / chaos / scene choreography
// is disconnected (modules parked in src/dot, src/chaos, src/scene).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { compileShowcase } from '../showcase/timeline';

export interface ScrollSpine {
  lenis: Lenis;
  timeline: gsap.core.Timeline;
  destroy: () => void;
}

export function createScrollSpine(container: HTMLElement): ScrollSpine {
  gsap.registerPlugin(ScrollTrigger);

  // long, gentle glide — the showcase is watched, not skimmed
  const lenis = new Lenis({ duration: 1.6 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0); // Lenis drives; GSAP must not "catch up"

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      // numeric scrub: the timeline eases toward the scroll position over
      // ~1.2s instead of tracking the wheel 1:1 — the transit reads as
      // motion even on a fast flick
      scrub: 1.2,
    },
  });

  // Duration anchor: total duration exactly 1 so every position on the
  // timeline is an absolute scroll-progress value.
  timeline.to({}, { duration: 1 }, 0);

  compileShowcase(timeline, {
    container,
    sections: [...container.querySelectorAll<HTMLElement>('[data-showcase]')],
    copies: [...container.querySelectorAll<HTMLElement>('[data-showcase]')].map((s) =>
      s.querySelector<HTMLElement>('[data-showcase-copy]'),
    ),
    outro: container.querySelector<HTMLElement>('[data-showcase-outro]'),
  });

  return {
    lenis,
    timeline,
    destroy: () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
