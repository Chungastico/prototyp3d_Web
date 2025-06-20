'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother); 

export default function ScrollLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const skewSetter = gsap.quickTo('img', 'skewY');
      const clamp = gsap.utils.clamp(-20, 20);

      ScrollSmoother.create({
        wrapper: '#wrapper',
        content: '#content',
        smooth: 2,
        speed: 3,
        effects: true,
        onUpdate: (self: any) => skewSetter(clamp(self.getVelocity() / -50)),
        onStop: () => skewSetter(0),
      });
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
