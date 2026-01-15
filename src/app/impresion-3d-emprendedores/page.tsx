import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Rocket, Box, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impresión 3D para Emprendedores | Protipado y MVPs en El Salvador',
  description: 'Valida tu idea de negocio con prototipos rápidos y económicos. MVPs y pequeñas producciones.',
  keywords: ['MVP impresión 3D', 'prototipo de producto El Salvador', 'validar ideas de negocio'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/impresion-3d-emprendedores',
  },
};

export default function EntrepreneursPage() {
  return (
    <ScrollLayout>
      <main className="font-garet text-white bg-azul-oscuro">
        {/* Hero Section - Full Screen */}
        <section className="h-[calc(100vh-80px)] flex flex-col justify-center px-6 relative z-10 overflow-hidden">
             
             {/* Background decorators */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-naranja rounded-full blur-[120px]" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-azul-claro rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto w-full relative z-10">
                <header className="text-center mb-4 md:mb-8">
                    <span className="text-naranja font-bold tracking-widest uppercase text-xs md:text-sm mb-1 md:mb-2 block">Para Innovadores</span>
                    <h1 className="text-3xl md:text-6xl font-extrabold text-white mb-2 md:mb-4 leading-tight">
                        De la Idea a la <span className="text-naranja">Realidad</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-snug">
                        No gastes en moldes sin ventas. Crea tu <strong>MVP</strong> y valida tu mercado rápido y barato.
                    </p>
                </header>

                 <div className="grid md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                        <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                            <Rocket className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-white">Validación Rápida</h3>
                        <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
                            Lanza en días, no meses. Recibe feedback real antes de invertir en masa.
                        </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                         <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                             <RefreshCw className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-white">Iteración Ágil</h3>
                        <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
                            ¿Falló el diseño? Corrígelo e imprime de nuevo en horas. Error barato.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                         <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                            <Box className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-white">Lotes Pequeños</h3>
                        <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
                            Fabrica 10 o 50 unidades. Sin mínimos absurdos de fábrica.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-4 md:mt-8">
                     <Link href="/contacto">
                        <Button className="bg-naranja text-azul-oscuro hover:bg-white hover:text-azul-oscuro font-extrabold text-base px-6 py-3 md:px-8 md:py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-naranja/20">
                            Cotizar mi Prototipo
                        </Button>
                    </Link>
                </div>
            </div>
        </section>

        {/* Secondary Section - Use Cases / CTA */}
        <section className="py-20 px-6 bg-white/5">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8">¿Qué puedes crear?</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                     {/* Item 1: Repuestos */}
                     <div className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                        <Image 
                            src="/images/products/Engranaje.webp" 
                            alt="Repuestos Industriales" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-azul-oscuro/90 via-transparent to-transparent flex items-end p-4">
                            <h3 className="text-lg font-bold text-white">Repuestos</h3>
                        </div>
                     </div>

                     {/* Item 2: Moldes */}
                     <div className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                        <Image 
                            src="/images/products/MoldesJabon.jpg" 
                            alt="Moldes Personalizados" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-azul-oscuro/90 via-transparent to-transparent flex items-end p-4">
                            <h3 className="text-lg font-bold text-white">Moldes</h3>
                        </div>
                     </div>

                     {/* Item 3: Merch */}
                     <div className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                        <Image 
                            src="/images/products/Llavero.jpg" 
                            alt="Merch y Llaveros" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-azul-oscuro/90 via-transparent to-transparent flex items-end p-4">
                            <h3 className="text-lg font-bold text-white">Merch Único</h3>
                        </div>
                     </div>

                     {/* Item 4: Prototipos (Fallback) */}
                     <div className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                        <Image 
                            src="/images/P2S.jpg" 
                            alt="Prototipos Funcionales" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-azul-oscuro/90 via-transparent to-transparent flex items-end p-4">
                            <h3 className="text-lg font-bold text-white">Prototipos</h3>
                        </div>
                     </div>
                </div>

                 <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                    Te acompañamos en todo el proceso de diseño y fabricación para materializar tu visión.
                 </p>
                 <Link href="/proyectos">
                    <Button className="bg-azul-oscuro text-white border-2 border-white hover:bg-white hover:text-azul-oscuro font-bold text-lg px-8 py-4 rounded-full transition-all duration-300">
                      Ver Casos de Éxito
                    </Button>
                  </Link>
            </div>
        </section>

      </main>
      <Footer />
    </ScrollLayout>
  );
}
