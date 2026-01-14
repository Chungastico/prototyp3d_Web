'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        /**
         * SEO-first: Eliminada animación de entrada (tl.fromTo) para mejorar LCP.
         * Los elementos inician en su posición final (CSS static).
         * Solo mantenemos las animaciones de scroll (ScrollTrigger) abajo.
         */

        // Efecto parallax + zoom suave al hacer scroll
        if (imageRef.current) {
            gsap.to(imageRef.current, {
                y: -20,
                scale: 1.05,
                ease: 'none',
                scrollTrigger: {
                    trigger: imageRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }
        if (titleRef.current) {
            gsap.to(titleRef.current, {
                y: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        if (subtitleRef.current) {
            gsap.to(subtitleRef.current, {
                y: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: subtitleRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        // Limpieza al desmontar
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section
            className="h-[calc(100vh-88px)] px-6 sm:px-8"
            style={{
                background: 'linear-gradient(180deg, #262C4D 3.07%, #FF7123 100.00%)',
            }}
        >
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-12 h-full max-w-[1200px] mx-auto text-beige-claro font-garet">
                {/* Texto izquierdo */}
                <div className="w-full md:w-[55%] text-center md:text-left z-10">
                    <h1
                        ref={titleRef}
                        className="text-4xl sm:text-5xl md:text-[56px] lg:text-[64px] font-extrabold mb-4 md:mb-6 leading-tight"
                    >
                        <span className="block">DALE FORMA A</span>
                        <span className="block">TUS IDEAS</span>
                        <span className="sr-only"> - Impresión 3D en El Salvador</span>
                    </h1>
                    <p
                        ref={subtitleRef}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 font-normal"
                    >
                        Te ayudamos a materializar conceptos con impresión 3D accesible y confiable en El Salvador.
                    </p>
                    <button
                        ref={buttonRef}
                        className="bg-white border border-white text-azul-oscuro text-base sm:text-lg md:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-azul-oscuro hover:text-white transition"
                    >
                        Explorar servicios
                    </button>
                </div>

                {/* Imagen derecha */}
                <div ref={imageRef} className="w-[240px] sm:w-[300px] md:w-[420px] z-10">
                    <Image
                        src="/images/HeroBambu.png"
                        alt="Impresora 3D Bambu Lab imprimiendo piezas de alta calidad en Prototyp3D El Salvador"
                        width={420}
                        height={420}
                        priority
                        sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 420px"
                        className="w-full h-auto rounded-xl shadow-lg object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
