'use client';

import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function ScrollLayout({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const skewSetter = gsap.quickTo('.skew-img', 'skewY');
      const clamp = gsap.utils.clamp(-20, 20);

      const smoother = ScrollSmoother.create({
        wrapper: '#wrapper',
        content: '#content',
        smooth: 2,
        speed: 1.5,
        effects: true,
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          skewSetter(clamp(velocity / -50));
        },
        onStop: () => {
          skewSetter(0);
        },
      });

      return () => {
        smoother.kill();
      };
    }
  }, []);

  return (
    <div id="wrapper" className="fixed top-0 left-0 w-full h-full overflow-hidden">
      <div id="content" className="w-full overflow-visible">
        {children}
      </div>
    </div>
  );
}
