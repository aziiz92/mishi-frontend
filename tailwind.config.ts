/**
 * Mishi landing — Tailwind config. Colors and motion come from
 * src/theme/tokens.ts (the single source shared with Three.js).
 * Tailwind itself is installed in Phase 1; this config exists from
 * Phase 0 so the token mirror is checkable from day one.
 */
import type { Config } from 'tailwindcss';

import { colors, motion } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replace (not extend) colors: no default Tailwind grays/blues can leak in.
    colors,

    fontFamily: {
      // Static instances only (subset via scripts/subset-fonts.sh).
      // Fallbacks are metric-matched — see src/styles/fonts.generated.css.
      'display-hero': ['Fraunces-DisplayHero', 'Fraunces-DisplayHero Fallback', 'Georgia', 'serif'],
      'display-title': ['Fraunces-DisplayTitle', 'Fraunces-DisplayTitle Fallback', 'Georgia', 'serif'],
      'display-small': ['Fraunces-DisplaySmall', 'Fraunces-DisplaySmall Fallback', 'Georgia', 'serif'],
      sans: ['InstrumentSans-Regular', 'InstrumentSans-Regular Fallback', 'Arial', 'sans-serif'],
      'sans-medium': ['InstrumentSans-Medium', 'InstrumentSans-Medium Fallback', 'Arial', 'sans-serif'],
      'sans-semibold': ['InstrumentSans-SemiBold', 'InstrumentSans-SemiBold Fallback', 'Arial', 'sans-serif'],
    },

    extend: {
      transitionDuration: motion.duration,
      transitionTimingFunction: motion.easing,
      // Landing type scale (Phase 1 minimum — Phase 4 typesets the acts).
      // The app's fixed mobile sizes don't fit a fluid landing viewport.
      fontSize: {
        'landing-hero': ['clamp(2.25rem, 5.5vw, 4.75rem)', { lineHeight: '1.08', letterSpacing: '-0.5px' }],
        'landing-sub': ['clamp(1rem, 2vw, 1.375rem)', { lineHeight: '1.4' }],
      },
    },
  },
} satisfies Config;
