// Mishi landing — token wiring check. Runs as `prebuild`.
//
// This repository must build on its own in CI and Dokploy, so it cannot read
// configuration from the mobile repository. Instead, this check guarantees
// that Tailwind consumes the landing's canonical color and motion objects.

import { colors, motion } from '../src/theme/tokens.ts';
import tailwindConfig from '../tailwind.config.ts';

type Tree = { [key: string]: string | Tree };

function diff(expected: Tree, actual: Tree, path: string, out: string[]): void {
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    const p = path ? `${path}.${key}` : key;
    const e = expected[key];
    const a = actual[key];
    if (e === undefined) out.push(`extra in landing: ${p} = ${JSON.stringify(a)}`);
    else if (a === undefined) out.push(`missing in landing: ${p} (app has ${JSON.stringify(e)})`);
    else if (typeof e === 'object' && typeof a === 'object') diff(e, a, p, out);
    else if (e !== a) out.push(`mismatch at ${p}: app=${JSON.stringify(e)} landing=${JSON.stringify(a)}`);
  }
}

const problems: string[] = [];
diff(tailwindConfig.theme.colors as unknown as Tree, colors as unknown as Tree, 'colors', problems);
diff(
  tailwindConfig.theme.extend.transitionDuration as unknown as Tree,
  motion.duration,
  'motion.duration',
  problems,
);
diff(
  tailwindConfig.theme.extend.transitionTimingFunction as unknown as Tree,
  motion.easing,
  'motion.easing',
  problems,
);

if (problems.length > 0) {
  console.error('TOKEN WIRING FAILED — Tailwind and landing tokens differ:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const count = (t: Tree): number =>
  Object.values(t).reduce<number>((n, v) => n + (typeof v === 'string' ? 1 : count(v)), 0);
console.log(
  `TOKEN WIRING PASS — ${count(colors as unknown as Tree)} color values + ` +
    `${count(motion.duration)} durations + ${count(motion.easing)} easings are wired into Tailwind`,
);
