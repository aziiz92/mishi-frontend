import type { Lang } from '../content/copy';
import { COPY } from '../content/copy';
import { landingConfig } from '../landing.config';
import { track } from '../lib/analytics';
import { localizedHome, rememberLang } from '../lib/lang';
import { AppStoreCta } from './AppStoreCta';

export function Footer({ lang }: { lang: Lang }) {
  const copy = COPY[lang].footer;
  const restaurantHref = `mailto:${landingConfig.contactEmail}?subject=${encodeURIComponent(copy.restaurantSubject)}`;

  return (
    <footer className="border-t border-border bg-surface-raised px-6 pb-8 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 border-b border-border pb-14 md:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <a href={localizedHome(lang)} className="font-display-small text-3xl text-content-primary">
              Mishi
            </a>
            <p className="mt-4 max-w-xs font-sans text-base leading-7 text-content-secondary">{copy.line}</p>
            <AppStoreCta lang={lang} cta="app_store_final" compact className="mt-6" />
          </div>

          <div>
            <p className="font-sans-semibold text-sm text-content-primary">{copy.product}</p>
            <ul className="mt-4 space-y-3 font-sans text-sm text-content-secondary">
              <li><a className="footer-link" href={`${localizedHome(lang)}#how`}>{COPY[lang].nav.how}</a></li>
              <li><a className="footer-link" href={`${localizedHome(lang)}#trust`}>{COPY[lang].nav.trust}</a></li>
              <li><a className="footer-link" href={`${localizedHome(lang)}#faq`}>{COPY[lang].nav.faq}</a></li>
              <li>
                <a
                  className="footer-link"
                  href={restaurantHref}
                  onClick={() => track({ event_name: 'landing_cta_tapped', cta: 'restaurant_contact' })}
                >
                  {copy.restaurant}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-sans-semibold text-sm text-content-primary">{copy.company}</p>
            <ul className="mt-4 space-y-3 font-sans text-sm text-content-secondary">
              <li><a className="footer-link" href="/about">{copy.about}</a></li>
              <li><a className="footer-link" href="/support">{copy.support}</a></li>
            </ul>
          </div>

          <div>
            <p className="font-sans-semibold text-sm text-content-primary">{copy.legal}</p>
            <ul className="mt-4 space-y-3 font-sans text-sm text-content-secondary">
              <li><a className="footer-link" href="/privacy">{copy.privacy}</a></li>
              <li><a className="footer-link" href="/terms">{copy.terms}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 font-sans text-xs leading-5 text-content-secondary sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p>© {new Date().getFullYear()} {copy.copyright}</p>
            <p className="mt-2">{copy.appleCredit}</p>
          </div>
          <div className="flex items-center gap-4" aria-label={copy.language}>
            {(['fr', 'en'] as const).map((next) => (
              <a
                key={next}
                href={localizedHome(next)}
                hrefLang={next}
                onClick={() => rememberLang(next)}
                aria-current={lang === next ? 'page' : undefined}
                className={`uppercase ${lang === next ? 'font-sans-semibold text-content-primary' : 'footer-link'}`}
              >
                {next}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
