import { AppleLogoIcon } from '@phosphor-icons/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { COPY, type Lang } from './content/copy';
import { track, trackActViewed, trackTierServed, type CtaId } from './lib/analytics';
import { applyLang, initialLang } from './lib/lang';
import { detectTier, type Tier } from './lib/tier';
import { landingConfig } from './landing.config';
import { Nav } from './Nav';
import { createScrollSpine, type ScrollSpine } from './scroll/master';
import { LegalPage } from './legal/LegalPage';
import { legalPageFromPath } from './legal/routes';
import { SharedMenuPage } from './shared/SharedMenuPage';
import { sharedRouteFromPath } from './shared/routes';
import { Showcase } from './showcase/Showcase';

// Tier A only, fetched after first paint — the hero never waits on WebGL.
const Stage = lazy(() => import('./three/Stage'));

// DEV-only URL overrides (compiled out of prod):
//   ?tier=…    force a tier   ?sweep=1  scripted audit scroll
//   ?p=0.42    jump to progress (sequence capture)   ?bare=1  hide live layers
//   ?motionDebug=1  registration overlay (bounds, anchors, act boundaries)
const params = new URLSearchParams(window.location.search);
const forcedTier: Tier | null = import.meta.env.DEV ? (params.get('tier') as Tier | null) : null;
const sweep = import.meta.env.DEV && params.get('sweep') === '1';
const jumpTo = import.meta.env.DEV ? Number(params.get('p') ?? NaN) : NaN;
const bare = import.meta.env.DEV && params.get('bare') === '1';
const motionDebug = import.meta.env.DEV && params.get('motionDebug') === '1';
const MotionDebug = motionDebug ? lazy(() => import('./dev/MotionDebug').then((m) => ({ default: m.MotionDebug }))) : null;

