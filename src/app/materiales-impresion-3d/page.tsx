import React from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { Leaf, ShieldCheck, Hammer } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Materiales Impresión 3D: PLA, PETG, ABS | Guía Prototyp3d',
  description: 'Descubre qué material elegir para tu impresión 3D. Guía completa sobre PLA (estándar), PETG (resistente) y ABS (mecánico). Elige el mejor para tu proyecto en El Salvador.',
  keywords: ['Materiales impresión 3D', 'PLA', 'PETG', 'ABS', 'Guía materiales 3D', 'Impresión 3D El Salvador'],
  alternates: {
    canonical: 'https://prototyp3dsv.com/materiales-impresion-3d',
  },
};

export default function MaterialsPage() {
  return (
    <ScrollLayout>
       <div className="bg-azul-oscuro min-h-screen text-white font-garet">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 text-center">
             <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-naranja/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Guía de Materiales de <span className="text-naranja">Impresión 3D</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              No todos los plásticos son iguales. Elegir el material correcto es la diferencia entre una pieza que dura años y una que se rompe al primer uso.
            </p>
          </div>
        </section>

        {/* Materials Grid */}
        <section className="py-12 px-6">
           <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
               
               {/* PLA Card */}
               <div className="bg-white text-azul-oscuro rounded-3xl overflow-hidden shadow-2xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                   <div className="bg-gradient-to-br from-green-400 to-green-600 p-8 text-white relative overflow-hidden">
                       <Leaf className="w-16 h-16 absolute -bottom-4 -right-4 opacity-20" />
                       <h2 className="text-3xl font-black">PLA</h2>
                       <p className="font-bold opacity-90">Ácido Poliláctico</p>
                   </div>
                   <div className="p-8 flex-1 flex flex-col">
                       <p className="text-gray-600 mb-6 flex-1">
                           El estándar de oro para impresiones visuales y prototipos rápidos. Biodegradable y con excelentes acabados superficiales.
                       </p>
                       <ul className="space-y-3 mb-8">
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Fácil de imprimir</li>
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Gran variedad de colores</li>
                           <li className="flex items-center gap-2 text-sm text-red-500 font-bold"><span className="w-2 h-2 rounded-full bg-red-500"/> Baja resistencia al calor (50°C)</li>
                       </ul>
                       <div className="mt-auto">
                           <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Ideal para:</p>
                           <p className="text-sm font-medium">Maquetas, figuras, decoración, prototipos no funcionales.</p>
                       </div>
                   </div>
               </div>

               {/* PETG Card */}
               <div className="bg-white text-azul-oscuro rounded-3xl overflow-hidden shadow-2xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300 ring-4 ring-naranja/20">
                   <div className="bg-gradient-to-br from-naranja to-orange-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-white text-naranja text-xs font-bold px-2 py-1 rounded-full">MÁS USADO</div>
                       <ShieldCheck className="w-16 h-16 absolute -bottom-4 -right-4 opacity-20" />
                       <h2 className="text-3xl font-black">PETG</h2>
                       <p className="font-bold opacity-90">Glicol de Etileno</p>
                   </div>
                   <div className="p-8 flex-1 flex flex-col">
                       <p className="text-gray-600 mb-6 flex-1">
                           El equilibrio perfecto. Combina la facilidad del PLA con la resistencia del ABS. Es el material "todo terreno" para ingeniería.
                       </p>
                       <ul className="space-y-3 mb-8">
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Resistente a químicos y agua</li>
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Flexible, no se quiebra fácil</li>
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Aguanta calor moderado (70°C)</li>
                       </ul>
                       <div className="mt-auto">
                           <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Ideal para:</p>
                           <p className="text-sm font-medium">Piezas mecánicas, macetas, soportes, piezas de uso final.</p>
                       </div>
                   </div>
               </div>

               {/* ABS Card */}
               <div className="bg-white text-azul-oscuro rounded-3xl overflow-hidden shadow-2xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                   <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-8 text-white relative overflow-hidden">
                       <Hammer className="w-16 h-16 absolute -bottom-4 -right-4 opacity-20" />
                       <h2 className="text-3xl font-black">ABS</h2>
                       <p className="font-bold opacity-90">Acrilonitrilo Butadieno</p>
                   </div>
                   <div className="p-8 flex-1 flex flex-col">
                       <p className="text-gray-600 mb-6 flex-1">
                           El veterano de la industria. Plástico duro y resistente, el mismo usado en los bloques de LEGO. Requiere condiciones especiales para imprimir.
                       </p>
                       <ul className="space-y-3 mb-8">
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Alta resistencia al impacto</li>
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Se puede lijar y pulir con acetona</li>
                           <li className="flex items-center gap-2 text-sm font-bold"><span className="w-2 h-2 rounded-full bg-green-500"/> Alta resistencia térmica (90°C+)</li>
                       </ul>
                       <div className="mt-auto">
                           <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Ideal para:</p>
                           <p className="text-sm font-medium">Piezas automotrices, carcasas electrónicas, ambientes calientes.</p>
                       </div>
                   </div>
               </div>

           </div>
        </section>

        {/* Quick Comparison Table */}
        <section className="py-20 px-6 bg-white/5">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">Comparativa Rápida</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-4 text-gray-400 font-medium">Propiedad</th>
                                <th className="p-4 text-green-400 font-bold">PLA</th>
                                <th className="p-4 text-naranja font-bold">PETG</th>
                                <th className="p-4 text-gray-300 font-bold">ABS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            <tr>
                                <td className="p-4 font-bold">Resistencia Calor</td>
                                <td className="p-4">Baja</td>
                                <td className="p-4">Media</td>
                                <td className="p-4">Alta</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold">Fuerza</td>
                                <td className="p-4">Media</td>
                                <td className="p-4">Alta</td>
                                <td className="p-4">Alta</td>
                            </tr>
                             <tr>
                                <td className="p-4 font-bold">Uso Exteriores</td>
                                <td className="p-4">No</td>
                                <td className="p-4">Sí</td>
                                <td className="p-4">Sí</td>
                            </tr>
                             <tr>
                                <td className="p-4 font-bold">Precio</td>
                                <td className="p-4">$</td>
                                <td className="p-4">$$</td>
                                <td className="p-4">$$</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

         {/* CTA Section */}
         <section className="py-24 px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Aún no sabes cuál elegir?</h2>
            <p className="text-xl text-gray-300 mb-8">
                No te preocupes, nosotros te asesoramos gratis según tu proyecto.
            </p>
            <Link href="/contacto">
                <Button className="bg-naranja text-azul-oscuro hover:bg-white hover:text-azul-oscuro font-extrabold text-lg px-8 py-6 rounded-full transition-all">
                   Consultar con un Experto
                </Button>
            </Link>
        </section>

       </div>
       <Footer />
    </ScrollLayout>
  );
}
