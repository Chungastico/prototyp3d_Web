'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

export default function Intro({ onFinish }: { onFinish: () => void }) {
    const introRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
                setTimeout(() => {
                    onFinish();
                }, 300);
            }

        });

        tl.fromTo(
            contentRef.current,
            { opacity: 0, scale: 1.3, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2 }
        )
        .to(
            introRef.current,
            { opacity: 0, duration: 0.8, ease: 'power2.inOut' },
            '+=1'
        );
    }, [onFinish]);

    return (
        <div
            ref={introRef}
            className="fixed inset-0 bg-azul-oscuro flex items-center justify-center z-[100]"
        >
            <div
                ref={contentRef}
                className="flex flex-col items-center justify-center space-y-4"
            >
                <Image
                    src="/images/logo/Logo_Naranja.png"
                    alt="Logo"
                    width={140}
                    height={140}
                    className="object-contain"
                />
                <Image
                    src="/images/logo/Letras.png"
                    alt="Texto PROT0TYP3D"
                    width={280}
                    height={70}
                    className="object-contain"
                />
            </div>
        </div>
    );
}
