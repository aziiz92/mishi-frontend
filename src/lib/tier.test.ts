import { describe, expect, it } from 'vitest';

import { classifyTier, type TierInputs } from './tier';

// A capable desktop — the only configuration that earns Tier A.
const desktopA: TierInputs = {
  reducedMotion: false,
  reducedData: false,
  gpuTier: 3,
  isMobile: false,
  viewportWidth: 1728,
};

describe('classifyTier', () => {
  it('serves tierA to a capable desktop', () => {
    expect(classifyTier(desktopA)).toBe('tierA');
    expect(classifyTier({ ...desktopA, gpuTier: 2 })).toBe('tierA');
  });

  it('prefers-reduced-motion always wins: static, whatever the hardware', () => {
    expect(classifyTier({ ...desktopA, reducedMotion: true })).toBe('static');
    expect(
      classifyTier({ reducedMotion: true, reducedData: true, gpuTier: 0, isMobile: true, viewportWidth: 360 }),
    ).toBe('static');
  });

  it('save-data / prefers-reduced-data forces tierB even on strong hardware', () => {
    expect(classifyTier({ ...desktopA, reducedData: true })).toBe('tierB');
  });

  it('mobile is tierB even with a flagship GPU (mobile-data reality)', () => {
    expect(classifyTier({ ...desktopA, isMobile: true, viewportWidth: 393 })).toBe('tierB');
    expect(classifyTier({ ...desktopA, isMobile: true })).toBe('tierB');
  });

  it('narrow viewports are tierB regardless of GPU', () => {
    expect(classifyTier({ ...desktopA, viewportWidth: 768 })).toBe('tierB');
    expect(classifyTier({ ...desktopA, viewportWidth: 1023 })).toBe('tierB');
  });

  it('weak or unknown GPU is tierB — detection failure degrades by design', () => {
    expect(classifyTier({ ...desktopA, gpuTier: 1 })).toBe('tierB');
    expect(classifyTier({ ...desktopA, gpuTier: 0 })).toBe('tierB');
  });

  it('priority order: static > tierB(data) > tierB(device)', () => {
    // reduced motion beats reduced data
    expect(classifyTier({ ...desktopA, reducedMotion: true, reducedData: true })).toBe('static');
    // reduced data beats an otherwise tierA machine
    expect(classifyTier({ ...desktopA, reducedData: true, gpuTier: 3 })).toBe('tierB');
  });
});
