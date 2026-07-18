// The feature showcase — sections 2..n. Each is a tall scroll section
// whose inner screen sticks; the big copy sits left or right and the 3D
// phone (src/three/Stage.tsx) floats on the other side. The copy's
// opacity/translate is driven by the master timeline
// (src/showcase/timeline.ts) — no per-section tweens here.

import { COPY, type Lang } from '../content/copy';

export function Showcase({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <>
      {copy.features.map((feature, i) => {
        const textRight = i % 2 === 1;
        return (
          <section
            key={feature.title}
            id={`act-${i + 1}`}
            aria-label={feature.title}
            data-act={i + 1}
            data-showcase
            className="relative z-10 h-[260vh]"
          >
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
              <div className={`mx-auto flex w-full max-w-6xl px-6 md:px-10 ${textRight ? 'justify-end' : ''}`}>
                <div data-showcase-copy className={`max-w-xl opacity-0 ${textRight ? 'text-right' : ''}`}>
                  <h2 className="font-display-hero text-landing-hero text-content-primary">{feature.title}</h2>
                  <p className={`mt-6 max-w-md font-sans text-landing-sub text-content-secondary ${textRight ? 'ml-auto' : ''}`}>
                    {feature.body}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
