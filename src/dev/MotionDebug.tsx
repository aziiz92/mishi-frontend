import { useEffect, useState } from 'react';

// ?motionDebug=1 — DEV-only registration overlay (never in prod: the
// import site is gated on import.meta.env.DEV, so this file is compiled
// out of the build). Shows element bounds for every dot anchor and chaos
// element, act boundaries, and the hero menu-region rect the Act 0→1
// overlay must land on. Scroll progress + dot owner live in the existing
// DEV strip (App.tsx).

interface DebugRect {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  kind: 'anchor' | 'chaos' | 'act';
}

const KIND_CLASS: Record<DebugRect['kind'], string> = {
  anchor: 'border-accent',
  chaos: 'border-signal-dietary',
  act: 'border-content-tertiary',
};

function measure(): DebugRect[] {
  const rects: DebugRect[] = [];
  const push = (el: Element, label: string, kind: DebugRect['kind']) => {
    const r = el.getBoundingClientRect();
    rects.push({ label, left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height, kind });
  };
  for (const el of document.querySelectorAll('[data-dot-anchor]')) push(el, `⌾ ${(el as HTMLElement).dataset.dotAnchor}`, 'anchor');
  for (const el of document.querySelectorAll('[data-chaos-panel]')) push(el, `panel:${(el as HTMLElement).dataset.chaosPanel}`, 'chaos');
  for (const el of document.querySelectorAll('[data-chaos-overlay],[data-chaos-flat],[data-chaos-frame]')) {
    push(el, el.getAttribute('data-chaos-overlay') !== null ? 'overlay' : el.getAttribute('data-chaos-flat') !== null ? 'flat' : 'frame', 'chaos');
  }
  for (const el of document.querySelectorAll('[data-act]')) push(el, `act ${(el as HTMLElement).dataset.act} · ${el.getAttribute('aria-label')}`, 'act');
  return rects;
}

export function MotionDebug() {
  const [rects, setRects] = useState<DebugRect[]>([]);

  useEffect(() => {
    const update = () => setRects(measure());
    update();
    // chaos elements get GSAP transforms — refresh at a slow cadence so the
    // boxes track without fighting the scrub for frames
    const interval = window.setInterval(update, 500);
    window.addEventListener('resize', update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-50">
      {rects.map((r, i) => (
        <div
          key={`${r.label}-${i}`}
          className={`absolute border ${KIND_CLASS[r.kind]} ${r.kind === 'act' ? 'border-dashed' : ''}`}
          style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
        >
          <span className="absolute left-0 top-0 bg-surface-inverse px-1 font-sans text-[10px] text-content-inverse">{r.label}</span>
        </div>
      ))}
    </div>
  );
}
