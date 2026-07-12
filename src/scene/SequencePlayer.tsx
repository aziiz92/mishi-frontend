// Tier B's "canvas": pre-rendered AVIF frames of Acts 2–3 (captured from
// Tier A with ?bare=1 — frames can never contain the dot, the copy, or the
// result card; those stay live DOM in both tiers). Frames swap by master-
// timeline progress. Fidelity degrades, meaning doesn't (§3).

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import { frameForProgress, frameSrc, SEQ_FRAMES } from './sequence';

export function SequencePlayer({ getProgress }: { getProgress: () => number }) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let preloaded = false;
    const tick = () => {
      const el = imgRef.current;
      if (!el) return;
      const p = getProgress();
      // approach preload: fetch all frames once the reader nears Act 2
      if (!preloaded && p > 0.15) {
        preloaded = true;
        for (let i = 0; i < SEQ_FRAMES; i++) new Image().src = frameSrc(i);
      }
      const frame = frameForProgress(p);
      if (frame === null) {
        el.style.visibility = 'hidden';
        return;
      }
      el.style.visibility = 'visible';
      if (el.dataset.frame !== String(frame)) {
        el.src = frameSrc(frame);
        el.dataset.frame = String(frame);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [getProgress]);

  return (
    <img
      ref={imgRef}
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      style={{ visibility: 'hidden' }}
    />
  );
}
