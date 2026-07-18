import type { MenuItemData } from './data';

// One live dish row, positioned over the illustrated paper at its `top`
// fraction (DL61). Price in tabular figures (DL9), dotted leader like the
// painted lines around it; a faint porcelain band keeps the type readable
// over the artwork's abstract strokes. The description (only the dot's
// three hesitation targets have one) starts hidden and reveals on the
// master timeline when the dot approaches — more information, never
// clarity. Space is absolute so reveals never reflow the paper.
export function MenuItem({ item, isStatic }: { item: MenuItemData; isStatic: boolean }) {
  return (
    <li className="absolute inset-x-0" style={{ top: `${item.top * 100}%` }}>
      <div className="flex items-baseline gap-2 rounded-sm bg-surface-raised/80 px-1.5 py-0.5">
        <span className="whitespace-nowrap font-sans text-[13px] leading-snug text-content-primary">{item.name}</span>
        <span className="flex-1 border-b border-dotted border-border" aria-hidden="true" />
        <span className="font-sans text-[13px] leading-snug tabular-nums text-content-secondary">{item.price}</span>
      </div>
      {item.description && (
        <p
          data-chaos-reveal={item.id}
          className={`mt-0.5 rounded-sm bg-surface-raised/80 px-1.5 py-0.5 font-sans text-[11px] leading-relaxed text-content-secondary ${isStatic ? '' : 'opacity-0'}`}
        >
          {item.description}
        </p>
      )}
    </li>
  );
}
