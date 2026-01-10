import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Proyectos y Casos de Éxito | Impresión 3D El Salvador',
  description: 'Mira lo que hemos fabricado. Desde maquetas universitarias hasta repuestos industriales y regalos personalizados. Tu proyecto podría ser el próximo.',
  keywords: ['Casos reales impresión 3D', 'maquetas 3D El Salvador', 'piezas funcionales', 'portafolio impresión 3D'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/proyectos',
  },
};

export default function ProjectsPage() {
    // Placeholder projects - In future connect to DB
    const categories = [
        { id: 'maquetas', name: 'Maquetas' },
        { id: 'ingenieria', name: 'Ingeniería' },
        { id: 'arte', name: 'Arte & Decoración' },
    ];

    const projects = [
        {
             title: "Maqueta Urbana",
             category: "Maquetas",
             desc: "Edificios a escala 1:100 para tesis de arquitectura.",
             image: "/images/hero/hero_bambu.png" // Placeholder
        },
        {
             title: "Engranaje Industrial",
             category: "Ingeniería",
             desc: "Repuesto en Nylon CF para maquinaria textil.",
             image: "/images/hero/hero_bambu.png" // Placeholder
        },
        {
             title: "Trofeo Personalizado",
             category: "Arte & Decoración",
             desc: "Diseño único y pintado a mano para torneo eSports.",
             image: "/images/hero/hero_bambu.png" // Placeholder
        },
         {
             title: "Prototipo IoT",
             category: "Ingeniería",
             desc: "Carcasa para sensor inteligente validada con clientes.",
             image: "/images/hero/hero_bambu.png" // Placeholder
        }
    ];

  return (
    <ScrollLayout>
       <div className="bg-azul-oscuro min-h-screen text-white font-garet">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Nuestros <span className="text-naranja">Proyectos</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              La calidad habla por sí misma. Explora algunos de los retos que hemos convertido en realidad.
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Filters (Visual only for now) */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                     <Button variant="secondary" className="bg-naranja text-azul-oscuro hover:bg-white font-bold rounded-full">Todos</Button>
                     {categories.map(cat => (
                         <Button key={cat.id} variant="ghost" className="text-white hover:text-naranja hover:bg-white/10 rounded-full font-bold">
                             {cat.name}
                         </Button>
                     ))}
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, idx) => (
                        <div key={idx} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-naranja/50 transition-all hover:shadow-2xl hover:shadow-naranja/10">
                            <div className="aspect-square relative overflow-hidden bg-white/10">
                                {/* Placeholder Gradient or Generic Image if available */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 flex items-center justify-center text-white/20 font-black text-6xl select-none">3D</div>
                                {/* <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> */} 
                            </div>
                            <div className="p-6">
                                <span className="text-naranja text-xs font-bold uppercase tracking-wider mb-2 block">{project.category}</span>
                                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                <p className="text-gray-400 text-sm">{project.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold mb-6">¿Tienes un proyecto en mente?</h3>
                    <Link href="/contacto">
                         <Button className="bg-white text-azul-oscuro hover:bg-naranja hover:text-azul-oscuro font-extrabold text-lg px-8 py-6 rounded-full transition-all">
                             Hacerlo Realidad
                         </Button>
                    </Link>
                </div>
            </div>
        </section>
       </div>
       <Footer />
    </ScrollLayout>
  );
}
