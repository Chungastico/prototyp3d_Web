'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { servicesData } from '@/data/services';
import TabButton from '@/components/home/TabButton';
import ServiceCard from '@/components/home/ServicesCard';
import { Briefcase, GraduationCap, Rocket, ArrowRight } from 'lucide-react';

const tabs = ['estudiantes', 'empresas', 'emprendedores'] as const;

const iconsMap = {
  estudiantes: GraduationCap,
  empresas: Briefcase,
  emprendedores: Rocket,
};

const routesMap = {
  estudiantes: '/impresion-3d-estudiantes',
  empresas: '/impresion-3d-empresas',
  emprendedores: '/impresion-3d-emprendedores',
};

const ctaTextMap = {
  estudiantes: 'Servicios para Estudiantes',
  empresas: 'Soluciones para Empresas',
  emprendedores: 'Impulsa tu Emprendimiento',
};

export default function SectionServices() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('estudiantes');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTabClick = (tab: typeof tabs[number]) => {
    setActiveTab(tab);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Reiniciar el auto-switch después de 10s de inactividad manual
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setActiveTab((prevTab) => {
          const currentIndex = tabs.indexOf(prevTab);
          const nextIndex = (currentIndex + 1) % tabs.length;
          return tabs[nextIndex];
        });
      }, 5000);
    }, 10000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveTab((prevTab) => {
        const currentIndex = tabs.indexOf(prevTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section className="py-12 md:py-16 bg-naranja text-negro font-garet overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center text-white">
          Servicios destacados
        </h2>
        <p className="text-center text-xl sm:text-2xl text-white mb-8">¿A quién ayudamos?</p>

        {/* Improved Responsive Tab Container */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => handleTabClick(tab)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full mb-10">
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

        {/* Specific Sector CTA Button */}
        <div className="flex justify-center">
            <Link href={routesMap[activeTab]}>
                <button className="flex items-center gap-2 bg-white text-azul-oscuro border-2 border-azul-oscuro font-bold py-3 px-8 rounded-full hover:bg-azul-oscuro hover:text-white transition shadow-lg text-lg">
                    {ctaTextMap[activeTab]}
                    <ArrowRight size={20} />
                </button>
            </Link>
        </div>

        <p className="text-center mt-16 text-white text-base sm:text-lg">
          ¿Tienes un proyecto especial?{' '}
          <Link href="/contacto" className="underline hover:text-azul">
            Contáctanos
          </Link>
        </p>
      </div>
    </section>
  );
}
