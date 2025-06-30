'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function SectionServices() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('estudiantes');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextTab();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeTab]);

  const handleTabClick = (tab: typeof tabs[number]) => {
    setActiveTab(tab);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        nextTab();
      }, 5000);
    }, 10000);
  };

  return (
    <section className="py-12 md:py-16 bg-naranja text-negro font-garet overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xl sm:text-2xl text-white mb-2">¿A quién ayudamos?</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center text-white">
          Servicios destacados
        </h2>

        <div className="flex justify-center gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-naranja-light scrollbar-track-naranja-dark">
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => handleTabClick(tab)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6 md:gap-y-6 max-w-5xl mx-auto w-full px-1 sm:px-2">
          {servicesData[activeTab].map((service, index) => {
            const IconComp = iconsMap[activeTab];
            return (
              <ServiceCard
                key={`${activeTab}-${index}`}
                title={service.title}
                description={service.description}
                icon={IconComp}
                index={index}
              />
            );
          })}
        </div>

        <p className="text-center mt-10 text-white text-base sm:text-lg">
          ¿Tienes un proyecto especial?{' '}
          <a href="/contacto" className="underline hover:text-azul">
            Contáctanos
          </a>
        </p>
      </div>
    </section>
  );
}
