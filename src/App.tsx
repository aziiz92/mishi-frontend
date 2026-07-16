import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { MenuChaosSection } from './chaos/MenuChaosSection';
import { auditSummary, startDotAudit } from './dot/audit';
import { track, trackActViewed, trackTierServed, type CtaId } from './lib/analytics';
import { detectTier, type Tier } from './lib/tier';
import { SequencePlayer } from './scene/SequencePlayer';
import { frameSrc } from './scene/sequence';
import { createScrollSpine, type ScrollSpine } from './scroll/master';
import { LegalPage } from './legal/LegalPage';
import { legalPageFromPath } from './legal/routes';
import { SharedMenuPage } from './shared/SharedMenuPage';
import { sharedRouteFromPath } from './shared/routes';

// Tier A only, fetched after first paint — the hero never waits on WebGL.
const Stage = lazy(() => import('./three/Stage'));

// DEV-only URL overrides (compiled out of prod):
//   ?tier=…    force a tier   ?sweep=1  scripted audit scroll
//   ?p=0.42    jump to progress (sequence capture)   ?bare=1  hide live layers
const params = new URLSearchParams(window.location.search);
const forcedTier: Tier | null = import.meta.env.DEV ? (params.get('tier') as Tier | null) : null;
const sweep = import.meta.env.DEV && params.get('sweep') === '1';
const jumpTo = import.meta.env.DEV ? Number(params.get('p') ?? NaN) : NaN;
const bare = import.meta.env.DEV && params.get('bare') === '1';

