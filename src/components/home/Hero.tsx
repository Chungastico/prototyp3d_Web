'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'motion';
import { splitText } from 'motion-plus';

export default function Hero() {
    const titleContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.fonts.ready.then(() => {
            if (!titleContainerRef.current) return;

            titleContainerRef.current.style.visibility = 'visible';

            const { words } = splitText(
                titleContainerRef.current.querySelector('h1')!
            );

            animate(
                words,
                { opacity: [0, 1], y: [20, 0] },
                {
                    type: 'spring',
                    duration: 1.5,
                    bounce: 0.2,
                    delay: stagger(0.05),
                }
            );
        });
    }, []);

    return (
        <section
            className="h-[calc(100vh-88px)] px-6 sm:px-8"
            style={{
                background: 'linear-gradient(180deg, #262C4D 3.07%, #FF7123 100.00%)',
            }}
        >
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-12 h-full max-w-[1200px] mx-auto text-beige-claro font-garet">
                {/* Texto izquierdo con animación */}
                <div
                    ref={titleContainerRef}
                    className="w-full md:w-[55%] text-center md:text-left z-10"
                    style={{ visibility: 'hidden' }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-[56px] lg:text-[64px] font-extrabold mb-4 md:mb-6 leading-tight split-word">
                        <span className="block">DALE FORMA A</span>
                        <span className="block">TUS IDEAS</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 font-normal">
                        Te ayudamos a materializar conceptos con impresión 3D accesible y confiable.
                    </p>
                    <button className="bg-azul-oscuro text-naranja text-base sm:text-lg md:text-xl font-extrabold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-azul transition">
                        Explorar servicios
                    </button>
                </div>

                {/* Imagen derecha */}
                <div className="w-[240px] sm:w-[300px] md:w-[420px] z-10 relative">
                    <Image
                        src="/images/HeroBambu.png"
                        alt="Hero Bambu"
                        width={420}
                        height={420}
                        className="w-full h-auto rounded-xl shadow-lg object-contain"
                        draggable={false}
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
