import type { MenuItemData } from './data';

// One dish line — live HTML text, price in tabular figures (DL9), dotted
// leader like the paper menus the panel imitates. The description (only
// the dot's three hesitation targets have one) starts hidden and reveals
// on the master timeline when the dot approaches — more information,
// never clarity. Space is reserved in layout so reveals never reflow.
export function MenuItem({ item, isStatic, dim }: { item: MenuItemData; isStatic: boolean; dim: boolean }) {
  return (
    <li className="py-1.5">
      <div className="flex items-baseline gap-3">
        <span className="whitespace-nowrap font-sans text-sm text-content-primary">{item.name}</span>
        <span className="flex-1 border-b border-dotted border-border" aria-hidden="true" />
        <span className="font-sans text-sm tabular-nums text-content-secondary">{item.price}</span>
      </div>
      {item.description && (
        <p
          // dim panels are depth-duplicates: their descriptions never reveal
          {...(dim ? {} : { 'data-chaos-reveal': item.id })}
          className={`mt-1 max-w-[36ch] font-sans text-xs leading-relaxed text-content-secondary ${isStatic ? '' : 'opacity-0'}`}
        >
          {item.description}
        </p>
      )}
    </li>
  );
}
