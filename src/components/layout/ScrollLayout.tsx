'use client';

import Navbar from './Navbar';
import { ReactNode, useState, useEffect, useRef } from 'react';

type ScrollLayoutProps = {
  children: ReactNode;
};

export default function ScrollLayout({ children }: ScrollLayoutProps) {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      // Show/hide navbar based on scroll direction
      // Only trigger if we've scrolled more than 100px to avoid initial jitter
      if (current > lastScroll.current && current > 100) {
        setNavbarVisible(false);
      } else if (current < lastScroll.current) {
        setNavbarVisible(true);
      }

      lastScroll.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Navbar visible={navbarVisible} />

      <div
        id="content"
        className="w-full pt-[80px]" // ensure space for fixed navbar
      >
        {children}
      </div>
    </>
  );
}
