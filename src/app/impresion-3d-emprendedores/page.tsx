import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { Rocket, Box, RefreshCw, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impresión 3D para Emprendedores | Protipado y MVPs en El Salvador',
  description: 'Valida tu idea de negocio con prototipos rápidos y económicos. Impresión 3D para emprendedores en El Salvador: MVPs, pequeñas producciones y diseño iterativo.',
  keywords: ['MVP impresión 3D', 'prototipo de producto El Salvador', 'validar ideas de negocio', 'pequeñas producciones 3D', 'diseño iterativo'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/impresion-3d-emprendedores',
  },
};

export default function EntrepreneursPage() {
  return (
    <ScrollLayout>
      <div className="bg-azul-oscuro min-h-screen text-white font-garet">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center pt-24 px-6 overflow-hidden">
             {/* Background decorators */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-naranja rounded-full blur-[120px]" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-azul-claro rounded-full blur-[100px]" />
            </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-naranja/20 text-naranja text-sm font-bold mb-6 border border-naranja/50">
              PARA INNOVADORES
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              De la Idea a la Realidad:<br />
              <span className="text-naranja">Valida tu Producto Hoy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light">
              No gastes miles en moldes sin saber si venderás. Creamos tu <strong>MVP (Producto Mínimo Viable)</strong> con impresión 3D para que valides tu mercado rápido y barato.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto">
                <Button className="bg-naranja text-azul-oscuro hover:bg-white hover:text-azul-oscuro font-extrabold text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-naranja/20">
                  Cotizar mi Prototipo
                </Button>
              </Link>
              <Link href="/proyectos">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-azul-oscuro font-bold text-lg px-8 py-6 rounded-full transition-all duration-300">
                  Ver Casos de Éxito
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why 3D Printing for Entrepreneurs? */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">¿Por qué usar Impresión 3D?</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                La herramienta secreta de las startups ágiles en El Salvador.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Rocket className="w-10 h-10 text-naranja" />,
                  title: "Validación Rápida",
                  desc: "Lanza tu producto al mercado en días, no meses. Recibe feedback real de tus clientes antes de invertir en producción masiva."
                },
                {
                  icon: <RefreshCw className="w-10 h-10 text-azul-claro" />,
                  title: "Iteración Ágil",
                  desc: "¿No encajó a la primera? Ajustamos el diseño digital y volvemos a imprimir en horas. El costo de error es mínimo."
                },
                {
                    icon: <Box className="w-10 h-10 text-naranja" />,
                    title: "Pequeñas Producciones",
                    desc: "Fabrica solo lo que vendes. Lotes de 10, 50 o 100 unidades sin mínimos absurdos ni costos de almacenamiento."
                },
                {
                    icon: <Zap className="w-10 h-10 text-azul-claro" />,
                    title: "Personalización",
                    desc: "Crea productos únicos adaptados a cada cliente. La impresión 3D permite geometrías que los moldes tradicionales no pueden."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-naranja/50 transition-colors duration-300">
                  <div className="mb-6 bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-naranja to-orange-600 rounded-2xl p-1">
                 <div className="bg-azul-oscuro rounded-xl p-8 h-full">
                     <h3 className="text-2xl font-bold mb-6">De la Servilleta al Producto</h3>
                     <ul className="space-y-4">
                         <li className="flex items-start gap-3">
                             <div className="mt-1 w-2 h-2 rounded-full bg-naranja flex-shrink-0" />
                             <p><strong className="text-white">Fase 1: Boceto & Diseño 3D.</strong> Nos traes tu idea (incluso en papel) y nosotros la modelamos en 3D.</p>
                         </li>
                         <li className="flex items-start gap-3">
                             <div className="mt-1 w-2 h-2 rounded-full bg-naranja flex-shrink-0" />
                             <p><strong className="text-white">Fase 2: Prototipo Funcional.</strong> Imprimimos una versión de prueba en material económico para verificar forma y función.</p>
                         </li>
                         <li className="flex items-start gap-3">
                             <div className="mt-1 w-2 h-2 rounded-full bg-naranja flex-shrink-0" />
                             <p><strong className="text-white">Fase 3: Producto Final.</strong> Fabricamos el lote inicial en materiales de alta calidad y acabados premium.</p>
                         </li>
                     </ul>
                 </div>
                </div>
            </div>
             <div className="w-full md:w-1/2 text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">¿Qué puedes crear?</h2>
              <p className="text-lg text-gray-300 mb-8">
                Desde carcasas para electrónica IoT, soportes personalizados, moldes para joyería, hasta piezas de repuesto para maquinaria que ya no se fabrican.
              </p>
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg text-center font-bold text-naranja border border-naranja/20">Carcasas IoT</div>
                  <div className="p-4 bg-white/5 rounded-lg text-center font-bold text-azul-claro border border-azul-claro/20">Moldes</div>
                  <div className="p-4 bg-white/5 rounded-lg text-center font-bold text-white border border-white/20">Merch Único</div>
                  <div className="p-4 bg-white/5 rounded-lg text-center font-bold text-white border border-white/20">Repuestos</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-naranja text-azul-oscuro text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6">¿Listo para validar tu idea?</h2>
            <p className="text-xl md:text-2xl font-medium mb-10 text-azul-oscuro/80">
              No dejes que tu idea se quede en tu mente. Fabrícala y véndela.
            </p>
            <Link href="https://wa.me/50376004664?text=Hola,%20soy%20emprendedor%20y%20quiero%20validar%20una%20idea%20con%20impresi%C3%B3n%203D" target="_blank">
              <Button className="bg-azul-oscuro text-white hover:bg-white hover:text-azul-oscuro font-extrabold text-xl px-10 py-8 rounded-full shadow-2xl transition-all duration-300">
                Contactar por WhatsApp
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </ScrollLayout>
  );
}