function MarketingApp() {
  const mainRef = useRef<HTMLElement>(null);
  const spineRef = useRef<ScrollSpine | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [lang, setLang] = useState<Lang>(initialLang);
  const copy = COPY[lang];
  // DEV-only gate-evidence readouts (compiled out of prod builds).
  const [devInfo, setDevInfo] = useState('');
  const [waterfall, setWaterfall] = useState('');
  const [tnumOk, setTnumOk] = useState<string>('…');

  useEffect(() => {
    let cancelled = false;
    void detectTier().then(({ tier: detected }) => {
      if (cancelled) return;
      const served = forcedTier ?? detected;
      setTier(served);
      trackTierServed(served);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isStatic = tier === 'static';

  // FR-first (D2); the toggle persists and re-tags the document (DL64).
  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  const handleLangChange = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    track({ event_name: 'landing_language_switched', lang: next });
  };

  // Static tier: the #dot singleton (outside #root) becomes absolute so it
  // rests in the hero and scrolls away; each later act carries its own
  // still-composition dot mark (§3's sanctioned reduced-motion fallback).
  useEffect(() => {
    document.documentElement.classList.toggle('tier-static', isStatic);
    // DEV capture: static tier has no Lenis — honor ?p with native scroll
    if (isStatic && !Number.isNaN(jumpTo)) {
      const t = window.setTimeout(() => {
        window.scrollTo({ top: jumpTo * (document.documentElement.scrollHeight - window.innerHeight) });
      }, 800);
      return () => window.clearTimeout(t);
    }
  }, [isStatic]);

  // The scroll spine + showcase choreography (Tiers A and B).
  useEffect(() => {
    if (!mainRef.current || tier === null || tier === 'static') return;

    const spine = createScrollSpine(mainRef.current);
    spineRef.current = spine;

    if (!Number.isNaN(jumpTo)) {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      window.setTimeout(() => spine.lenis.scrollTo(jumpTo * bottom, { immediate: true, force: true }), 900);
    }

    let devInterval: number | undefined;
    if (import.meta.env.DEV) {
      devInterval = window.setInterval(() => {
        setDevInfo(`p=${spine.timeline.progress().toFixed(3)}`);
      }, 250);
    }

    let sweepTimer: number | undefined;
    if (sweep) {
      sweepTimer = window.setTimeout(() => {
        const bottom = document.documentElement.scrollHeight - window.innerHeight;
        spine.lenis.scrollTo(bottom, {
          duration: 14,
          onComplete: () => spine.lenis.scrollTo(0, { duration: 7 }),
        });
      }, 1800);
    }

    return () => {
      window.clearInterval(devInterval);
      window.clearTimeout(sweepTimer);
      spineRef.current = null;
      spine.destroy();
    };
    // lang: copy swaps can reflow anchor geometry (Act 5's period rides the
    // headline width) — rebuild the spine so keyframes re-measure.
  }, [tier, lang]);

  // GLB lazy-load waterfall (gate evidence): when do 3D assets hit the
  // network relative to first contentful paint?
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const fcp = () => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    const seen = new Map<string, number>();
    const report = () => {
      const parts = [...seen.entries()].map(([n, t]) => `${n}@+${(t - fcp()).toFixed(0)}ms`);
      if (parts.length) setWaterfall(parts.join(' '));
    };
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const m = entry.name.match(/(iphone_17_pro_max\.glb|plate\.draco\.glb|draco_decoder)/);
        if (m) seen.set(m[1].replace(/(\.draco)?\.glb$/, ''), entry.startTime);
      }
      report();
    });
    observer.observe({ type: 'resource', buffered: true });
    return () => observer.disconnect();
  }, []);

  // Tabular-figures proof (DEV, gate evidence): with tnum active, all digit
  // strings at equal length have equal rendered width.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void document.fonts.ready.then(() => {
      const probe = (text: string) => {
        const el = document.createElement('span');
        el.className = 'font-sans tabular-nums';
        el.style.cssText = 'position:absolute;visibility:hidden;font-size:16px';
        el.textContent = text;
        document.body.append(el);
        const w = el.getBoundingClientRect().width;
        el.remove();
        return w;
      };
      const w1 = probe('1111');
      const w9 = probe('9999');
      setTnumOk(Math.abs(w1 - w9) < 0.05 ? `ok (1111=${w1.toFixed(2)}px 9999=${w9.toFixed(2)}px)` : `FAIL (${w1} vs ${w9})`);
    });
  }, []);

  // Lenis-smooth section scroll with a native fallback (static tier / pre-
  // spine clicks) — nav links and demo replay share it without breaking
  // scroll state.
  const scrollToSection = (id: string, duration = 1.8) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (spineRef.current) spineRef.current.lenis.scrollTo(top, { duration });
    else window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;
    e.preventDefault();
    scrollToSection(href.slice(1));
  };

  const handleCta = (e: React.MouseEvent<HTMLElement>) => {
    const cta = e.currentTarget.dataset.cta as CtaId;
    track({ event_name: 'landing_cta_tapped', cta });
    // real destinations proceed (mailto / a configured store listing) —
    // sendBeacon survives the navigation
    if (cta === 'hero_contact') return;
    if (cta === 'hero_download' && landingConfig.iosAppUrl) return;
    e.preventDefault(); // download hrefs stay '#' until D4 + store listings exist
    // « Voir une démo » replays the showcase; download intents land on the decision act
    if (cta === 'view_demo') scrollToSection('act-1', 2.2);
    if (cta === 'nav_download' || cta === 'hero_download') scrollToSection('act-5', 2.2);
  };

  // Act-depth analytics: IntersectionObserver, independent of the spine so
  // it also fires in the static tier.
  useEffect(() => {
    if (!mainRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          trackActViewed(Number((entry.target as HTMLElement).dataset.act));
        }
      },
      { threshold: 0.5 },
    );
    for (const section of mainRef.current.querySelectorAll('[data-act]')) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={mainRef} data-tier={tier ?? 'detecting'} className="bg-surface-canvas">
      {/* Act 0 — Le Point Tombe. Identical markup to the index.html shell
          (pre-JS paint). Edit only in lockstep with index.html. */}
      <section
        id="act-0"
        aria-label="Le Point Tombe"
        data-act="0"
        className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-[var(--hero-top)] text-center"
      >
        <picture className="pointer-events-none absolute inset-0" aria-hidden="true">
          <source type="image/avif" srcSet="/hero/hero-800.avif 800w, /hero/hero-1200.avif 1200w, /hero/hero-1672.avif 1672w" sizes="100vw" />
          <img src="/hero/hero-1200.webp" srcSet="/hero/hero-800.webp 800w, /hero/hero-1200.webp 1200w, /hero/hero-1672.webp 1672w" sizes="100vw" alt="" fetchPriority="high" className="h-full w-full object-cover object-bottom" />
        </picture>
        <Nav lang={lang} onLangChange={handleLangChange} onNavigate={handleNavigate} />
        <svg viewBox="288 368 448 302" className="relative h-24 w-auto text-content-primary" data-dot-anchor="hero-mark" aria-hidden="true">
          <path d="M 330 628 L 330 501 A 91 91 0 0 1 512 501 A 91 91 0 0 1 694 501 L 694 628" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 512 501 L 512 525" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" />
        </svg>
        <h1 className="relative mt-8 font-display-hero text-landing-hero text-content-primary">{copy.heroTitle}</h1>
        <p className="relative mt-4 max-w-xl font-sans text-landing-sub text-content-secondary">{copy.heroSub}</p>
        {/* hero CTA row (DL67/DL68): bottom-left, two IDENTICAL-size pills —
            saffron download (Apple mark) + porcelain restaurateur contact.
            The QR tile sits alone bottom-right; the drawn menu at center
            stays unobstructed (Act 1 lifts it). Store URLs are config
            (landing.config.ts). */}
        <div className="absolute bottom-7 left-5 z-10 flex flex-wrap items-center gap-3 md:left-10">
          <a
            href={landingConfig.iosAppUrl ?? '#'}
            data-cta="hero_download"
            onClick={handleCta}
            className="inline-flex h-[52px] min-w-[248px] items-center justify-center gap-2.5 rounded-full bg-accent px-6 font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            <AppleLogoIcon size={20} weight="fill" aria-hidden="true" />
            {copy.ctaDownload}
          </a>
          <a
            href={`mailto:${landingConfig.contactEmail}`}
            data-cta="hero_contact"
            onClick={handleCta}
            className="inline-flex h-[52px] min-w-[248px] items-center justify-center rounded-full border border-border bg-surface-raised/85 px-6 font-sans-semibold text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            {copy.heroContact}
          </a>
        </div>
        <div
          role="img"
          aria-label={copy.heroQrAria}
          className="absolute bottom-7 right-5 z-10 hidden items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-3 py-2 shadow-[0_6px_20px_rgba(28,23,20,0.10)] md:flex md:right-10"
        >
          <img src="/qr-ios.svg" alt="" className="h-12 w-12" width={29} height={29} />
          <span className="max-w-[10ch] text-left font-sans text-xs leading-tight text-content-secondary">{copy.heroQr}</span>
        </div>
      </section>

      {/* Sections 2..4 — the phone showcase (Flowty-style, 2026-07-18
          redesign): big copy left/right, the 3D phone floats and travels
          on the master timeline (src/showcase/). */}
      <Showcase lang={lang} />

      {/* Final act — La Décision. The accent period is the full stop. */}
      <section id="act-5"
        aria-label="La Décision" data-act="5" data-showcase-outro className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h2 className="font-display-hero text-landing-hero text-content-primary">
          {copy.decisionLead}{' '}
          <span className="whitespace-nowrap">
            {copy.decisionEnd}
            <span className="ml-2 inline-block h-[18px] w-[18px] rounded-full bg-accent" aria-hidden="true" />
          </span>
        </h2>
        <div className="mt-14 flex flex-col items-center gap-5">
          {/* the saffron ration's primary spend: the download CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" data-cta="download_ios" onClick={handleCta} className="rounded-full bg-accent px-7 py-3 text-center font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
              {copy.ctaDownload}
              <span className="block font-sans text-xs opacity-80">App Store</span>
            </a>
            <a href="#" data-cta="download_android" onClick={handleCta} className="rounded-full bg-accent px-7 py-3 text-center font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
              {copy.ctaDownload}
              <span className="block font-sans text-xs opacity-80">Google Play</span>
            </a>
          </div>
          {/* secondary stays saffron-free (D22 precedent) */}
          <button type="button" data-cta="view_demo" onClick={handleCta} className="rounded-md border border-border px-6 py-3 font-sans text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
            {copy.ctaDemo}
          </button>
        </div>
        {/* CC-BY-4.0 attribution (DL5, Aziiz: footer line) */}
        <p className="absolute bottom-4 px-6 text-center font-sans text-xs text-content-tertiary">{copy.attribution}</p>
      </section>

      {tier === 'tierA' && (
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      )}

      {MotionDebug && (
        <Suspense fallback={null}>
          <MotionDebug />
        </Suspense>
      )}

      {import.meta.env.DEV && !bare && (
        <div aria-hidden="true" className="fixed bottom-2 left-1/2 z-50 -translate-x-1/2 bg-surface-inverse px-3 py-2 font-sans text-xs text-content-inverse">
          tier: {tier ?? 'detecting'}
          {forcedTier ? ' (forced)' : ''} · {devInfo || 'spine starting…'}
          {waterfall && <div>3D waterfall (vs FCP): {waterfall}</div>}
          <div>tnum: {tnumOk}</div>
        </div>
      )}
    </main>
  );
}

function App() {
  const legalPage = legalPageFromPath(window.location.pathname);
  if (legalPage) return <LegalPage page={legalPage} />;

  const sharedRoute = sharedRouteFromPath(window.location.pathname);
  if (sharedRoute) return <SharedMenuPage token={sharedRoute.token} />;

  return <MarketingApp />;
}

export default App;
