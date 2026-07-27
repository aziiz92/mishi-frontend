import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ProductPhone } from './ProductPhone';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type MovingProductPhoneProps = {
  src: string;
  alt: string;
  eager?: boolean;
  direction: 'left' | 'right';
};

export function MovingProductPhone({
  src,
  alt,
  eager = false,
  direction,
}: MovingProductPhoneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const phone = rootRef.current;

      if (!phone || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const step = phone.closest<HTMLElement>('[data-phone-step]') ?? phone;
      const side = direction === 'left' ? -1 : 1;
      const travel = () => Math.min(window.innerWidth * (window.innerWidth >= 1024 ? 0.18 : 0.1), 220);

      gsap.set(phone, { willChange: 'transform' });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'top 92%',
          end: 'bottom 8%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(
          phone,
          {
            x: () => side * travel(),
            rotateY: side * -9,
            rotateZ: side * 3.5,
            scale: 0.94,
          },
          {
            x: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            duration: 0.55,
            ease: 'power1.out',
          },
        )
        .to(phone, {
          x: () => side * travel() * -0.72,
          rotateY: side * 6,
          rotateZ: side * -2,
          scale: 0.98,
          duration: 0.45,
          ease: 'power1.inOut',
        });

      return () => {
        timeline.kill();
        gsap.set(phone, { clearProps: 'transform,willChange' });
      };
    },
    { scope: rootRef, dependencies: [direction], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="product-phone-motion" data-phone-motion={direction}>
      <ProductPhone src={src} alt={alt} eager={eager} />
    </div>
  );
}
