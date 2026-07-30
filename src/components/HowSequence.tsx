import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Lang } from '../content/copy';
import { COPY } from '../content/copy';
import { ProductPhone } from './ProductPhone';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "How it works" as one continuous, pinned, scroll-scrubbed sequence: a single
 * phone stays centred while its screen transforms scan → understand → recommend,
 * the copy cross-fades step to step, and a progress rail tracks 01 → 02 → 03.
 * Reuses the CareExperience sticky-stage + scrub pattern (no GSAP pin — the
 * `position: sticky` stage inside a tall section does the pinning natively).
 */
export function HowSequence({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLElement>(null);
  const copy = COPY[lang].how;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const phone = root.querySelector<HTMLElement>('[data-how-phone]');
      const fill = root.querySelector<HTMLElement>('[data-how-fill]');
      const screens = gsap.utils.toArray<HTMLElement>('[data-how-screen]', root);
      const scenes = gsap.utils.toArray<HTMLElement>('[data-how-scene]', root);
      const ticks = gsap.utils.toArray<HTMLElement>('[data-how-tick]', root);
      if (!phone || !fill || screens.length < 3 || scenes.length < 3) return;

      const matches = gsap.matchMedia();

      matches.add(
        { compact: '(max-width: 767px)', wide: '(min-width: 768px)' },
        (context) => {
          const compact = Boolean(context.conditions?.compact);
          const tilt = compact ? 4 : 8;

          // Baseline: only the first chapter is visible.
          gsap.set(screens, { autoAlpha: 0, scale: 1.06 });
          gsap.set(screens[0], { autoAlpha: 1, scale: 1 });
          gsap.set(scenes, { autoAlpha: 0, y: 34 });
          gsap.set(scenes[0], { autoAlpha: 1, y: 0 });
          gsap.set(ticks, { opacity: 0.32 });
          gsap.set(ticks[0], { opacity: 1 });
          const fillAxis = compact ? 'scaleX' : 'scaleY';
          gsap.set(fill, { [fillAxis]: 0 });
          gsap.set(phone, { rotateY: -tilt, rotateX: 2, yPercent: compact ? 0 : 2 });

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          // Continuous, anchored phone drift — a slow rotateY sweep, never the
          // in/out wobble. Runs across the whole scroll for a live feel.
          timeline
            .to(fill, { [fillAxis]: 1, duration: 1 }, 0)
            .to(phone, { rotateY: tilt * 0.4, yPercent: compact ? 0 : -2, duration: 1 }, 0);

          // Two crossfades between three chapters. `hold` frames each step; the
          // transition pushes the outgoing screen back and lifts the next in.
          const cut = (from: number, to: number, at: number, dur: number) => {
            timeline
              .to(screens[from], { autoAlpha: 0, scale: 1.05, yPercent: -2.5, duration: dur }, at)
              .fromTo(
                screens[to],
                { autoAlpha: 0, scale: 1.08, yPercent: 3 },
                { autoAlpha: 1, scale: 1, yPercent: 0, duration: dur },
                at,
              )
              .to(scenes[from], { autoAlpha: 0, y: -30, duration: dur }, at)
              .fromTo(scenes[to], { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: dur }, at)
              .to(ticks[from], { opacity: 0.32, duration: dur }, at)
              .to(ticks[to], { opacity: 1, duration: dur }, at);
          };

          cut(0, 1, 0.32, 0.12);
          cut(1, 2, 0.66, 0.12);

          return () => timeline.kill();
        },
      );

      return () => matches.revert();
    },
    { scope: rootRef, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      id="how"
      data-section="how"
      aria-labelledby="how-title"
      className="how-seq"
    >
      {/* Pinned cinematic stage (hidden for reduced motion) */}
      <div className="how-seq-stage">
        <div className="how-seq-grid">
          <div className="how-rail" aria-hidden="true">
            <span className="how-rail-fill" data-how-fill />
          </div>

          <div className="how-phone-col" aria-hidden="true">
            <div className="how-phone" data-how-phone>
              <div className="how-phone-glow" />
              <div className="product-phone">
                <div className="product-phone-screen how-phone-screen">
                  {copy.steps.map((step, index) => (
                    <img
                      key={step.number}
                      data-how-screen
                      src={step.screen}
                      alt=""
                      width="804"
                      height="1748"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="how-screen-layer"
                    />
                  ))}
                </div>
              </div>
              <div className="product-phone-shadow" />
            </div>
          </div>

          <div className="how-copy">
            <p className="section-eyebrow">{copy.eyebrow}</p>
            <h2 id="how-title" className="how-seq-title">{copy.title}</h2>

            <div className="how-scenes">
              {copy.steps.map((step) => (
                <div key={step.number} className="how-scene" data-how-scene>
                  <p className="font-sans-medium text-sm tabular-nums text-content-secondary">
                    {step.number} <span className="text-content-tertiary">/ 03</span>
                  </p>
                  <h3 className="how-scene-title">{step.title}</h3>
                  <p className="how-scene-body">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="how-progress">
              <div className="how-ticks">
                {copy.steps.map((step) => (
                  <span key={step.number} className="how-tick" data-how-tick>
                    {step.number}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced-motion / no-JS fallback: readable stacked steps */}
      <div className="how-seq-static">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
          <header className="max-w-3xl">
            <p className="section-eyebrow">{copy.eyebrow}</p>
            <h2 className="section-title mt-4">{copy.title}</h2>
            <p className="section-intro mt-6">{copy.intro}</p>
          </header>
          <div className="mt-20 space-y-24 sm:mt-28 sm:space-y-32">
            {copy.steps.map((step, index) => (
              <article
                key={step.number}
                className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                  index % 2 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="mx-auto w-full max-w-[390px] lg:max-w-[430px]">
                  <ProductPhone src={step.screen} alt={step.alt} eager={index === 0} />
                </div>
                <div className="max-w-lg">
                  <p className="font-sans-medium text-sm tabular-nums text-content-secondary">
                    {step.number} / 03
                  </p>
                  <h3 className="mt-5 font-display-title text-4xl leading-[1.08] text-content-primary sm:text-5xl">
                    {step.title}
                  </h3>
                  <p className="mt-6 font-sans text-lg leading-8 text-content-secondary">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
