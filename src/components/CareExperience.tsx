import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Lang } from '../content/copy';
import { COPY } from '../content/copy';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function CareExperience({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLElement>(null);
  const copy = COPY[lang].care;
  const [titleLead, titleTail] = copy.title.split(',');

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const media = root.querySelector<HTMLElement>('[data-care-media]');
      const opening = root.querySelector<HTMLElement>('[data-care-opening]');
      const story = root.querySelector<HTMLElement>('[data-care-story]');
      const scrim = root.querySelector<HTMLElement>('[data-care-scrim]');
      const image = root.querySelector<HTMLElement>('[data-care-image]');
      if (!media || !opening || !story || !scrim || !image) return;

      const matches = gsap.matchMedia();

      matches.add(
        {
          compact: '(max-width: 767px)',
          wide: '(min-width: 768px)',
        },
        (context) => {
          const compact = Boolean(context.conditions?.compact);
          gsap.set(story, { autoAlpha: 0, y: compact ? 28 : 42 });
          gsap.set(scrim, { opacity: 0 });
          gsap.set(opening, { autoAlpha: 1, yPercent: 0 });
          gsap.set(media, { scale: 1 });
          gsap.set(image, { scale: compact ? 1.16 : 1.1, yPercent: 0 });

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

          timeline
            .to(media, { scale: compact ? 3.15 : 2.7, duration: 0.68 }, 0)
            .to(image, { scale: 1, yPercent: compact ? -3 : -2, duration: 0.68 }, 0)
            .to(opening, { autoAlpha: 0, yPercent: -24, duration: 0.3 }, 0.18)
            .to(scrim, { opacity: 1, duration: 0.3 }, 0.43)
            .to(story, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.58);

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
      data-section="care"
      aria-labelledby="care-title"
      className="care-journey launch-section"
    >
      <div className="care-stage">
        <div className="care-media-anchor" aria-hidden="true">
          <div data-care-media className="care-media">
            <picture>
              <source type="image/avif" srcSet="/story/menu-table-dakar-v2.avif" />
              <img
                data-care-image
                src="/story/menu-table-dakar-v2.webp"
                alt=""
                width="1672"
                height="941"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div data-care-scrim className="care-media-scrim" />
          </div>
        </div>

        <div data-care-opening className="care-opening">
          <p className="section-eyebrow">{copy.eyebrow}</p>
          <h2 id="care-title">
            <span>{titleLead},</span>
            <span>{titleTail?.trim()}</span>
          </h2>
        </div>

        <div data-care-story className="care-story">
          <p className="care-scene-note">{copy.sceneLabel}</p>
          <p className="care-story-body">{copy.body}</p>
          <a
            href="/about"
            className="care-story-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-inverse"
          >
            <span>{copy.link}</span>
            <ArrowUpRightIcon size={22} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
