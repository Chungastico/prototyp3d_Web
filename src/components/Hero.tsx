'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

        tl.fromTo(titleRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })
            .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=0.7')
            .fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.6')
            .fromTo(imageRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, '-=0.5');
    }, []);

    return (
        <section
            className="h-[calc(100vh-88px)] px-6 sm:px-8"
            style={{
                background: 'linear-gradient(180deg, #262C4D 3.07%, #FF7123 128.91%)',
            }}
        >
            <div className="flex flex-col md:flex-row justify-center md:justify-start items-center md:items-center gap-y-12 md:gap-y-0 gap-x-12 md:gap-x-24 h-full max-w-[1200px] mx-auto text-beige-claro font-garet">
                {/* Texto izquierdo */}
                <div className="w-full md:w-[55%] text-center md:text-left z-10">
                    <h1
                        ref={titleRef}
                        className="text-4xl sm:text-5xl md:text-5xl lg:text-[64px] font-extrabold mb-4 md:mb-6 leading-[1.1]"
                    >
                        <span className="block">DALE FORMA A</span>
                        <span className="block">TUS IDEAS</span>
                    </h1>
                    <p
                        ref={subtitleRef}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 font-normal"
                    >
                        Te ayudamos a materializar conceptos con impresión 3D accesible y confiable.
                    </p>
                    <button
                        ref={buttonRef}
                        className="bg-azul-oscuro text-naranja text-base sm:text-lg md:text-lg lg:text-xl font-extrabold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-azul transition"
                    >
                        Explorar servicios
                    </button>
                </div>

                {/* Imagen derecha */}
                <div className="w-[240px] sm:w-[300px] md:w-[420px] z-10">
                    <img
                        ref={imageRef}
                        src="/images/heroBambu.png"
                        alt="Hero Bambu"
                        className="w-full h-auto rounded-xl shadow-lg object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