function MarketingApp() {
  const mainRef = useRef<HTMLElement>(null);
  const spineRef = useRef<ScrollSpine | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
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

  // The scroll spine + dot journey + scene choreography (Tiers A and B).
  useEffect(() => {
    const dotEl = document.getElementById('dot');
    if (!mainRef.current || !dotEl || tier === null || tier === 'static') return;

    const spine = createScrollSpine(mainRef.current, tier, dotEl);
    spineRef.current = spine;
    const stopAudit = import.meta.env.DEV
      ? startDotAudit(dotEl, () => spine.timeline.progress())
      : undefined;

    if (!Number.isNaN(jumpTo)) {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      window.setTimeout(() => spine.lenis.scrollTo(jumpTo * bottom, { immediate: true, force: true }), 900);
    }

    let devInterval: number | undefined;
    if (import.meta.env.DEV) {
      devInterval = window.setInterval(() => {
        const a = auditSummary;
        setDevInfo(
          `p=${spine.timeline.progress().toFixed(3)} · owner=${spine.currentDotOwner()} · ` +
            `dot audit: frames=${a.frames} viol=${a.violations} min=${a.minVisible} max=${a.maxVisible}`,
        );
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
      stopAudit?.();
      window.clearInterval(devInterval);
      window.clearTimeout(sweepTimer);
      spineRef.current = null;
      spine.destroy();
    };
  }, [tier]);

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
        const m = entry.name.match(/(phone\.draco\.glb|plate\.draco\.glb|draco_decoder)/);
        if (m) seen.set(m[1].replace('.draco.glb', ''), entry.startTime);
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

  const handleCta = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault(); // download hrefs stay '#' until D4 + store listings exist
    const cta = e.currentTarget.dataset.cta as CtaId;
    track({ event_name: 'landing_cta_tapped', cta });
    if (cta === 'view_demo') {
      // « Voir une démo » scrolls back to Act 2 — the section's document top
      const act2 = document.getElementById('act-2');
      if (act2 && spineRef.current) {
        spineRef.current.lenis.scrollTo(act2.getBoundingClientRect().top + window.scrollY, { duration: 2.2 });
      }
    }
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

  const hideLive = bare ? 'invisible' : '';

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
        <svg viewBox="288 368 448 302" className="relative h-24 w-auto text-content-primary" data-dot-anchor="hero-mark" aria-hidden="true">
          <path d="M 330 628 L 330 501 A 91 91 0 0 1 512 501 A 91 91 0 0 1 694 501 L 694 628" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 512 501 L 512 525" fill="none" stroke="currentColor" strokeWidth="84" strokeLinecap="round" />
        </svg>
        <h1 className="relative mt-12 font-display-hero text-landing-hero text-content-primary">
          Tu regardes le menu. Le menu te regarde.
        </h1>
        <p className="relative mt-6 max-w-xl font-sans text-landing-sub text-content-secondary">
          Une photo. Une recommandation. Moins de 60 secondes.
        </p>
      </section>

      {/* Act 1 — Le Chaos: the menu labyrinth (DL57). The hero menu lifts,
          unfolds into paper panels that become the room, closes in, and
          collapses into the scan frame. DOM in src/chaos/, motion on the
          master timeline (src/chaos/timeline.ts). */}
      <MenuChaosSection tier={tier} />

      {/* Act 2 — Le Scan. The one espresso act (D1 ratified). The phone GLB
          (Tier A) / frames (Tier B) render at the anchor; the dot flies into
          the screen and scans. */}
      <section
        id="act-2"
        aria-label="Le Scan"
        data-act="2"
        className={`relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden ${isStatic ? 'bg-surface-inverse' : ''}`}
      >
        {isStatic && (
          <img src={frameSrc(12)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div data-dot-anchor="phone-screen" className="relative h-[440px] w-[204px]" aria-hidden="true">
          {isStatic && <span className="absolute left-1/2 top-[42%] h-6 w-6 -translate-x-1/2 rounded-full bg-accent" />}
        </div>
        <p
          id="act2-copy"
          className={`relative max-w-md px-6 text-center font-display-title text-2xl text-content-inverse ${isStatic ? 'opacity-100' : 'opacity-0'} ${hideLive}`}
        >
          Mishi lit le menu comme un ami qui vit ici.
        </p>
      </section>

      {/* Act 3 — Le Choix. Plate GLB entrance, dot landing, cream bloom,
          pinned result with confidence chip + the honest image label. */}
      <section id="act-3"
        aria-label="Le Choix" data-act="3" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6">
        {isStatic && (
          <img src={frameSrc(29)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <h2 className={`relative font-display-title text-3xl text-content-primary ${hideLive}`}>Un seul plat. Choisi pour toi.</h2>
        <div data-dot-anchor="plate" className="relative h-72 w-72" aria-hidden="true">
          {isStatic && <span className="absolute left-1/2 top-[30%] h-6 w-6 -translate-x-1/2 rounded-full bg-accent" />}
        </div>
        <div id="result-card" className={`relative w-80 max-w-full rounded-xl bg-surface-raised p-5 shadow-[0px_6px_20px_rgba(28,23,20,0.12)] ${isStatic ? 'opacity-100' : 'opacity-0'} ${hideLive}`}>
          <h3 className="font-display-title text-2xl text-content-primary">Poulet Yassa</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-content-secondary">
            Généreux et parfumé — le choix sûr ici.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">
              Global · <span className="tabular-nums">92 %</span>
            </span>
            {/* the honest image label — part of the demo, non-negotiable */}
            <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">
              Illustration
            </span>
          </div>
        </div>
      </section>

      {/* Act 4 — La Confiance. The trust triptych; the dot is the bullet. */}
      <section id="act-4"
        aria-label="La Confiance" data-act="4" className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-14 md:grid-cols-3 md:gap-8">
          {/* 1 — dietary trust: sage appears here and ONLY here (D16 tags).
              No title by design — the doc gives this panel no copy line. */}
          <div data-dot-anchor="panel-1" className="relative rounded-lg border border-border bg-surface-raised p-6">
            {isStatic && <span aria-hidden="true" className="absolute -top-9 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-accent" />}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-sm bg-signal-dietary px-3 py-1.5 font-sans text-sm text-signal-dietary-on">halal</span>
              <span className="rounded-sm bg-signal-dietary px-3 py-1.5 font-sans text-sm text-signal-dietary-on">végétarien</span>
              <span className="rounded-sm bg-signal-dietary px-3 py-1.5 font-sans text-sm text-signal-dietary-on">allergènes</span>
            </div>
          </div>
          {/* 2 — the four provenance types as real chips; both illustration
              types honestly share one label (A11) */}
          <div data-dot-anchor="panel-2" className="rounded-lg border border-border bg-surface-raised p-6">
            <h3 className="font-display-small text-xl text-content-primary">Images honnêtes</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">Photo du plat</span>
              <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">Photo d'exemple</span>
              <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">Illustration</span>
              <span className="rounded-sm bg-surface-sunken px-2 py-1 font-sans text-xs text-content-secondary">Illustration</span>
            </div>
            <p className="mt-4 font-sans text-sm leading-relaxed text-content-secondary">On ne te ment jamais sur la photo.</p>
          </div>
          {/* 3 — d'ici */}
          <div data-dot-anchor="panel-3" className="rounded-lg border border-border bg-surface-raised p-6">
            <h3 className="font-display-small text-xl text-content-primary">D'ici</h3>
            <div className="mt-4 flex flex-wrap gap-2 font-sans text-xs text-content-secondary">
              <span className="rounded-sm bg-surface-sunken px-2 py-1">FR · EN</span>
              <span className="rounded-sm bg-surface-sunken px-2 py-1 tabular-nums">FCFA</span>
              <span className="rounded-sm bg-surface-sunken px-2 py-1">Poulet Yassa</span>
            </div>
            <p className="mt-4 font-sans text-sm leading-relaxed text-content-secondary">Conçu à Dakar.</p>
          </div>
        </div>
      </section>

      {/* Act 5 — La Décision. The dot IS the typographic period. */}
      <section id="act-5"
        aria-label="La Décision" data-act="5" className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h2 className="font-display-hero text-landing-hero text-content-primary">
          Mishi choisit. Tu{' '}
          <span className="whitespace-nowrap">
            manges
            <span data-dot-anchor="period" className={`ml-2 inline-block h-[18px] w-[18px] ${isStatic ? 'rounded-full bg-accent' : ''}`} aria-hidden="true" />
          </span>
        </h2>
        <div className="mt-14 flex flex-col items-center gap-5">
          {/* the saffron ration's primary spend: the download CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" data-cta="download_ios" onClick={handleCta} className="rounded-full bg-accent px-7 py-3 text-center font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
              Télécharger Mishi
              <span className="block font-sans text-xs opacity-80">App Store</span>
            </a>
            <a href="#" data-cta="download_android" onClick={handleCta} className="rounded-full bg-accent px-7 py-3 text-center font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
              Télécharger Mishi
              <span className="block font-sans text-xs opacity-80">Google Play</span>
            </a>
          </div>
          {/* secondary stays saffron-free (D22 precedent) */}
          <button type="button" data-cta="view_demo" onClick={handleCta} className="rounded-md border border-border px-6 py-3 font-sans text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
            Voir une démo
          </button>
        </div>
        {/* CC-BY-4.0 attribution (DL5, Aziiz: footer line) */}
        <p className="absolute bottom-4 px-6 text-center font-sans text-xs text-content-tertiary">
          Assiette 3D : «&nbsp;Plate&nbsp;» par andrejpustovojtenko7 (Sketchfab) — licence CC-BY-4.0
        </p>
      </section>

      {tier === 'tierA' && (
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      )}
      {tier === 'tierB' && <SequencePlayer getProgress={() => spineRef.current?.timeline.progress() ?? 0} />}

      {import.meta.env.DEV && !bare && (
        <div aria-hidden="true" className="fixed bottom-2 left-2 z-50 bg-surface-inverse px-3 py-2 font-sans text-xs text-content-inverse">
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
