// Tier detection — concept doc §3. Automatic, no user toggle.
//
//   static — prefers-reduced-motion: full static-narrative fallback
//   tierB  — mobile / low GPU / save-data: DOM dot + pre-rendered sequences
//   tierA  — desktop with a capable GPU: live WebGL
//
// The narrative is identical in every tier. When in doubt, Tier B wins
// (§9: "the jury is not your market").

import { getGPUTier } from 'detect-gpu';

export type Tier = 'tierA' | 'tierB' | 'static';

export interface TierInputs {
  reducedMotion: boolean;
  reducedData: boolean; // prefers-reduced-data OR connection.saveData
  gpuTier: number; // detect-gpu tier 0–3; 0 also = detection failed
  isMobile: boolean;
  viewportWidth: number;
}

// Pure classifier — the unit-tested decision table. Priority order matters:
// accessibility beats data-saving beats device class.
export function classifyTier(i: TierInputs): Tier {
  if (i.reducedMotion) return 'static';
  if (i.reducedData) return 'tierB';
  if (i.isMobile) return 'tierB'; // mobile = creator-link traffic on mobile data, even with a good GPU
  if (i.viewportWidth < 1024) return 'tierB';
  if (i.gpuTier < 2) return 'tierB'; // 0 = unknown/failed, 1 = weak — both degrade by design
  return 'tierA';
}

// Side-effectful gatherer, separated so classifyTier stays testable.
export async function detectTier(): Promise<{ tier: Tier; inputs: TierInputs }> {
  const inputs: TierInputs = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedData:
      window.matchMedia('(prefers-reduced-data: reduce)').matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true,
    gpuTier: 0,
    isMobile: false,
    viewportWidth: window.innerWidth,
  };

  // GPU probing is the expensive step — skip it when the answer is already
  // decided by the earlier rules.
  if (!inputs.reducedMotion && !inputs.reducedData && inputs.viewportWidth >= 1024) {
    try {
      // Benchmarks are self-hosted (public/gpu-benchmarks) — no third-party
      // request, works offline-ish; a failed probe stays tier 0 → tierB.
      const gpu = await getGPUTier({ benchmarksURL: '/gpu-benchmarks' });
      inputs.gpuTier = gpu.tier;
      inputs.isMobile = gpu.isMobile ?? false;
    } catch {
      // conservative default already in place
    }
  }

  return { tier: classifyTier(inputs), inputs };
}
