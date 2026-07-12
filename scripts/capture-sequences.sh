#!/usr/bin/env bash
# Tier B sequence capture — drives the running dev server through stepped
# master-timeline positions in the iOS simulator (Tier A forced, ?bare=1 so
# frames never contain the dot / copy / result card), then crops Safari
# chrome and encodes AVIF frames into public/seq/.
#
# Window + frame count must match src/scene/sequence.ts (0.30 → 0.70, 36).
#
#   ./scripts/capture-sequences.sh [dev-server-port]
set -euo pipefail

PORT="${1:-5173}"
FRAMES=36
START=0.30
SPAN=0.40
RAW=/tmp/mishi-seq
mkdir -p "$RAW"

for i in $(seq 0 $((FRAMES - 1))); do
  P=$(python3 -c "print(f'{$START + $SPAN * $i / ($FRAMES - 1):.4f}')")
  xcrun simctl openurl booted "http://localhost:$PORT/?tier=tierA&bare=1&p=$P"
  sleep 2.4
  xcrun simctl io booted screenshot "$RAW/raw-$(printf '%02d' "$i").png" >/dev/null
  echo "frame $i @ p=$P"
done

node --input-type=module - <<'EOF'
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
mkdirSync('public/seq', { recursive: true });
let total = 0;
for (let i = 0; i < 36; i++) {
  const n = String(i).padStart(2, '0');
  // crop the simulator's status bar + Safari toolbar (1206×2622 @3x)
  await sharp(`/tmp/mishi-seq/raw-${n}.png`)
    .extract({ left: 0, top: 145, width: 1206, height: 2125 })
    .resize(540)
    .avif({ quality: 46 })
    .toFile(`public/seq/frame-${n}.avif`);
  total += statSync(`public/seq/frame-${n}.avif`).size;
}
console.log(`36 frames, total ${(total / 1024).toFixed(0)} KB, avg ${(total / 36 / 1024).toFixed(1)} KB/frame`);
EOF
