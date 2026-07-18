import { PANEL_ART, type MenuPanelData, type PanelId } from './data';
import { MenuItem } from './MenuItem';

// Static tier: no timeline — the labyrinth is a composed still (DL52),
// three papers fanned like a menu dropped open on the table.
const STATIC_POSE: Partial<Record<PanelId, string>> = {
  center: 'translate(-50%, -50%) rotate(-1deg)',
  left: 'translate(-118%, -46%) rotate(-6deg) scale(0.94)',
  right: 'translate(18%, -54%) rotate(5deg) scale(0.94)',
};

// One paper panel of the unfolded menu — the ILLUSTRATED asset is the
// paper (DL61; CSS draws nothing), the DOM overlays the live dish rows.
// GSAP owns the wrapper's transform on the master timeline
// (chaos/timeline.ts, pose keyed by data-chaos-panel). Display height is
// proportional to the artwork so the five papers compose back into one
// connected menu; --panel-h (the center panel's height) is set on the
// stage by the timeline compile — one JS source for CSS and pose math.
export function MenuPanel({ panel, isStatic }: { panel: MenuPanelData; isStatic: boolean }) {
  const art = PANEL_ART[panel.id];
  const ratio = art.h / PANEL_ART.center.h;

  return (
    <div
      data-chaos-panel={panel.id}
      className={`absolute left-1/2 top-1/2 [will-change:transform] ${isStatic ? '' : 'opacity-0'}`}
      style={{
        height: `calc(var(--panel-h, 60vh) * ${ratio})`,
        aspectRatio: `${art.w} / ${art.h}`,
        ...(isStatic ? { transform: STATIC_POSE[panel.id] } : undefined),
      }}
    >
      <img
        src={art.src}
        width={art.w}
        height={art.h}
        alt=""
        draggable={false}
        className="h-full w-full select-none drop-shadow-[0_24px_50px_rgba(28,23,20,0.28)]"
      />
      {panel.items.length > 0 && (
        <ul className="absolute inset-x-[9%] top-0 h-full">
          {panel.items.map((item) => (
            <MenuItem key={item.id} item={item} isStatic={isStatic} />
          ))}
        </ul>
      )}
    </div>
  );
}
