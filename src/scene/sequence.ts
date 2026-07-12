// Tier B sequence math — pure, unit-tested, shared by the player and the
// capture pipeline (scripts/capture-sequences.sh drives the same window).

export const SEQ_START = 0.3;
export const SEQ_END = 0.7;
export const SEQ_FRAMES = 36;

export const frameSrc = (i: number) => `/seq/frame-${String(i).padStart(2, '0')}.avif`;

// null = outside the sequence window (image hidden).
export function frameForProgress(p: number): number | null {
  if (p < SEQ_START || p > SEQ_END) return null;
  return Math.min(SEQ_FRAMES - 1, Math.floor(((p - SEQ_START) / (SEQ_END - SEQ_START)) * SEQ_FRAMES));
}
