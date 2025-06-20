'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ScrollLayout from '../components/ScrollLayout';
import IntroTransition from '../components/IntroTransition'; // nuevo

export default function Home() {
    const [introFinished, setIntroFinished] = useState(false);

    return (
        <main className="relative">
            {!introFinished && <IntroTransition onFinish={() => setIntroFinished(true)} />}

            {introFinished && (
                <ScrollLayout>
                    <Navbar />
                    <Hero />
                    {/* Aquí podés seguir agregando tus otras secciones */}
                </ScrollLayout>
            )}
        </main>
    );
}
