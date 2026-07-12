import { describe, expect, it } from 'vitest';

import { DOT_KEYFRAMES, EASE, ownerAt, ownerSegments } from './path';
import { effectiveOwner } from './state';

describe('dot keyframe table (the single motion path)', () => {
  it('starts at progress 0 and stays within [0, 1]', () => {
    expect(DOT_KEYFRAMES[0].at).toBe(0);
    for (const f of DOT_KEYFRAMES) {
      expect(f.at).toBeGreaterThanOrEqual(0);
      expect(f.at).toBeLessThanOrEqual(1);
    }
  });

  it('is strictly ordered — segments are consecutive, so the path is continuous by construction', () => {
    for (let i = 1; i < DOT_KEYFRAMES.length; i++) {
      expect(DOT_KEYFRAMES[i].at).toBeGreaterThan(DOT_KEYFRAMES[i - 1].at);
    }
  });

  it('uses only the named Results-Screen easing family', () => {
    const allowed = new Set(Object.keys(EASE));
    for (const f of DOT_KEYFRAMES) {
      if (f.ease) expect(allowed.has(f.ease)).toBe(true);
    }
  });

  it('declares the two Tier A handoffs and nothing else', () => {
    const segs = ownerSegments();
    expect(segs.map((s) => s.owner)).toEqual(['dom', 'gl', 'dom']);
    expect(segs[1].at).toBeCloseTo(0.36); // into the phone screen
    expect(segs[2].at).toBeCloseTo(0.7); // back to the DOM world for the triptych
  });
});

describe('ownerAt — exactly one owner at every point of the journey', () => {
  it('Tier B and static never leave the DOM', () => {
    for (let i = 0; i <= 1000; i++) {
      expect(ownerAt(i / 1000, 'tierB')).toBe('dom');
      expect(ownerAt(i / 1000, 'static')).toBe('dom');
    }
  });

  it('Tier A: dom → gl → dom, flips exactly at the declared boundaries', () => {
    expect(ownerAt(0, 'tierA')).toBe('dom');
    expect(ownerAt(0.3599, 'tierA')).toBe('dom');
    expect(ownerAt(0.36, 'tierA')).toBe('gl');
    expect(ownerAt(0.5, 'tierA')).toBe('gl');
    expect(ownerAt(0.6999, 'tierA')).toBe('gl');
    expect(ownerAt(0.7, 'tierA')).toBe('dom');
    expect(ownerAt(1, 'tierA')).toBe('dom');
  });

  it('always returns exactly one of dom|gl across a dense sweep', () => {
    for (let i = 0; i <= 2000; i++) {
      expect(['dom', 'gl']).toContain(ownerAt(i / 2000, 'tierA'));
    }
  });
});

describe('effectiveOwner — the dot never waits on a chunk', () => {
  it('desired gl without a ready renderer stays dom', () => {
    expect(effectiveOwner('gl', false)).toBe('dom');
    expect(effectiveOwner('gl', true)).toBe('gl');
    expect(effectiveOwner('dom', false)).toBe('dom');
    expect(effectiveOwner('dom', true)).toBe('dom');
  });
});
