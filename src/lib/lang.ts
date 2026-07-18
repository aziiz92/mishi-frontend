// Language state — FR-first (D2), EN via the nav toggle (DL64). Persisted
// choice survives reloads; storage failures never wedge anything (D39
// lesson, same posture as analytics deviceId).

import type { Lang } from '../content/copy';

const KEY = 'mishi_lang';

export function initialLang(): Lang {
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

export function applyLang(lang: Lang): void {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // per-session only — fine
  }
}
