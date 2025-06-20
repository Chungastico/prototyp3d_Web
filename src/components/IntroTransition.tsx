'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Flip from 'gsap/Flip';

gsap.registerPlugin(Flip);

export default function IntroTransition({ onFinish }: { onFinish: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const state = Flip.getState(brandRef.current);

        brandRef.current?.classList.add('brand-final');

        Flip.from(state, {
            duration: 1.2,
            ease: 'power3.inOut',
            absolute: true,
            onComplete() {
                onFinish();
            },
        });
    }, [onFinish]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-azul-oscuro flex items-center justify-center"
        >
            <div
                ref={brandRef}
                id="brand"
                className="flex flex-col items-center gap-y-0 brand-start"
            >
                {/* Logo */}
                <div className="w-[360px] h-[360px]">
                    <Image
                        src="/images/logo/Logo_Naranja.png"
                        alt="Logo"
                        width={600}
                        height={600}
                        className="object-contain"
                    />
                </div>

                {/* Letras superpuestas al logo */}
                <div className="-mt-44"> {/* -mt-36 = se monta bastante */}
                    <Image
                        src="/images/logo/Letras.png"
                        alt="Texto PROT0TYP3D"
                        width={360}
                        height={90}
                    />
                </div>
            </div>
        </div>
    );
}
