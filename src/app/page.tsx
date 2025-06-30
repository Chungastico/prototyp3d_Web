'use client';

import Services from '@/components/home/SectionServices';
import { useState } from 'react';
import Hero from '../components/home/Hero';
import ScrollLayout from '../components/layout/ScrollLayout';
import IntroTransition from '../components/home/IntroTransition'; 
import Timeline from '../components/home/Timeline';
import Footer from '@/components/layout/Footer';

export default function Home() {
    const [introFinished, setIntroFinished] = useState(false);

    return (
        <main className="relative">
        {!introFinished && <IntroTransition onFinish={() => setIntroFinished(true)} />}

        {introFinished && (
            <ScrollLayout>
                <Hero />
                <Services />
                <Timeline />
                <Footer />
            </ScrollLayout>
        )}
        </main>
    );
}
