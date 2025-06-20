// utils/animations.js
import gsap from 'gsap';

export const fadeInUp = (target, delay = 0) => {
    gsap.fromTo(
        target,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out' }
    );
};
