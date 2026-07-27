import type { Lang } from '../content/copy';

const KEY = 'mishi_lang';

export function localeFromPath(pathname: string): Lang | null {
  if (/^\/fr(?:\/|$)/.test(pathname)) return 'fr';
  if (/^\/en(?:\/|$)/.test(pathname)) return 'en';
  return null;
}

export function initialLang(): Lang {
  const routeLang = localeFromPath(window.location.pathname);
  if (routeLang) return routeLang;

  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // Browser locale remains a safe fallback.
  }

  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function rememberLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Persistence is helpful, never required.
  }
}

export function applyLang(lang: Lang): void {
  document.documentElement.lang = lang;
  rememberLang(lang);
}

export function localizedHome(lang: Lang): string {
  return `/${lang}/`;
}
