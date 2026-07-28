import { CaretDownIcon } from '@phosphor-icons/react';

import type { Lang } from './content/copy';
import { COPY } from './content/copy';
import { landingConfig } from './landing.config';
import { track } from './lib/analytics';
import { AppStoreCta } from './components/AppStoreCta';
import { CareExperience } from './components/CareExperience';
import { HowSequence } from './components/HowSequence';
import { TrustExperience } from './components/TrustExperience';

export function HowItWorks({ lang }: { lang: Lang }) {
  return <HowSequence lang={lang} />;
}

export function Trust({ lang }: { lang: Lang }) {
  return <TrustExperience lang={lang} />;
}

export function BuiltWithCare({ lang }: { lang: Lang }) {
  return <CareExperience lang={lang} />;
}

export function Faq({ lang }: { lang: Lang }) {
  const copy = COPY[lang].faq;

  return (
    <section id="faq" data-section="faq" className="launch-section bg-surface-raised px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <header>
          <p className="section-eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title mt-4">{copy.title}</h2>
        </header>

        <div className="border-t border-border-strong">
          {copy.items.map((item, index) => (
            <details
              key={item.question}
              className="faq-item group border-b border-border-strong"
              onToggle={(event) => {
                if (event.currentTarget.open) track({ event_name: 'landing_faq_opened', item: index });
              }}
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 font-sans-medium text-lg text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary">
                <span>{item.question}</span>
                <CaretDownIcon className="shrink-0 transition-transform duration-base ease-standard group-open:rotate-180" size={20} aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-7 pr-10 font-sans text-base leading-7 text-content-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalDownload({ lang }: { lang: Lang }) {
  const copy = COPY[lang].final;

  return (
    <section id="download" data-section="download" className="launch-section px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-accent lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-16">
          <p className="font-sans-semibold text-xs uppercase tracking-[0.14em] text-accent-on">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-xl font-display-title text-5xl leading-[1.02] text-accent-on sm:text-6xl">{copy.title}</h2>
          <p className="mt-6 max-w-lg font-sans text-lg leading-8 text-accent-on">{copy.body}</p>
          <AppStoreCta lang={lang} cta="app_store_final" className="mt-8 self-start" />
        </div>

        <div className="flex items-center justify-center bg-surface-inverse p-10 sm:p-14">
          <a
            href={landingConfig.campaignLinks[lang]}
            onClick={() => track({ event_name: 'landing_cta_tapped', cta: 'qr_app_store' })}
            className="flex flex-col items-center gap-5 rounded-2xl bg-surface-raised p-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            aria-label={landingConfig.appStoreReady ? copy.qrAria : copy.qrFallback}
          >
            <img src="/qr-ios.svg" alt="" width="196" height="196" className="h-40 w-40 sm:h-48 sm:w-48" />
            <span className="font-sans-medium text-sm text-content-primary">
              {landingConfig.appStoreReady ? copy.qr : copy.qrFallback}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
