// One-dot auditor (DEV / gate evidence). Independently of the renderer's
// own logic, count how many dots are ACTUALLY visible each frame — DOM by
// computed style, WebGL by sphere visibility — and record any frame where
// that count isn't exactly 1. The auditor reads reality, not intent: it
// would catch a renderer bug, not just a path bug.

import { glBridge } from './state';

export interface AuditSummary {
  frames: number;
  violations: number;
  minVisible: number;
  maxVisible: number;
  lastViolationAt: string | null;
}

export const auditSummary: AuditSummary = {
  frames: 0,
  violations: 0,
  minVisible: 1,
  maxVisible: 1,
  lastViolationAt: null,
};

export function countVisibleDots(dotEl: HTMLElement): number {
  let count = 0;
  if (getComputedStyle(dotEl).visibility !== 'hidden') count += 1;
  if (glBridge.glReady && glBridge.sphere?.visible) count += 1;
  return count;
}

export function startDotAudit(dotEl: HTMLElement, getProgress: () => number): () => void {
  let raf = 0;
  const loop = () => {
    const visible = countVisibleDots(dotEl);
    auditSummary.frames += 1;
    auditSummary.minVisible = Math.min(auditSummary.minVisible, visible);
    auditSummary.maxVisible = Math.max(auditSummary.maxVisible, visible);
    if (visible !== 1) {
      auditSummary.violations += 1;
      auditSummary.lastViolationAt = `progress=${getProgress().toFixed(4)} visible=${visible}`;
      console.warn('[one-dot AUDIT VIOLATION]', auditSummary.lastViolationAt);
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
