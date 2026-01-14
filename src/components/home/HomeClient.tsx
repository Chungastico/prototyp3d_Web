'use client';

import { useState } from 'react';
import Services from '@/components/home/SectionServices';
import Hero from '@/components/home/Hero';
import ScrollLayout from '@/components/layout/ScrollLayout';
import IntroTransition from '@/components/home/IntroTransition'; 
import Timeline from '@/components/home/Timeline';
import Footer from '@/components/layout/Footer';

export default function HomeClient() {
    /**
     * SEO-first: NO bloquear el LCP con overlays que dependen de hidratación.
     * Mantengo el estado por si luego quieres reactivarlo de forma opcional.
     */
    const [showIntro, setShowIntro] = useState(false);

    return (
        <main className="relative">
            {/**
             * SEO-first (recomendado): IntroTransition desactivado para evitar LCP alto en móvil.
             * Opcional futuro (NO recomendado para SEO): reactivar solo bajo condiciones controladas.
             */}
            {showIntro && <IntroTransition onFinish={() => setShowIntro(false)} />}

            <ScrollLayout>
                <Hero />
                <Services />
                <Timeline />
                <Footer />
            </ScrollLayout>
        </main>
    );
}
