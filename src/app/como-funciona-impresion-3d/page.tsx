import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { Lightbulb, FileCode, Printer, Box } from 'lucide-react';

export const metadata: Metadata = {
  title: '¿Cómo funciona la Impresión 3D? | Pasos desde tu Idea hasta la Pieza',
  description: 'Aprende los 4 pasos simples para imprimir en 3D con Prototyp3d: Idea, Diseño 3D, Impresión y Entrega. Ideal para principiantes en El Salvador.',
  keywords: ['Cómo funciona impresión 3D', 'proceso impresión 3D', 'pasos imprimir 3d', 'servicio impresión 3d el salvador'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/como-funciona-impresion-3d',
  },
};

export default function HowItWorksPage() {
    const steps = [
        {
            icon: <Lightbulb className="w-12 h-12 text-naranja" />,
            title: "1. La Idea",
            desc: "Todo empieza contigo. Puede ser un dibujo en una servilleta, una foto de referencia, o un archivo que encontraste en sitios como Thingiverse o Cults3D.",
            action: "¿Tienes una idea?",
            link: "/contacto",
            linkText: "Escríbenos"
        },
        {
            icon: <FileCode className="w-12 h-12 text-azul-claro" />,
            title: "2. Diseño 3D (CAD)",
            desc: "Si no tienes el archivo 3D, nosotros lo creamos. Usamos software de ingeniería para modelar tu pieza con las medidas exactas que necesitas.",
            action: "Ver Servicios de Diseño",
            link: "/servicios",
            linkText: "Diseño CAD"
        },
        {
            icon: <Printer className="w-12 h-12 text-naranja" />,
            title: "3. Impresión (Slicing & Print)",
            desc: "Preparamos el archivo y nuestras impresoras comienzan a depositar material capa por capa. Dependiendo del tamaño, esto toma desde horas hasta días.",
            action: "Ver Materiales",
            link: "/materiales-impresion-3d",
            linkText: "Guía de Materiales"
        },
        {
            icon: <Box className="w-12 h-12 text-azul-claro" />,
            title: "4. Post-procesado y Entrega",
            desc: "Limpiamos la pieza, removemos soportes y, si es necesario, lijamos o pintamos. ¡Listo! Te la enviamos a cualquier parte de El Salvador.",
            action: "¿Listo para empezar?",
            link: "/contacto",
            linkText: "Cotizar Ahora"
        }
    ];

  return (
    <ScrollLayout>
       <div className="bg-azul-oscuro min-h-screen text-white font-garet">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="text-naranja font-bold tracking-widest text-sm uppercase mb-4 block">Para principiantes</span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
              ¿Cómo funciona la <br /><span className="text-white">impresión 3D?</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Parece magia, pero es tecnología. Convertimos archivos digitales en objetos físicos, capa por capa. Aquí te explicamos el proceso.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="relative">
                    {/* Vertical Line for Desktop */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2" />

                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col md:flex-row items-center gap-8 mb-16 relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                            
                            {/* Dot on line */}
                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-azul-oscuro border-4 border-naranja rounded-full z-10 items-center justify-center font-bold text-xs">
                                {index + 1}
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-naranja/30 transition-all">
                                <div className="mb-4 bg-azul-oscuro/50 w-20 h-20 rounded-full flex items-center justify-center border border-white/10 mx-auto md:mx-0">
                                    {step.icon}
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-center md:text-left">{step.title}</h2>
                                <p className="text-gray-400 mb-6 text-center md:text-left">
                                    {step.desc}
                                </p>
                                <div className="text-sm font-bold text-center md:text-left">
                                    <span className="text-gray-500 mr-2">{step.action}</span>
                                    <Link href={step.link} className="text-naranja hover:underline">
                                        {step.linkText} &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Spacer Side */}
                            <div className="w-full md:w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FAQ Section (Simple) */}
        <section className="py-20 px-6 bg-white/5">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-10">Preguntas Frecuentes</h2>
                 <div className="grid gap-6 text-left">
                     <div className="p-6 bg-azul-oscuro rounded-xl border border-white/10">
                         <h3 className="font-bold text-lg mb-2">¿Es muy caro?</h3>
                         <p className="text-gray-400">Depende del peso y tiempo. Piezas pequeñas pueden costar desde $5-$10. ¡Cotizar es gratis!</p>
                     </div>
                     <div className="p-6 bg-azul-oscuro rounded-xl border border-white/10">
                         <h3 className="font-bold text-lg mb-2">¿Qué archivos necesito?</h3>
                         <p className="text-gray-400">Usamos archivos .STL o .OBJ. Si no los tienes, nuestro servicio de diseño puede crearlos por ti.</p>
                     </div>
                 </div>
            </div>
        </section>
       </div>
       <Footer />
    </ScrollLayout>
  );
}
