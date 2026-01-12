import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { Factory, ShieldCheck, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impresión 3D para Empresas | Prototipado y Manufactura El Salvador',
  description: 'Soluciones de impresión 3D B2B en El Salvador. Prototipado rápido, lotes cortos de producción y repuestos industriales. Facturación y confidencialidad.',
  keywords: ['prototipado 3D El Salvador', 'impresión 3D industrial', 'manufactura aditiva empresas', 'lotes cortos'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/impresion-3d-empresas',
  },
};

export default function EmpresasPage() {
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
                <header className="text-center mb-12">
                     <span className="text-naranja font-bold tracking-widest uppercase text-sm mb-4 block">Soluciones B2B</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Manufactura Aditiva para <span className="text-naranja">Empresas</span>
                    </h1>
                     <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-snug">
                        Acelere su ciclo de innovación. Reduzca costos de desarrollo y lance productos al mercado más rápido con nuestro servicio de prototipado profesional.
                    </p>
                </header>

                 <div className="grid md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                        <div className="bg-naranja/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp className="text-naranja w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Validación de Diseño</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                             Pase del CAD a una pieza física funcional en horas. Detecte errores antes de invertir en moldes.
                        </p>
                    </div>
                    
                    {/* Card 2 */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                         <div className="bg-naranja/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <Factory className="text-naranja w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Lotes Cortos</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Fabricamos series de 10 a 500 unidades para test de mercado, sin mínimos de producción masiva.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                         <div className="bg-naranja/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-naranja w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Confidencialidad</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Propiedad intelectual protegida bajo estricta confidencialidad. Emitimos Facturas de Crédito Fiscal.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Secondary Section - Consulting CTA */}
        <section className="py-24 px-6 bg-white/5">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Solicite una Consultoría Técnica</h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                     Nuestros ingenieros pueden asesorarle sobre materiales (PLA, PETG, ABS, Fibra de Carbono) y optimización de diseño para manufactura aditiva.
                </p>
                 <Link href="/contacto">
                    <Button className="bg-naranja text-azul-oscuro hover:bg-white hover:text-azul-oscuro font-extrabold text-xl px-10 py-8 rounded-full shadow-2xl transition-all duration-300 shadow-naranja/10">
                        Agendar Reunión Técnica
                    </Button>
                </Link>
                <p className="mt-4 text-sm text-gray-500">Respuesta en menos de 24 horas hábiles.</p>
            </div>
        </section>

      </main>
      <Footer />
    </ScrollLayout>
  );
}
