'use client';

import { useState } from 'react';
import Services from '@/components/home/SectionServices';
import Hero from '@/components/home/Hero';
import ScrollLayout from '@/components/layout/ScrollLayout';
import IntroTransition from '@/components/home/IntroTransition'; 
import Timeline from '@/components/home/Timeline';
import Footer from '@/components/layout/Footer';

export default function HomeClient() {
    const [showIntro, setShowIntro] = useState(true);

    return (
        <main className="relative">
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
