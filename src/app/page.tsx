'use client';

import Services from '@/components/home/SectionServices';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import ScrollLayout from '../components/layout/ScrollLayout';
import IntroTransition from '../components/home/IntroTransition'; 

export default function Home() {
    const [introFinished, setIntroFinished] = useState(false);

    return (
        <main className="relative">
            {!introFinished && <IntroTransition onFinish={() => setIntroFinished(true)} />}

            {introFinished && (
                <ScrollLayout>
                    <Navbar />
                    <Hero />
                    <Services />
                </ScrollLayout>
            )}
        </main>
    );
}
