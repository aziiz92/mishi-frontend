import type { MenuPanelData } from './data';
import { MenuItem } from './MenuItem';

export type PanelPos = 'center' | 'left' | 'right' | 'back-left' | 'back-right';

const WIDTH: Record<PanelPos, string> = {
  center: 'w-[min(86vw,30rem)]',
  left: 'w-[min(70vw,22rem)]',
  right: 'w-[min(70vw,22rem)]',
  'back-left': 'w-[min(60vw,20rem)]',
  'back-right': 'w-[min(60vw,20rem)]',
};

// Static tier: no timeline — the labyrinth is a composed still (DL52),
// three panels fanned like a menu dropped open on the table.
const STATIC_POSE: Record<PanelPos, string> = {
  center: 'translate(-50%, -50%) rotate(-1deg)',
  left: 'translate(-118%, -46%) rotate(-6deg) scale(0.94)',
  right: 'translate(18%, -54%) rotate(5deg) scale(0.94)',
  'back-left': 'translate(-90%, -70%) scale(0.85)',
  'back-right': 'translate(-10%, -30%) scale(0.85)',
};

// One paper panel of the unfolded menu. GSAP owns its transform on the
// master timeline (chaos/timeline.ts, pose keyed by data-chaos-panel);
// this component only lays out live text. `dim` panels are Tier A depth
// duplicates — aria-hidden, faint, lightly blurred (static filter,
// desktop only; Tier B never mounts them).
export function MenuPanel({
  panel,
  pos,
  isStatic,
  dim = false,
}: {
  panel: MenuPanelData;
  pos: PanelPos;
  isStatic: boolean;
  dim?: boolean;
}) {
  return (
    <div
      data-chaos-panel={pos}
      aria-hidden={dim || undefined}
      className={`absolute left-1/2 top-1/2 rounded-md border border-border bg-surface-raised px-6 py-5 shadow-[0_24px_70px_rgba(28,23,20,0.16)] [will-change:transform] ${WIDTH[pos]} ${dim ? 'blur-[1.5px]' : ''} ${isStatic ? '' : 'opacity-0'}`}
      style={isStatic ? { transform: STATIC_POSE[pos] } : undefined}
    >
      <h3 className="border-b border-border pb-2 font-display-small text-xl text-content-primary">{panel.category}</h3>
      <ul className="mt-3">
        {panel.items.map((item) => (
          <MenuItem key={item.id} item={item} isStatic={isStatic} dim={dim} />
        ))}
      </ul>
    </div>
  );
}
