import { ChaosCopy } from './ChaosCopy';
import { CHAOS_PANELS } from './data';
import { DotTarget } from './DotTarget';
import { MenuPanel } from './MenuPanel';
import type { Tier } from '../lib/tier';

// Act 1 — Le Chaos: the menu labyrinth. The hero's menu lifts off the
// table, unfolds into connected paper panels that become the room, closes
// in, and collapses into the scan frame Act 2's phone answers (DL57).
// This component only builds the DOM; every tween lives on the master
// timeline (src/chaos/timeline.ts) — per-section one-offs stay banned.
//
// Tier A mounts two extra depth panels (the §3 fidelity difference, not a
// style fork); the static tier renders the composed still (DL52) with its
// own dot mark.
export function MenuChaosSection({ tier }: { tier: Tier | null }) {
  const isStatic = tier === 'static';
  const [entrees, plats, grillades] = CHAOS_PANELS;

  return (
    // No vertical clipping: the menu deliberately crosses act boundaries —
    // it lifts out of the hero's table and collapses over Act 2's darkening
    // field. overflow-x-clip only, so rotated walls never create sideways
    // page scroll.
    <section id="act-1" aria-label="Le Chaos" data-act="1" className="relative z-10 min-h-screen overflow-x-clip">
      <div data-chaos-stage className="absolute inset-0 [perspective:1200px] [perspective-origin:50%_45%]">
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {tier === 'tierA' && (
            <>
              <MenuPanel panel={plats} pos="back-left" isStatic={isStatic} dim />
              <MenuPanel panel={entrees} pos="back-right" isStatic={isStatic} dim />
            </>
          )}
          <MenuPanel panel={entrees} pos="left" isStatic={isStatic} />
          <MenuPanel panel={grillades} pos="right" isStatic={isStatic} />
          <MenuPanel panel={plats} pos="center" isStatic={isStatic} />
        </div>

        {/* pressure scrim — darkens the panels (never the copy) as the room
            closes in, relaying into Act 2's espresso field */}
        <div data-chaos-scrim aria-hidden="true" className="pointer-events-none absolute inset-0 bg-surface-inverse opacity-0" />

        {/* the scan frame the labyrinth collapses into — sized exactly to
            Act 2's phone-screen anchor (204×440), viewfinder corners */}
        {!isStatic && (
          <div
            data-chaos-frame
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[204px] rounded-[28px] border border-content-inverse/40 bg-content-inverse/5 opacity-0"
          >
            <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-[28px] border-l-2 border-t-2 border-content-inverse" />
            <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-[28px] border-r-2 border-t-2 border-content-inverse" />
            <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-[28px] border-b-2 border-l-2 border-content-inverse" />
            <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-[28px] border-b-2 border-r-2 border-content-inverse" />
          </div>
        )}

        <ChaosCopy isStatic={isStatic} />
      </div>

      {/* hesitation anchors for dot/path.ts — placement notes in DotTarget */}
      <DotTarget anchor="chaos-1" className="left-[10%] top-[45%]" />
      <DotTarget anchor="chaos-2" className="left-[58%] top-[85%]" />
      <DotTarget anchor="chaos-3" className="left-[36%] top-[95%]" />

      {isStatic && <span aria-hidden="true" className="absolute left-[24%] top-[30%] z-10 h-6 w-6 rounded-full bg-accent" />}
    </section>
  );
}
