import { ListIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { AppStoreCta } from './components/AppStoreCta';
import { COPY, type Lang } from './content/copy';
import { track } from './lib/analytics';
import { localizedHome, rememberLang } from './lib/lang';

export function Nav({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const copy = COPY[lang].nav;

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  const navLink = (href: string, label: string) => (
    <a
      href={href}
      onClick={() => setOpen(false)}
      className="nav-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary"
    >
      {label}
    </a>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-surface-canvas/90 backdrop-blur-xl">
      <a href="#main-content" className="skip-link">{COPY[lang].skip}</a>
      <nav aria-label="Primary navigation" className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href={localizedHome(lang)} className="font-display-small text-2xl text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary">
          Mishi
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLink('#how', copy.how)}
          {navLink('#trust', copy.trust)}
          {navLink('#faq', copy.faq)}
          <div className="flex items-center gap-2 border-l border-border pl-5" aria-label={COPY[lang].footer.language}>
            {(['fr', 'en'] as const).map((next) => (
              <a
                key={next}
                href={localizedHome(next)}
                hrefLang={next}
                onClick={() => {
                  rememberLang(next);
                  track({ event_name: 'landing_locale_changed', lang: next });
                }}
                aria-current={lang === next ? 'page' : undefined}
                className={`px-1 py-2 font-sans text-xs uppercase ${lang === next ? 'font-sans-semibold text-content-primary' : 'text-content-secondary'}`}
              >
                {next}
              </a>
            ))}
          </div>
          <AppStoreCta lang={lang} cta="app_store_nav" compact />
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? copy.close : copy.menu}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary lg:hidden"
        >
          {open ? <XIcon size={22} aria-hidden="true" /> : <ListIcon size={22} aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        hidden={!open}
        className="border-t border-border bg-surface-canvas px-5 pb-7 pt-5 lg:hidden"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1">
          {navLink('#how', copy.how)}
          {navLink('#trust', copy.trust)}
          {navLink('#faq', copy.faq)}
          <div className="my-3 border-t border-border" />
          <div className="flex items-center justify-between">
            <div className="flex gap-4" aria-label={COPY[lang].footer.language}>
              {(['fr', 'en'] as const).map((next) => (
                <a
                  key={next}
                  href={localizedHome(next)}
                  hrefLang={next}
                  onClick={() => rememberLang(next)}
                  aria-current={lang === next ? 'page' : undefined}
                  className={`min-h-11 py-3 font-sans text-sm uppercase ${lang === next ? 'font-sans-semibold' : ''}`}
                >
                  {next}
                </a>
              ))}
            </div>
            <AppStoreCta lang={lang} cta="app_store_nav" compact />
          </div>
        </div>
      </div>
    </header>
  );
}
