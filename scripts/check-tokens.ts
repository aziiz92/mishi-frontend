// Mishi landing — token mirror check (Phase 0). Runs as `prebuild`.
//
// The landing's src/theme/tokens.ts must match the app's canonical
// /tailwind.config.js (repo root) hex-for-hex and name-for-name, for
// both the semantic color tree and the motion tokens. Any drift fails
// the build.

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { colors, motion } from '../src/theme/tokens.ts';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// The app config loads `nativewind/preset` (not installed here, not needed
// for token comparison) — stub that one module id before requiring it.
const Module = require('node:module');
const origLoad = Module._load;
Module._load = function (request: string, ...rest: unknown[]) {
  if (request === 'nativewind/preset') return {};
  return origLoad.call(this, request, ...rest);
};
const appConfig = require(resolve(here, '../../tailwind.config.js'));

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
diff(appConfig.theme.colors, colors as unknown as Tree, 'colors', problems);
diff(appConfig.theme.extend.transitionDuration, motion.duration as unknown as Tree, 'motion.duration', problems);
diff(appConfig.theme.extend.transitionTimingFunction, motion.easing as unknown as Tree, 'motion.easing', problems);

if (problems.length > 0) {
  console.error('TOKEN MIRROR FAILED — landing tokens drift from /tailwind.config.js:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const count = (t: Tree): number =>
  Object.values(t).reduce<number>((n, v) => n + (typeof v === 'string' ? 1 : count(v)), 0);
console.log(
  `TOKEN MIRROR PASS — ${count(colors as unknown as Tree)} color values + ` +
  `${count(motion.duration)} durations + ${count(motion.easing)} easings match /tailwind.config.js`,
);
