'use client';

import { useState } from 'react';
import { servicesData } from '@/data/services';
import TabButton from '@/components/home/TabButton';
import ServiceCard from '@/components/home/ServicesCard';
import { Briefcase, GraduationCap, Rocket } from 'lucide-react';

const tabs = ['estudiantes', 'empresas', 'emprendedores'] as const;

const iconsMap = {
    estudiantes: GraduationCap,
    empresas: Briefcase,
    emprendedores: Rocket,
};

export default function ServicesTabs() {
    const [activeTab, setActiveTab] = useState<typeof tabs[number]>('estudiantes');

    return (
        <section className="py-20 bg-naranja text-negro font-garet overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-md text-azul mb-2">¿A quién ayudamos?</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-azul-oscuro">Servicios destacados</h2>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-10 overflow-x-auto pb-2">
            {tabs.map((tab) => (
                <TabButton
                key={tab}
                label={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                />
            ))}
            </div>

            {/* Servicios */}
            <div className="grid md:grid-cols-2 gap-6">
            {servicesData[activeTab].map((service, index) => (
                <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={iconsMap[activeTab]}
                index={index}
                />
            ))}
            </div>

            <p className="text-center mt-10 text-azul-oscuro">
            ¿Tienes un proyecto especial?{' '}
            <a href="/contacto" className="underline hover:text-azul">
                Contáctanos
            </a>
            </p>
        </div>
        </section>
    );
}
