'use client';

import Navbar from './Navbar';
import { ReactNode, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

type ScrollLayoutProps = {
  children: ReactNode;
};

export default function ScrollLayout({ children }: ScrollLayoutProps) {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScroll = useRef(0);
  const smoother = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    smoother.current = ScrollSmoother.create({
      wrapper: '#wrapper',
      content: '#content',
      smooth: 2,
      speed: 1.5,
      effects: true,
      onUpdate: (self) => {
        const current = self.scrollTop();

        if (current > lastScroll.current && current > 100) {
          setNavbarVisible(false);
        } else if (current < lastScroll.current) {
          setNavbarVisible(true);
        }

        lastScroll.current = current;
      },
    });

    return () => {
      smoother.current?.kill();
    };
  }, []);

  return (
    <>
      {/* Aquí pasamos la prop al Navbar */}
      <Navbar visible={navbarVisible} />

      <div
        id="wrapper"
        className="fixed top-0 left-0 w-full h-full overflow-hidden"
      >
        <div
          id="content"
          className="w-full overflow-visible pt-[80px]" // deja espacio para navbar fijo
        >
          {children}
        </div>
      </div>
    </>
  );
}
