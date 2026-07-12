// The dot's single writer. One gsap-ticker callback per frame:
//   1. read the master timeline progress
//   2. derive desired owner from the path, effective owner from GL readiness
//   3. apply visibility to BOTH renderers and position to the owner —
//      atomically, in this one place.
// Nothing else in the codebase may touch #dot's style or the sphere's
// visibility. That is the one-dot rule, enforced at a single choke point.

import gsap from 'gsap';

import { ownerAt } from './path';
import { DOT_BASE_SIZE, dotState, effectiveOwner, glBridge, type DotOwner } from './state';
import type { Tier } from '../lib/tier';

export interface DotRenderer {
  destroy: () => void;
  // exposed for the one-dot auditor
  currentOwner: () => DotOwner;
}

export function startDotRenderer(
  timeline: gsap.core.Timeline,
  tier: Tier,
  dotEl: HTMLElement,
): DotRenderer {
  let owner: DotOwner = 'dom';

  // DEV capture mode (?bare=1): Tier B sequence frames are shot from this
  // page and must never contain the dot — hide both renderers entirely.
  const bare = import.meta.env.DEV && new URLSearchParams(window.location.search).get('bare') === '1';

  // CSS hero-drop handoff: the load animation owns the element until it
  // finishes (or until the user scrolls first — then the journey takes
  // over immediately). `dot-js` kills the CSS animation.
  const takeOver = () => {
    if (dotState.jsOwned) return;
    dotState.jsOwned = true;
    // Write the position inline BEFORE killing the CSS animation: the
    // element's base transform is off-screen-above (index.css), so there
    // must never be a paint between class-add and the first ticker write.
    dotEl.style.transform =
      `translate(${dotState.cx - DOT_BASE_SIZE / 2}px, ${dotState.cy - window.scrollY - DOT_BASE_SIZE / 2}px) ` +
      `scale(${dotState.scaleX}, ${dotState.scaleY})`;
    dotEl.classList.add('dot-js');
  };
  const onAnimationEnd = (e: AnimationEvent) => {
    if (e.animationName === 'dot-pulse') takeOver();
  };
  dotEl.addEventListener('animationend', onAnimationEnd);
  // Mid-page reload, or reduced-motion (no animation events): take over now.
  if (window.scrollY > 4 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    takeOver();
  }
  const fallback = window.setTimeout(takeOver, 2600); // belt-and-braces

  const tick = () => {
    const progress = timeline.progress();
    if (!dotState.jsOwned && progress > 0.005) takeOver();

    owner = effectiveOwner(ownerAt(progress, tier), glBridge.glReady);

    // dotState is DOCUMENT-space; both renderers are viewport-fixed, so
    // the live scroll offset applies here, at render time, and only here.
    const viewportCy = dotState.cy - window.scrollY;

    // visibility — both renderers, one frame, one writer
    dotEl.style.visibility = owner === 'dom' && !bare ? 'visible' : 'hidden';
    if (bare && glBridge.sphere) {
      glBridge.sphere.visible = false;
      return;
    }
    if (glBridge.sphere) {
      glBridge.sphere.visible = owner === 'gl';
      if (owner === 'gl') {
        glBridge.sphere.position.set(
          dotState.cx - window.innerWidth / 2,
          window.innerHeight / 2 - viewportCy,
          60,
        );
        glBridge.sphere.scale.set(dotState.scaleX, dotState.scaleY, 1);
      }
    }

    // position — only once the journey owns the element (the CSS drop
    // animation positions it until then)
    if (owner === 'dom' && dotState.jsOwned) {
      dotEl.style.transform =
        `translate(${dotState.cx - DOT_BASE_SIZE / 2}px, ${viewportCy - DOT_BASE_SIZE / 2}px) ` +
        `scale(${dotState.scaleX}, ${dotState.scaleY})`;
    }
  };

  gsap.ticker.add(tick);
  glBridge.releaseToDom = () => {
    owner = 'dom';
    if (!bare) dotEl.style.visibility = 'visible';
  };

  return {
    currentOwner: () => owner,
    destroy: () => {
      gsap.ticker.remove(tick);
      glBridge.releaseToDom = null;
      window.clearTimeout(fallback);
      dotEl.removeEventListener('animationend', onAnimationEnd);
    },
  };
}
