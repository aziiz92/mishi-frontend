import { ArrowDownIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

import { AboutPage } from './AboutPage';
import { AppStoreCta } from './components/AppStoreCta';
import { Footer } from './components/Footer';
import { COPY, type Lang } from './content/copy';
import { legalPageFromPath } from './legal/routes';
import { LegalPage } from './legal/LegalPage';
import { BuiltWithCare, Faq, FinalDownload, HowItWorks, Trust } from './LaunchSections';
import { track, trackSectionViewed, trackTierServed } from './lib/analytics';
import { applyLang, initialLang, localeFromPath, localizedHome } from './lib/lang';
import { applySeo } from './lib/seo';
import { detectTier, type Tier } from './lib/tier';
import { Nav } from './Nav';
import { SharedMenuPage } from './shared/SharedMenuPage';
import { sharedRouteFromPath } from './shared/routes';

function MarketingApp() {
  const mainRef = useRef<HTMLElement>(null);
  const [lang] = useState<Lang>(initialLang);
  const [tier, setTier] = useState<Tier | null>(null);
  const copy = COPY[lang];

  useEffect(() => {
    applyLang(lang);
    applySeo(lang);
    if (!localeFromPath(window.location.pathname)) {
      window.history.replaceState(null, '', localizedHome(lang) + window.location.search + window.location.hash);
    }
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    void detectTier().then(({ tier: detected }) => {
      if (cancelled) return;
      setTier(detected);
      trackTierServed(detected);
      document.documentElement.classList.toggle('tier-static', detected === 'static');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mainRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          trackSectionViewed((entry.target as HTMLElement).dataset.section as Parameters<typeof trackSectionViewed>[0]);
        }
      },
      { threshold: 0.35 },
    );
    for (const section of mainRef.current.querySelectorAll<HTMLElement>('[data-section]')) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleDemo = () => {
    track({ event_name: 'landing_cta_tapped', cta: 'view_demo' });
  };

  return (
    <main ref={mainRef} id="main-content" data-tier={tier ?? 'detecting'} className="bg-surface-canvas">
      <Nav lang={lang} />

      <section
        id="hero"
        data-section="hero"
        aria-labelledby="hero-title"
        className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-6 pb-12 pt-[calc(var(--hero-top)+4rem)] text-center"
      >
        <picture className="pointer-events-none absolute inset-0" aria-hidden="true">
          <source type="image/avif" srcSet="/hero/hero-800.avif 800w, /hero/hero-1200.avif 1200w, /hero/hero-1672.avif 1672w" sizes="100vw" />
          <img
            src="/hero/hero-1200.webp"
            srcSet="/hero/hero-800.webp 800w, /hero/hero-1200.webp 1200w, /hero/hero-1672.webp 1672w"
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover object-bottom"
          />
        </picture>

        <div className="relative flex max-w-4xl flex-col items-center">
          <svg viewBox="288 368 448 302" className="h-20 w-auto text-content-primary sm:h-24" data-dot-anchor="hero-mark" aria-hidden="true">
            <path d="M 330 628 L 330 501 A 91 91 0 0 1 512 501 A 91 91 0 0 1 694 501 L 694 628" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 512 501 L 512 525" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" />
          </svg>
          <p className="mt-6 font-sans-semibold text-xs uppercase tracking-[0.14em] text-content-secondary">{copy.hero.eyebrow}</p>
          <h1 id="hero-title" className="mt-5 font-display-hero text-landing-hero text-content-primary">{copy.hero.title}</h1>
          <p className="mt-4 max-w-xl font-sans text-landing-sub text-content-secondary">{copy.hero.sub}</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <AppStoreCta lang={lang} cta="app_store_hero" />
            <a
              href="#how"
              onClick={handleDemo}
              className="inline-flex h-[60px] w-[180px] shrink-0 items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-raised/80 px-4 font-sans-semibold text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary"
            >
              {copy.hero.demo}
              <ArrowDownIcon size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <HowItWorks lang={lang} />
      <Trust lang={lang} />
      <BuiltWithCare lang={lang} />
      <Faq lang={lang} />
      <FinalDownload lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

function App() {
  const pathname = window.location.pathname;
  const legalPage = legalPageFromPath(pathname);
  if (legalPage) return <LegalPage page={legalPage} />;

  const sharedRoute = sharedRouteFromPath(pathname);
  if (sharedRoute) return <SharedMenuPage token={sharedRoute.token} />;

  if (pathname === '/about' || pathname === '/about/') return <AboutPage />;
  return <MarketingApp />;
}

export default App;
