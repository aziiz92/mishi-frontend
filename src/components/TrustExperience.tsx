import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Lang } from '../content/copy';
import { COPY } from '../content/copy';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type PhonePosition = 'top' | 'center' | 'low';

type TrustItem = {
  id: string;
  title: string;
  body: string;
  screen: string;
  alt: string;
  phonePosition: PhonePosition;
};

export function TrustExperience({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLElement>(null);
  const copy = COPY[lang].trust;
  const screenSuffix = lang === 'fr' ? 'fr' : 'en';
  const items: TrustItem[] = [
    {
      id: 'images',
      title: copy.imageTitle,
      body: copy.imageBody,
      screen: `/screens/understand-${screenSuffix}.webp`,
      alt: copy.imageAlt,
      phonePosition: 'top',
    },
    {
      id: 'preferences',
      title: copy.preferenceTitle,
      body: copy.preferenceBody,
      screen: `/screens/profile-${screenSuffix}.webp`,
      alt: copy.preferenceAlt,
      phonePosition: 'top',
    },
    {
      id: 'collection',
      title: copy.collectionTitle,
      body: copy.collectionBody,
      screen: `/screens/discover-${screenSuffix}.webp`,
      alt: copy.collectionAlt,
      phonePosition: 'top',
    },
    {
      id: 'privacy',
      title: copy.privacyTitle,
      body: copy.privacyBody,
      screen: `/screens/scan-${screenSuffix}.webp`,
      alt: copy.privacyAlt,
      phonePosition: 'center',
    },
  ];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          compact: '(max-width: 1023px)',
          desktop: '(min-width: 1024px)',
        },
        (context) => {
          const compact = Boolean(context.conditions?.compact);
          const cards = gsap.utils.toArray<HTMLElement>('[data-trust-card]', root);
          const animations: gsap.core.Tween[] = [];

          cards.forEach((card, index) => {
            const phone = card.querySelector<HTMLElement>('[data-trust-phone]');
            if (phone) {
              animations.push(
                gsap.fromTo(
                  phone,
                  {
                    yPercent: compact ? 4 : 7,
                    rotateZ: index % 2 === 0 ? (compact ? 0.6 : 1.4) : compact ? -0.5 : -1.1,
                  },
                  {
                    yPercent: compact ? -3 : -5,
                    rotateZ: index % 2 === 0 ? (compact ? -0.25 : -0.6) : compact ? 0.2 : 0.5,
                    ease: 'none',
                    scrollTrigger: {
                      trigger: card,
                      start: 'top bottom',
                      end: 'bottom top',
                      scrub: 1,
                      invalidateOnRefresh: true,
                    },
                  },
                ),
              );
            }

            const nextCard = cards[index + 1];
            if (!nextCard) return;
            animations.push(
              gsap.to(card, {
                scale: compact ? 0.975 : 0.965,
                opacity: compact ? 0.78 : 0.68,
                transformOrigin: 'top center',
                ease: 'none',
                scrollTrigger: {
                  trigger: nextCard,
                  start: 'top bottom',
                  end: 'top 5.5rem',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }),
            );
          });

          return () => {
            animations.forEach((animation) => {
              animation.scrollTrigger?.kill();
              animation.kill();
            });
          };
        },
      );

      return () => {
        media.revert();
      };
    },
    { scope: rootRef, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      id="trust"
      data-section="trust"
      aria-labelledby="trust-title"
      className="trust-experience launch-section bg-surface-inverse px-4 py-24 text-content-inverse sm:px-6 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-6xl">
        <header className="trust-heading max-w-5xl px-2 sm:px-0">
          <h2
            id="trust-title"
            className="max-w-4xl font-display-title text-[clamp(3.1rem,6.4vw,6rem)] leading-[0.96] tracking-[-0.025em] text-content-inverse"
          >
            {copy.title}
          </h2>
          <p className="mt-7 max-w-2xl font-sans text-lg leading-8 text-border sm:text-xl sm:leading-9">
            {copy.intro}
          </p>
        </header>

        <div className="trust-stack mt-20 sm:mt-28">
          {items.map((item, index) => (
            <article
              key={item.id}
              data-trust-card
              className={`trust-stack-card trust-stack-card-${item.id}`}
              style={{ zIndex: index + 1 }}
            >
              <div className="trust-stack-copy">
                <h3 className="max-w-md font-sans-semibold text-[clamp(2.5rem,4.5vw,4.75rem)] leading-[0.92] tracking-[-0.045em] text-content-primary">
                  {item.title}
                </h3>
                <p className="mt-5 max-w-md font-sans text-lg leading-8 text-content-secondary">
                  {item.body}
                </p>
              </div>

              <div className="trust-stack-visual">
                <div
                  data-trust-phone
                  className={`trust-stack-device trust-stack-device-${item.phonePosition}`}
                >
                  <div className="trust-stack-device-screen">
                    <img
                      src={item.screen}
                      alt={item.alt}
                      width="804"
                      height="1748"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
