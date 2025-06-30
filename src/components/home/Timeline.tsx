'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lightbulb, MessageCircle, Box, PackageCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: 'Nos contás tu idea',
    icon: Lightbulb,
    description: 'Cuéntanos tu necesidad o problema y lo analizamos juntos.',
  },
  {
    title: 'Te asesoramos sin complicaciones',
    icon: MessageCircle,
    description: 'Te proponemos soluciones claras y adaptadas a tu presupuesto.',
  },
  {
    title: 'Prototipamos en 3D',
    icon: Box,
    description: 'Convertimos tu idea en un modelo físico funcional.',
  },
  {
    title: 'Entregamos el resultado final',
    icon: PackageCheck,
    description: 'Recibís tu pieza lista, en tiempo y forma.',
  },
];

export default function Timeline() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.step',
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 30%', // para mejor control al salir
            toggleActions: 'play reverse play reverse',
            once: false,
            // markers: true, // descomenta si querés ver los puntos de activación
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 bg-naranja text-negro font-garet">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white">
          ¿Cómo funciona?
        </h2>

        <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-6 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="step min-w-[260px] md:min-w-0 flex-1 bg-white p-6 rounded-xl shadow-md text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="bg-azul-oscuro text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <Icon className="mx-auto w-8 h-8 text-azul-oscuro mb-4" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-base text-negro/80">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
