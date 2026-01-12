import React from 'react';
import { Metadata } from 'next';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Lightbulb, Rocket, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Prototyp3D - Expertos en Impresión 3D',
  description: 'Conoce a Prototyp3D, tu aliado en manufactura aditiva y diseño digital en San Salvador. Apoyamos a estudiantes, emprendedores e industrias.',
};

export default function AboutPage() {
  return (
    <ScrollLayout>
      <main className="font-garet text-white bg-azul-oscuro">
        <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-20 px-6 relative overflow-hidden">
            
             {/* Background decorators */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-naranja rounded-full blur-[120px]" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-azul-claro rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto w-full relative z-10">
                <header className="text-center mb-20">
                    <span className="text-naranja font-bold tracking-widest uppercase text-sm mb-4 block">Nuestra Esencia</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8">
                       Sobre Prototyp3D
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                      Somos un estudio de fabricación digital ubicado en <span className="text-naranja font-bold">San Salvador</span>. Nacimos para democratizar el acceso a la manufactura aditiva, eliminando las barreras de costos y complejidad para estudiantes, emprendedores e industrias.
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1: Misión */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300 group">
                        <div className="bg-naranja/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-naranja group-hover:scale-110 transition-transform">
                            <Rocket size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
                        <p className="text-gray-400 leading-relaxed">
                           Impulsar la innovación local proporcionando servicios de impresión 3D rápidos, accesibles y de calidad industrial. Hacemos tangible lo intangible.
                        </p>
                    </div>

                    {/* Card 2: Tecnología */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300 group">
                        <div className="bg-naranja/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-naranja group-hover:scale-110 transition-transform">
                            <Lightbulb size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Tecnología</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Contamos con una granja de impresoras de última generación (Bambu Lab, Elegoo Saturn) para garantizar precisión dimensional y acabados superiores.
                        </p>
                    </div>

                    {/* Card 3: Servicio */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300 group">
                        <div className="bg-naranja/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-naranja group-hover:scale-110 transition-transform">
                             <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Compromiso</h2>
                        <p className="text-gray-400 leading-relaxed">
                            No solo imprimimos; asesoramos. Desde la optimización del diseño (DFM) hasta la selección del material ideal para tu aplicación.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
